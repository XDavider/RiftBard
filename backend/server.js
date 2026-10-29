import express from 'express';
import cors from 'cors';
import pool from './db.js';
import { syncCards } from './seed.js';
import path from 'path';
import { fileURLToPath } from 'url';

import crypto from 'crypto';

// Ensure user_manual_sales table and featured column exist
pool.query(`
  CREATE TABLE IF NOT EXISTS user_manual_sales (
    card_id VARCHAR(255) PRIMARY KEY REFERENCES cards(id) ON UPDATE CASCADE ON DELETE CASCADE,
    on_sale BOOLEAN DEFAULT true,
    sale_total INTEGER DEFAULT 1,
    featured BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
  ALTER TABLE user_manual_sales ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
`).catch(err => console.warn('Could not ensure featured column in user_manual_sales:', err.message));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Whitelist-based CORS configuration
const ALLOWED_ORIGIN_REGEX = /^https:\/\/riftbard(-[a-z0-9-]+)?\.vercel\.app$/;
const corsOptions = {
  origin: (origin, callback) => {
    // Permit requests without origin (cURL, mobile webview, same-origin/internal proxy)
    if (!origin) return callback(null, true);
    if (
      origin.includes('localhost') ||
      origin.includes('127.0.0.1') ||
      origin.startsWith('http://192.168.') ||
      origin.startsWith('http://10.') ||
      origin.startsWith('http://172.') ||
      origin === 'https://riftbard.vercel.app' ||
      ALLOWED_ORIGIN_REGEX.test(origin) ||
      (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL)
    ) {
      return callback(null, true);
    }
    return callback(new Error('Bloqueado por política CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// URL normalization middleware for Vercel Serverless & proxies:
// If Vercel rewrites without the '/api' prefix, prepend '/api' so all registered routes match seamlessly.
app.use((req, res, next) => {
  if (!req.url.startsWith('/api') && !req.url.startsWith('/api/')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }
  next();
});

// GET /api/health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', server: 'RiftBard Vault API', timestamp: Date.now() });
});

const PORT = process.env.PORT || 3001;

// --- CARETAKER'S VAULT SECURITY ---
const VAULT_USERNAME = (process.env.VAULT_USERNAME || 'XDavider').trim().toLowerCase();
const VAULT_SECRET = process.env.VAULT_PASSWORD;
// Derive consistent secret so serverless cold starts never invalidate sessions
const TOKEN_SECRET = process.env.JWT_SECRET || (VAULT_SECRET ? VAULT_SECRET + '_vault_salt_secure' : 'riftbard_vault_static_secret_seed_2026');

// Rate limiting against login brute-force attacks (in-memory per client IP)
const loginAttempts = new Map();
const MAX_LOGIN_ATTEMPTS = 10;
const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

function checkLoginRateLimit(ip) {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  if (!record) return { blocked: false };
  if (record.blockedUntil && record.blockedUntil > now) {
    const minutesLeft = Math.ceil((record.blockedUntil - now) / 60000);
    return { blocked: true, minutesLeft };
  }
  if (now - record.firstAttempt > LOGIN_WINDOW_MS) {
    loginAttempts.delete(ip);
    return { blocked: false };
  }
  return { blocked: false };
}

function recordLoginFailure(ip) {
  const now = Date.now();
  const record = loginAttempts.get(ip) || { count: 0, firstAttempt: now, blockedUntil: 0 };
  record.count += 1;
  if (record.count >= MAX_LOGIN_ATTEMPTS) {
    record.blockedUntil = now + LOGIN_WINDOW_MS;
  }
  loginAttempts.set(ip, record);
}

function clearLoginAttempts(ip) {
  loginAttempts.delete(ip);
}

// SHA-256 fallback hash to verify owner without exposing plaintext password in repository
const DEFAULT_PASSWORD_HASH = '7084ce5c836661e05415575f7fa1c2ce3ce6a5cc28f30560392329fee5329e94';

function isPasswordValid(inputPassword) {
  if (!inputPassword) return false;
  const trimmed = String(inputPassword).trim();
  if (VAULT_SECRET && trimmed === String(VAULT_SECRET).trim()) {
    return true;
  }
  const inputHash = crypto.createHash('sha256').update(trimmed).digest('hex');
  return inputHash === DEFAULT_PASSWORD_HASH;
}

function isUsernameValid(inputUsername) {
  if (!inputUsername) return false;
  return String(inputUsername).trim().toLowerCase() === VAULT_USERNAME;
}

function generateToken(payload = {}) {
  const tokenPayload = {
    auth: true,
    iat: Date.now(),
    exp: Date.now() + 90 * 24 * 60 * 60 * 1000, // 90 days
    ...payload
  };
  const payloadBase64 = Buffer.from(JSON.stringify(tokenPayload)).toString('base64url');
  const signature = crypto.createHmac('sha256', TOKEN_SECRET).update(payloadBase64).digest('base64url');
  return `${payloadBase64}.${signature}`;
}

function verifyToken(token) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payloadBase64, signature] = parts;
  const expectedSig = crypto.createHmac('sha256', TOKEN_SECRET).update(payloadBase64).digest('base64url');
  if (signature !== expectedSig) return null;
  try {
    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString('utf8'));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

// POST /api/auth/login (Owner Login: requires username and password)
app.post('/api/auth/login', (req, res) => {
  const ip = getClientIp(req);
  const rateLimit = checkLoginRateLimit(ip);
  if (rateLimit.blocked) {
    return res.status(429).json({ 
      success: false, 
      error: `Demasiados intentos fallidos. Inténtalo de nuevo en ${rateLimit.minutesLeft} minuto(s).` 
    });
  }

  const { username, password } = req.body || {};

  if (!isUsernameValid(username) || !isPasswordValid(password)) {
    recordLoginFailure(ip);
    return res.status(401).json({ success: false, error: 'Usuario o contraseña incorrectos' });
  }

  clearLoginAttempts(ip);
  const token = generateToken({ role: 'owner', username: 'XDavider' });
  res.json({ success: true, token, role: 'owner', username: 'XDavider' });
});

// POST /api/auth/guest (Guest Access: creates isolated guest session)
app.post('/api/auth/guest', (req, res) => {
  const token = generateToken({ role: 'guest', username: 'Invitado' });
  res.json({ success: true, token, role: 'guest', username: 'Invitado' });
});

// GET /api/auth/verify
app.get('/api/auth/verify', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const payload = verifyToken(token);

  if (payload) {
    return res.json({ 
      valid: true, 
      role: payload.role || 'owner', 
      username: payload.username || (payload.role === 'guest' ? 'Invitado' : 'XDavider') 
    });
  }
  res.status(401).json({ valid: false, error: 'Token inválido o expirado' });
});

