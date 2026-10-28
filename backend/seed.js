import 'dotenv/config';
import pool from './db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSchema(client) {
  console.log('Verifying database schema and foreign key constraints...');
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  await client.query(schemaSql);
  
  try {
    await client.query('ALTER TABLE cards ADD COLUMN IF NOT EXISTS card_code VARCHAR(100);');
    await client.query('ALTER TABLE cards ADD COLUMN IF NOT EXISTS tags TEXT;');
  } catch (e) {
    if (e.code !== '42701') console.error('Error adding columns:', e);
  }

  // Ensure ON UPDATE CASCADE constraints on referencing tables
  try {
    await client.query(`
      ALTER TABLE user_collection DROP CONSTRAINT IF EXISTS user_collection_card_id_fkey,
      ADD CONSTRAINT user_collection_card_id_fkey FOREIGN KEY (card_id) REFERENCES cards(id) ON UPDATE CASCADE ON DELETE CASCADE;
      
      ALTER TABLE deck_cards DROP CONSTRAINT IF EXISTS deck_cards_card_id_fkey,
      ADD CONSTRAINT deck_cards_card_id_fkey FOREIGN KEY (card_id) REFERENCES cards(id) ON UPDATE CASCADE ON DELETE CASCADE;
      
      ALTER TABLE decks DROP CONSTRAINT IF EXISTS decks_legend_id_fkey,
      ADD CONSTRAINT decks_legend_id_fkey FOREIGN KEY (legend_id) REFERENCES cards(id) ON UPDATE CASCADE ON DELETE SET NULL;
      
      ALTER TABLE decks DROP CONSTRAINT IF EXISTS decks_champion_id_fkey,
      ADD CONSTRAINT decks_champion_id_fkey FOREIGN KEY (champion_id) REFERENCES cards(id) ON UPDATE CASCADE ON DELETE SET NULL;
    `);
    console.log('Foreign key CASCADE constraints verified successfully.');
  } catch (e) {
    console.error('Error configuring CASCADE constraints:', e);
  }
}

