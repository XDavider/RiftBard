import pool from './db.js';

async function test() {
  const res = await pool.query("SELECT * FROM cards WHERE name LIKE '%Ahri%' LIMIT 2");
  console.log(res.rows);
  pool.end();
}

test();