// Vault Auth Protection Middleware: intercepts all subsequent /api routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api/auth') || req.path === '/api/health' || req.path.startsWith('/api/public')) {
    return next();
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const user = verifyToken(token);

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized: Bóveda bloqueada' });
  }

  req.user = user;
  next();
});

// POST /api/sync & POST /api/sync-cards
const handleSyncCards = async (req, res) => {
  if (req.user && req.user.role === 'guest') {
    return res.status(403).json({ success: false, error: 'Acción no permitida en modo invitado' });
  }
  try {
    console.log('Received card synchronization request from client...');
    const result = await syncCards(false);
    res.json({ 
      success: true, 
      message: `¡Base de datos sincronizada con éxito con RiftHunt! (${result.count} cartas)`,
      count: result.count 
    });
  } catch (err) {
    console.error('Error during card sync:', err);
    res.status(500).json({ success: false, error: err.message || 'Error durante la sincronización' });
  }
};

app.post('/api/sync', handleSyncCards);
app.post('/api/sync-cards', handleSyncCards);

// GET /api/tags
app.get('/api/tags', async (req, res) => {
  try {
    const result = await pool.query('SELECT tags FROM cards WHERE tags IS NOT NULL AND tags != \'\'');
    const allTags = new Set();
    result.rows.forEach(row => {
      row.tags.split(',').forEach(t => allTags.add(t.trim()));
    });
    const sortedTags = Array.from(allTags).sort();
    res.json(sortedTags);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/cards
app.get('/api/cards', async (req, res) => {
  try {
    const { type, cost, rarity, search, domain, tag } = req.query;
    
    let query = 'SELECT * FROM cards WHERE 1=1';
    let values = [];
    let count = 1;

    if (type) {
      const typeArray = type.split(',').map(t => `%${t.trim()}%`);
      query += ` AND (`;
      for (let i = 0; i < typeArray.length; i++) {
        if (i > 0) query += ` OR `;
        query += `card_type ILIKE $${count}`;
        values.push(typeArray[i]);
        count++;
      }
      query += `)`;
    }
    if (cost) {
      query += ` AND energy_cost = $${count}`;
      values.push(parseInt(cost));
      count++;
    }
    if (rarity) {
      query += ` AND rarity ILIKE $${count}`;
      values.push(`%${rarity}%`);
      count++;
    }
    if (search) {
      query += ` AND name ILIKE $${count}`;
      values.push(`%${search}%`);
      count++;
    }
    if (domain) {
      const domainArray = domain.split(',').map(d => `%${d.trim()}%`);
      query += ` AND (`;
      for (let i = 0; i < domainArray.length; i++) {
        if (i > 0) query += ` OR `;
        query += `element ILIKE $${count}`;
        values.push(domainArray[i]);
        count++;
      }
      query += `)`;
    }
    if (tag) {
      const tagArray = tag.split(',').map(t => `%${t.trim()}%`);
      query += ` AND (`;
      for (let i = 0; i < tagArray.length; i++) {
        if (i > 0) query += ` OR `;
        query += `tags ILIKE $${count}`;
        values.push(tagArray[i]);
        count++;
      }
      query += `)`;
    }

    query += ' ORDER BY name ASC';

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/collection
app.get('/api/collection', async (req, res) => {
  if (req.user && req.user.role === 'guest') {
    return res.json([]);
  }
  try {
    const query = `
      SELECT c.*, uc.normal_count, uc.foil_count 
      FROM cards c
      INNER JOIN user_collection uc ON c.id = uc.card_id
      WHERE uc.normal_count > 0 OR uc.foil_count > 0
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/collection/update
app.post('/api/collection/update', async (req, res) => {
  const { card_id, normal_count, foil_count } = req.body;
  
  if (!card_id) {
    return res.status(400).json({ error: 'card_id is required' });
  }

  if (req.user && req.user.role === 'guest') {
    return res.json({ success: true, guest: true, card_id, normal_count, foil_count });
  }

  try {
    let finalNormal = normal_count || 0;
    let finalFoil = foil_count || 0;

    const cardRes = await pool.query('SELECT rarity, card_type FROM cards WHERE id = $1', [card_id]);
    if (cardRes.rows.length > 0) {
      const r = (cardRes.rows[0].rarity || '').toLowerCase();
      const t = (cardRes.rows[0].card_type || '').toLowerCase();
      const isAlwaysFoil = r === 'rare' || r === 'epic' || r === 'legendary' || r === 'legend' || r === 'showcase' || r === 'promo' || t === 'legend';
      if (isAlwaysFoil) {
        finalFoil = finalFoil + finalNormal;
        finalNormal = 0;
      }
    }

    const query = `
      INSERT INTO user_collection (card_id, normal_count, foil_count, updated_at)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      ON CONFLICT (card_id) DO UPDATE SET
        normal_count = EXCLUDED.normal_count,
        foil_count = EXCLUDED.foil_count,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;
    const result = await pool.query(query, [card_id, finalNormal, finalFoil]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/collection/batch
app.post('/api/collection/batch', async (req, res) => {
  const { items } = req.body;
  if (!items || !Array.isArray(items)) {
    return res.status(400).json({ error: 'items array is required' });
  }

  if (req.user && req.user.role === 'guest') {
    return res.json({ success: true, guest: true, count: items.length });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    for (const item of items) {
      const { card_id, normal_count, foil_count } = item;
      if (!card_id) continue;
      
      let finalNormal = normal_count || 0;
      let finalFoil = foil_count || 0;

      const cardRes = await client.query('SELECT rarity, card_type FROM cards WHERE id = $1', [card_id]);
      if (cardRes.rows.length > 0) {
        const r = (cardRes.rows[0].rarity || '').toLowerCase();
        const t = (cardRes.rows[0].card_type || '').toLowerCase();
        const isAlwaysFoil = r === 'rare' || r === 'epic' || r === 'legendary' || r === 'legend' || r === 'showcase' || r === 'promo' || t === 'legend';
        if (isAlwaysFoil) {
          finalFoil = finalFoil + finalNormal;
          finalNormal = 0;
        }
      }

      const query = `
        INSERT INTO user_collection (card_id, normal_count, foil_count, updated_at)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
        ON CONFLICT (card_id) DO UPDATE SET
          normal_count = EXCLUDED.normal_count,
          foil_count = EXCLUDED.foil_count,
          updated_at = CURRENT_TIMESTAMP
      `;
      await client.query(query, [card_id, finalNormal, finalFoil]);
    }
    
    await client.query('COMMIT');
    res.json({ success: true, count: items.length });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    client.release();
  }
});

// GET /api/sales/manual (Owner: get saved manual sales)
app.get('/api/sales/manual', async (req, res) => {
  if (req.user && req.user.role === 'guest') {
    return res.json({});
  }
  try {
    const result = await pool.query('SELECT card_id, on_sale, sale_total, featured FROM user_manual_sales');
    const map = {};
    result.rows.forEach(r => {
      map[r.card_id] = { onSale: r.on_sale, saleTotal: r.sale_total, featured: Boolean(r.featured) };
    });
    res.json(map);
  } catch (err) {
    console.error('Error fetching manual sales:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/sales/manual (Owner: upsert manual sale setting)
app.post('/api/sales/manual', async (req, res) => {
  if (req.user && req.user.role === 'guest') {
    return res.status(403).json({ error: 'Acción no permitida en modo invitado' });
  }
  const { card_id, on_sale, sale_total, featured } = req.body;
  if (!card_id) {
    return res.status(400).json({ error: 'card_id is required' });
  }
  try {
    const isFeatured = featured !== undefined ? Boolean(featured) : false;
    const query = `
      INSERT INTO user_manual_sales (card_id, on_sale, sale_total, featured, updated_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      ON CONFLICT (card_id) DO UPDATE SET
        on_sale = EXCLUDED.on_sale,
        sale_total = EXCLUDED.sale_total,
        featured = EXCLUDED.featured,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;
    const result = await pool.query(query, [card_id, Boolean(on_sale), Math.max(1, parseInt(sale_total) || 1), isFeatured]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error saving manual sale:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/sales/manual/batch (Owner: batch sync manual sales)
app.post('/api/sales/manual/batch', async (req, res) => {
  if (req.user && req.user.role === 'guest') {
    return res.status(403).json({ error: 'Acción no permitida en modo invitado' });
  }
  const { sales } = req.body;
  if (!sales || typeof sales !== 'object') {
    return res.status(400).json({ error: 'sales object is required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const entries = Object.entries(sales);
    for (const [card_id, data] of entries) {
      if (!card_id) continue;
      const onSale = Boolean(data.onSale ?? data.on_sale);
      const saleTotal = Math.max(1, parseInt(data.saleTotal ?? data.sale_total) || 1);
      const isFeatured = Boolean(data.featured);
      await client.query(`
        INSERT INTO user_manual_sales (card_id, on_sale, sale_total, featured, updated_at)
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
        ON CONFLICT (card_id) DO UPDATE SET
          on_sale = EXCLUDED.on_sale,
          sale_total = EXCLUDED.sale_total,
          featured = EXCLUDED.featured,
          updated_at = CURRENT_TIMESTAMP
      `, [card_id, onSale, saleTotal, isFeatured]);
    }
    await client.query('COMMIT');
    res.json({ success: true, count: entries.length });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error batch updating manual sales:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    client.release();
  }
});

// GET /api/public/sale (Public: accessible without login)
app.get('/api/public/sale', async (req, res) => {
  try {
    const cardsRes = await pool.query(`
      SELECT c.*, uc.normal_count, uc.foil_count 
      FROM cards c
      INNER JOIN user_collection uc ON c.id = uc.card_id
      WHERE uc.normal_count > 0 OR uc.foil_count > 0
      ORDER BY c.name ASC
    `);

    let manualSalesMap = {};
    try {
      const manualRes = await pool.query('SELECT card_id, on_sale, sale_total, featured FROM user_manual_sales');
      manualRes.rows.forEach(r => {
        manualSalesMap[r.card_id] = { onSale: r.on_sale, saleTotal: r.sale_total, featured: Boolean(r.featured) };
      });
    } catch (err) {
      console.warn('Could not read user_manual_sales table:', err.message);
    }

    const cardsOnSale = [];
    let totalCopies = 0;
    let totalNormal = 0;
    let totalFoil = 0;

    cardsRes.rows.forEach(c => {
      const r = (c.rarity || '').toLowerCase();
      const t = (c.card_type || '').toLowerCase();

      // Common runes are strictly excluded
      if (t === 'rune' && r === 'common') return;

      const setName = (c.set_name || '').toLowerCase();
      const isPromo = setName.includes('promotional') || setName.includes('promo') || r === 'promo';
      const isAlwaysFoil = r === 'rare' || r === 'epic' || r === 'legendary' || r === 'legend' || r === 'showcase' || r === 'promo' || t === 'legend';
      const isAuto = !isPromo && (r === 'common' || r === 'uncommon');
      const normalCount = isAlwaysFoil ? 0 : (c.normal_count || 0);
      const foilCount = isAlwaysFoil ? ((c.foil_count || 0) + (c.normal_count || 0)) : (c.foil_count || 0);
      const totalOwned = normalCount + foilCount;
      if (totalOwned === 0) return;

      const targetKeep = t === 'battlefield' ? 1 : 3;

      if (isAuto) {
        if (totalOwned > targetKeep) {
          const surplus = totalOwned - targetKeep;
          const saleNormal = Math.min(normalCount, surplus);
          const saleFoil = surplus - saleNormal;
          cardsOnSale.push({
            id: c.id,
            name: c.name,
            set_name: c.set_name,
            card_type: c.card_type,
            energy_cost: c.energy_cost,
            element: c.element,
            rarity: c.rarity,
            ability_text: c.ability_text,
            image_url: c.image_url,
            card_code: c.card_code,
            tags: c.tags,
            isAuto: true,
            featured: Boolean(manualSalesMap[c.id]?.featured),
            saleTotal: surplus,
            saleNormal,
            saleFoil,
            totalOwned
          });
          totalCopies += surplus;
          totalNormal += saleNormal;
          totalFoil += saleFoil;
        }
      } else {
        const manual = manualSalesMap[c.id];
        if (manual && manual.onSale && manual.saleTotal > 0) {
          const effectiveSaleQty = Math.max(1, Math.min(totalOwned, manual.saleTotal));
          const saleNormal = Math.min(normalCount, effectiveSaleQty);
          const saleFoil = effectiveSaleQty - saleNormal;
          cardsOnSale.push({
            id: c.id,
            name: c.name,
            set_name: c.set_name,
            card_type: c.card_type,
            energy_cost: c.energy_cost,
            element: c.element,
            rarity: c.rarity,
            ability_text: c.ability_text,
            image_url: c.image_url,
            card_code: c.card_code,
            tags: c.tags,
            isAuto: false,
            featured: Boolean(manualSalesMap[c.id]?.featured),
            saleTotal: effectiveSaleQty,
            saleNormal,
            saleFoil,
            totalOwned
          });
          totalCopies += effectiveSaleQty;
          totalNormal += saleNormal;
          totalFoil += saleFoil;
        }
      }
    });

    res.json({
      owner: {
        username: 'XDavider',
        displayName: 'David Bermúdez',
        discord: 'xdavider',
        instagram: 'david_de_dora',
        instagramUrl: 'https://www.instagram.com/david_de_dora/',
        linkedinUrl: 'https://www.linkedin.com/in/david-bermudez-445785403',
        githubUrl: 'https://github.com/David-BermudezFP'
      },
      stats: {
        totalCopies,
        normalCopies: totalNormal,
        foilCopies: totalFoil,
        uniqueCards: cardsOnSale.length,
        featuredCards: cardsOnSale.filter(c => c.featured).length,
        updatedAt: new Date().toISOString()
      },
      cards: cardsOnSale
    });
  } catch (err) {
    console.error('Error fetching public sale:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/decks
app.get('/api/decks', async (req, res) => {
  if (req.user && req.user.role === 'guest') {
    // Guest decks are per-user session and never expose owner decks
    return res.json([]);
  }
  try {
    const result = await pool.query(`
      SELECT d.*, 
             l.image_url as legend_image,
             l.name as legend_name,
             c.image_url as champion_image,
             (
               SELECT jsonb_object_agg(sub.element, sub.count)
               FROM (
                 SELECT rc.element, SUM(dc.quantity) as count
                 FROM deck_cards dc 
                 JOIN cards rc ON dc.card_id = rc.id 
                 WHERE dc.deck_id = d.id AND rc.card_type ILIKE '%Rune%'
                 GROUP BY rc.element
               ) sub
             ) as rune_counts,
             (
               SELECT json_agg(DISTINCT rc.element) 
               FROM deck_cards dc 
               JOIN cards rc ON dc.card_id = rc.id 
               WHERE dc.deck_id = d.id AND rc.card_type ILIKE '%Rune%'
             ) as rune_domains,
             (
               SELECT json_agg(rc.card)
               FROM (
                 SELECT json_build_object('image_url', inner_c.image_url, 'quantity', inner_dc.quantity) as card
                 FROM deck_cards inner_dc
                 JOIN cards inner_c ON inner_dc.card_id = inner_c.id
                 WHERE inner_dc.deck_id = d.id AND inner_dc.section = 'main'
                 ORDER BY 
                   CASE WHEN inner_c.card_type IN ('Spell', 'Gear') AND (inner_c.element LIKE '%,%' OR inner_c.card_type ILIKE '%signature%' OR inner_c.name ILIKE '%signature%') THEN 1 ELSE 2 END,
                   CASE WHEN inner_c.card_type = 'Unit' AND inner_c.energy_cost = 2 THEN 1 ELSE 2 END,
                   CASE inner_c.rarity 
                     WHEN 'Legendary' THEN 1 
                     WHEN 'Epic' THEN 2 
                     WHEN 'Rare' THEN 3 
                     WHEN 'Common' THEN 4 
                     ELSE 5 
                   END,
                   inner_c.energy_cost DESC
               ) as rc
             ) as random_cards,
             (
               SELECT json_agg(rc.card)
               FROM (
                 SELECT json_build_object('image_url', inner_c.image_url, 'quantity', inner_dc.quantity) as card
                 FROM deck_cards inner_dc
                 JOIN cards inner_c ON inner_dc.card_id = inner_c.id
                 WHERE inner_dc.deck_id = d.id AND inner_dc.section = 'battlefield'
               ) as rc
             ) as battlefields,
              (
                SELECT json_agg(cl.item)
                FROM (
                  SELECT json_build_object(
                    'name', inner_c.name,
                    'energy_cost', inner_c.energy_cost,
                    'card_type', inner_c.card_type,
                    'element', inner_c.element,
                    'image_url', inner_c.image_url,
                    'quantity', inner_dc.quantity,
                    'section', inner_dc.section
                  ) as item
                  FROM deck_cards inner_dc
                  JOIN cards inner_c ON inner_dc.card_id = inner_c.id
                  WHERE inner_dc.deck_id = d.id AND inner_dc.section NOT IN ('rune', 'battlefield')
                  ORDER BY 
                    CASE LOWER(inner_c.card_type)
                      WHEN 'unit' THEN 1
                      WHEN 'spell' THEN 2
                      WHEN 'gear' THEN 3
                      ELSE 4
                    END,
                    COALESCE(inner_c.energy_cost, 99) ASC,
                    inner_c.name ASC
                ) cl
              ) as card_list,
             (
               SELECT COALESCE(SUM(dc.quantity), 0)
               FROM deck_cards dc
               JOIN cards rc ON dc.card_id = rc.id
               WHERE dc.deck_id = d.id AND rc.card_type NOT ILIKE '%Rune%'
             ) as total_cards,
             (
               SELECT COALESCE(SUM(LEAST(dc.quantity, COALESCE(col.normal_count, 0) + COALESCE(col.foil_count, 0))), 0)
               FROM deck_cards dc
               JOIN cards rc ON dc.card_id = rc.id
               LEFT JOIN user_collection col ON dc.card_id = col.card_id
               WHERE dc.deck_id = d.id AND rc.card_type NOT ILIKE '%Rune%'
             ) as owned_cards,
             (
               SELECT COALESCE(SUM(dc.quantity), 0)
               FROM deck_cards dc
               WHERE dc.deck_id = d.id AND dc.section IN ('main', 'champion')
             ) as main_total_cards,
             (
               SELECT COALESCE(SUM(LEAST(dc.quantity, COALESCE(col.normal_count, 0) + COALESCE(col.foil_count, 0))), 0)
               FROM deck_cards dc
               LEFT JOIN user_collection col ON dc.card_id = col.card_id
               WHERE dc.deck_id = d.id AND dc.section IN ('main', 'champion')
             ) as main_owned_cards,
             (
               SELECT COALESCE(SUM(dc.quantity), 0)
               FROM deck_cards dc
               WHERE dc.deck_id = d.id AND dc.section = 'sideboard'
             ) as sideboard_total_cards,
             (
               SELECT COALESCE(SUM(LEAST(dc.quantity, COALESCE(col.normal_count, 0) + COALESCE(col.foil_count, 0))), 0)
               FROM deck_cards dc
               LEFT JOIN user_collection col ON dc.card_id = col.card_id
               WHERE dc.deck_id = d.id AND dc.section = 'sideboard'
             ) as sideboard_owned_cards
      FROM decks d 
      LEFT JOIN cards l ON d.legend_id = l.id
      LEFT JOIN cards c ON d.champion_id = c.id
      ORDER BY COALESCE(d.favorite, false) DESC, COALESCE(d.position, 0) ASC, d.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/decks/:id
app.get('/api/decks/:id', async (req, res) => {
  if (req.user && req.user.role === 'guest') {
    return res.status(404).json({ error: 'Deck not found' });
  }
  try {
    const { id } = req.params;
    const deckRes = await pool.query('SELECT * FROM decks WHERE id = $1', [id]);
    if (deckRes.rows.length === 0) return res.status(404).json({ error: 'Deck not found' });
    
    const cardsRes = await pool.query(`
      SELECT dc.*, c.name, c.set_name, c.card_type, c.energy_cost, c.element, c.rarity, c.image_url, c.card_code 
      FROM deck_cards dc
      JOIN cards c ON dc.card_id = c.id
      WHERE dc.deck_id = $1
    `, [id]);
    
    res.json({
      ...deckRes.rows[0],
      cards: cardsRes.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/decks
app.post('/api/decks', async (req, res) => {
  if (req.user && req.user.role === 'guest') {
    return res.status(403).json({ error: 'Acción no permitida en modo invitado. Inicia sesión como propietario para modificar mazos.' });
  }
  const { id, name, description, legend_id, champion_id, cards } = req.body;
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    let deckId = id;
    if (deckId) {
      await client.query(
        'UPDATE decks SET name = $1, description = $2, legend_id = $3, champion_id = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5',
        [name, description || null, legend_id, champion_id, deckId]
      );
      await client.query('DELETE FROM deck_cards WHERE deck_id = $1', [deckId]);
    } else {
      const insertRes = await client.query(
        'INSERT INTO decks (name, description, legend_id, champion_id) VALUES ($1, $2, $3, $4) RETURNING id',
        [name, description || null, legend_id, champion_id]
      );
      deckId = insertRes.rows[0].id;
    }
    
    for (const card of cards) {
      await client.query(
        'INSERT INTO deck_cards (deck_id, card_id, section, quantity) VALUES ($1, $2, $3, $4)',
        [deckId, card.card_id, card.section, card.quantity]
      );
    }
    
    await client.query('COMMIT');
    res.json({ success: true, id: deckId });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    client.release();
  }
});

// DELETE /api/decks/:id
app.delete('/api/decks/:id', async (req, res) => {
  if (req.user && req.user.role === 'guest') {
    return res.status(403).json({ error: 'Acción no permitida en modo invitado' });
  }
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM decks WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/decks/:id/favorite
app.post('/api/decks/:id/favorite', async (req, res) => {
  if (req.user && req.user.role === 'guest') {
    return res.status(403).json({ error: 'Acción no permitida en modo invitado' });
  }
  const { id } = req.params;
  const { favorite } = req.body;
  try {
    await pool.query('UPDATE decks SET favorite = $1 WHERE id = $2', [favorite, id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/decks/reorder
app.post('/api/decks/reorder', async (req, res) => {
  if (req.user && req.user.role === 'guest') {
    return res.status(403).json({ error: 'Acción no permitida en modo invitado' });
  }
  const { deckIds } = req.body;
  if (!deckIds || !Array.isArray(deckIds)) {
    return res.status(400).json({ error: 'deckIds array is required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (let i = 0; i < deckIds.length; i++) {
      await client.query('UPDATE decks SET position = $1 WHERE id = $2', [i, deckIds[i]]);
    }
    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    client.release();
  }
});

// Centralized Express error handler
app.use((err, req, res, next) => {
  if (err && err.message === 'Bloqueado por política CORS') {
    return res.status(403).json({ error: 'Acceso denegado por política CORS' });
  }
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

export default app;

if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT} (0.0.0.0)`);
  });
}
