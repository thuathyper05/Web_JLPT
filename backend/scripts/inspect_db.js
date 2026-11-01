const { pool } = require('../db');

async function check() {
  try {
    if (!pool) {
      console.log('No pool initialized');
      process.exit(1);
    }
    const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
    console.log('Tables:', tables.rows.map(r => r.table_name));

    for (const t of ['lessons', 'vocabularies', 'kanji', 'grammar_points', 'particles']) {
      if (!tables.rows.some(r => r.table_name === t)) {
        console.log(`\nTable ${t} does not exist in DB!`);
        continue;
      }
      const cols = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1", [t]);
      console.log(`\n=== Table: ${t} ===`);
      console.log(cols.rows.map(c => `${c.column_name} (${c.data_type})`).join(', '));
      
      const countRes = await pool.query(`SELECT level, count(*) as count FROM ${t} GROUP BY level ORDER BY level`).catch(e => ({ rows: [e.message] }));
      console.log('Counts by level:', countRes.rows);
    }
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

check();
