const { pool } = require('../db');

async function checkIndexes() {
  const res = await pool.query(`
    SELECT tablename, indexname, indexdef 
    FROM pg_indexes 
    WHERE schemaname = 'public' AND tablename IN ('lessons', 'vocabularies', 'kanji', 'grammar_points')
    ORDER BY tablename, indexname
  `);
  console.log(JSON.stringify(res.rows, null, 2));
  process.exit(0);
}

checkIndexes().catch(e => {
  console.error(e);
  process.exit(1);
});
