import pool from './db.js';

async function check() {
  const res = await pool.query("SELECT name FROM cards WHERE card_type IN ('Spell', 'Gear') LIMIT 100;");
  console.log("Some spell/gear names:", res.rows.map(r => r.name).join(', '));
  pool.end();
}

check();