export async function syncCards(isStandalone = false) {
  const client = await pool.connect();
  try {
    await runSchema(client);

    console.log('Fetching card catalog from RiftHunt bulk API...');
    const response = await fetch('https://api.rifthunt.com/bulk/cards', {
      headers: {
        'User-Agent': 'RiftBard/1.0 (Collection & Deck Builder)'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error from RiftHunt: ${response.status} ${response.statusText}`);
    }

    const payload = await response.json();
    const allCards = payload.cards || payload.data || (Array.isArray(payload) ? payload : []);
    console.log(`Successfully downloaded ${allCards.length} cards from RiftHunt.`);

    await client.query('BEGIN');

    // Step 1: Pre-migration of legacy IDs to RiftHunt IDs using card_code (e.g. VEN-061)
    console.log('Checking for legacy ID differences to protect user collection and decks...');
    const rhByCode = new Map();
    for (const c of allCards) {
      if (c.riftboundId) {
        const code = c.riftboundId.split('-').slice(0, 2).join('-').toUpperCase();
        if (!rhByCode.has(code)) {
          rhByCode.set(code, c);
        }
      }
    }

    const existingCards = (await client.query('SELECT id, card_code FROM cards')).rows;
    const existingIdSet = new Set(existingCards.map(c => c.id));
    let migratedCount = 0;

    for (const dbCard of existingCards) {
      if (!dbCard.card_code) continue;
      const rhCard = rhByCode.get(dbCard.card_code);
      if (rhCard && rhCard.id !== dbCard.id) {
        const oldId = dbCard.id;
        const newId = rhCard.id;

        if (existingIdSet.has(newId)) {
          // Both IDs exist: merge collection counts before deleting the obsolete row
          const ucOld = await client.query('SELECT * FROM user_collection WHERE card_id = $1', [oldId]);
          if (ucOld.rows.length > 0) {
            const oldRow = ucOld.rows[0];
            const ucNew = await client.query('SELECT * FROM user_collection WHERE card_id = $1', [newId]);
            if (ucNew.rows.length > 0) {
              const newRow = ucNew.rows[0];
              await client.query(
                `UPDATE user_collection 
                 SET normal_count = GREATEST($1::int, $2::int), foil_count = GREATEST($3::int, $4::int), updated_at = CURRENT_TIMESTAMP 
                 WHERE card_id = $5`,
                [oldRow.normal_count || 0, newRow.normal_count || 0, oldRow.foil_count || 0, newRow.foil_count || 0, newId]
              );
              await client.query('DELETE FROM user_collection WHERE card_id = $1', [oldId]);
            } else {
              await client.query('UPDATE user_collection SET card_id = $1 WHERE card_id = $2', [newId, oldId]);
            }
          }

          // Remap deck cards and deck champions/legends
          await client.query('UPDATE deck_cards SET card_id = $1 WHERE card_id = $2', [newId, oldId]);
          await client.query('UPDATE decks SET legend_id = $1 WHERE legend_id = $2', [newId, oldId]);
          await client.query('UPDATE decks SET champion_id = $1 WHERE champion_id = $2', [newId, oldId]);

          // Remove the obsolete duplicate card row
          await client.query('DELETE FROM cards WHERE id = $1', [oldId]);
        } else {
          // New ID not yet in table: direct update cascades to user_collection and deck_cards
          await client.query('UPDATE cards SET id = $1 WHERE id = $2', [newId, oldId]);
          existingIdSet.delete(oldId);
          existingIdSet.add(newId);
        }
        migratedCount++;
      }
    }

    if (migratedCount > 0) {
      console.log(`Successfully migrated ${migratedCount} card references to RiftHunt IDs.`);
    }

    // Step 2: Batch upsert all cards from RiftHunt (100 cards per batch for maximum speed)
    console.log('Upserting cards into the database in optimized batches...');
    const validIds = allCards.map(c => c.id);
    const BATCH_SIZE = 100;

    for (let i = 0; i < allCards.length; i += BATCH_SIZE) {
      const batch = allCards.slice(i, i + BATCH_SIZE);
      const values = [];
      const valueClauses = [];
      let paramIndex = 1;

      for (const card of batch) {
        const id = card.id;
        const riftboundId = card.riftboundId || '';
        const cardCode = riftboundId ? riftboundId.split('-').slice(0, 2).join('-').toUpperCase() : '';
        const name = card.name || 'Unknown Name';
        const setName = card.setName || card.set || 'Promo';
        const cardType = card.type || 'Card';
        const energyCost = card.energy !== null && card.energy !== undefined ? card.energy : 0;
        const element = (card.domains && card.domains.length > 0) ? card.domains.join(',') : 'Neutral';
        const rarity = card.rarity || 'Common';
        const abilityText = card.text || '';
        const imageUrl = card.imgUrl || '';
        const tags = (card.tags && Array.isArray(card.tags)) ? card.tags.join(',') : '';

        valueClauses.push(`($${paramIndex}, $${paramIndex+1}, $${paramIndex+2}, $${paramIndex+3}, $${paramIndex+4}, $${paramIndex+5}, $${paramIndex+6}, $${paramIndex+7}, $${paramIndex+8}, $${paramIndex+9}, $${paramIndex+10})`);
        values.push(id, name, setName, cardType, energyCost, element, rarity, abilityText, imageUrl, cardCode, tags);
        paramIndex += 11;
      }

      const batchQuery = `
        INSERT INTO cards (id, name, set_name, card_type, energy_cost, element, rarity, ability_text, image_url, card_code, tags)
        VALUES ${valueClauses.join(', ')}
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          set_name = EXCLUDED.set_name,
          card_type = EXCLUDED.card_type,
          energy_cost = EXCLUDED.energy_cost,
          element = EXCLUDED.element,
          rarity = EXCLUDED.rarity,
          ability_text = EXCLUDED.ability_text,
          image_url = EXCLUDED.image_url,
          card_code = EXCLUDED.card_code,
          tags = EXCLUDED.tags;
      `;

      await client.query(batchQuery, values);
    }

    console.log(`Upserted ${validIds.length} cards successfully.`);

    // Step 3: Safe cleanup of truly obsolete cards (excluding any card with collection counts or used in decks)
    if (validIds.length > 0) {
      const deleteResult = await client.query(`
        DELETE FROM cards 
        WHERE id != ALL($1::text[])
          AND id NOT IN (SELECT card_id FROM user_collection WHERE normal_count > 0 OR foil_count > 0)
          AND id NOT IN (SELECT card_id FROM deck_cards)
          AND id NOT IN (SELECT legend_id FROM decks WHERE legend_id IS NOT NULL)
          AND id NOT IN (SELECT champion_id FROM decks WHERE champion_id IS NOT NULL)
      `, [validIds]);
      console.log(`Deleted ${deleteResult.rowCount} obsolete cards without affecting user collections or decks.`);
    }

    await client.query('COMMIT');
    console.log(`Database seeded and synchronized with RiftHunt successfully! (${validIds.length} cards)`);
    return { success: true, count: validIds.length };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error during seeding:', error);
    throw error;
  } finally {
    client.release();
    if (isStandalone) {
      await pool.end();
    }
  }
}

// Execute automatically if invoked directly via CLI (e.g. node seed.js or npm run seed)
const isMainModule = process.argv[1] && (
  process.argv[1] === fileURLToPath(import.meta.url) ||
  process.argv[1].endsWith('seed.js')
);

if (isMainModule) {
  syncCards(true)
    .then((res) => {
      console.log(`Sync completed successfully. Total cards: ${res.count}`);
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seed process failed:', err);
      process.exit(1);
    });
}
