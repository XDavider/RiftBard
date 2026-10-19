import express from 'express';
import cors from 'cors';
import pool from './db.js';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// POST /api/sync-cards
app.post('/api/sync-cards', (req, res) => {
  const seedPath = path.join(__dirname, 'seed.js');
  exec(`node "${seedPath}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return res.status(500).json({ success: false, error: error.message });
    }
    console.log(`stdout: ${stdout}`);
    if (stderr) console.error(`stderr: ${stderr}`);
    res.json({ success: true, message: 'Database synced successfully!' });
  });
});

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

  try {
    const query = `
      INSERT INTO user_collection (card_id, normal_count, foil_count, updated_at)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      ON CONFLICT (card_id) DO UPDATE SET
        normal_count = EXCLUDED.normal_count,
        foil_count = EXCLUDED.foil_count,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;
    const result = await pool.query(query, [card_id, normal_count || 0, foil_count || 0]);
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

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    for (const item of items) {
      const { card_id, normal_count, foil_count } = item;
      if (!card_id) continue;
      
      const query = `
        INSERT INTO user_collection (card_id, normal_count, foil_count, updated_at)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
        ON CONFLICT (card_id) DO UPDATE SET
          normal_count = EXCLUDED.normal_count,
          foil_count = EXCLUDED.foil_count,
          updated_at = CURRENT_TIMESTAMP
      `;
      await client.query(query, [card_id, normal_count || 0, foil_count || 0]);
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

// GET /api/decks
app.get('/api/decks', async (req, res) => {
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

export default app;

if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT} (0.0.0.0)`);
  });
}
