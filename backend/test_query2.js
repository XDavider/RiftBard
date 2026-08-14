import pool from './db.js';

async function test() {
  const res = await pool.query("SELECT DISTINCT set_name FROM cards");
  console.log('Sets:', res.rows.map(r => r.set_name));
  pool.end();
}

test();
