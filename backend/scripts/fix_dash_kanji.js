const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

async function run() {
  const jsonPath = path.join(__dirname, '../data/all_vocabularies.json');
  const vocabs = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  let fixedJsonCount = 0;
  for (const v of vocabs) {
    if (v.kanji === '-' || v.kanji === '–' || v.kanji === '—') {
      v.kanji = '';
      fixedJsonCount++;
    }
  }

  fs.writeFileSync(jsonPath, JSON.stringify(vocabs, null, 2), 'utf8');
  console.log(`[JSON Update] Updated ${fixedJsonCount} vocabularies in all_vocabularies.json (kanji '-'/'–' set to empty)`);

  const pool = new Pool({
    connectionString: 'postgresql://postgres:Thuatnguyen1204%40%40%40@db.wbzbncggvbzdtkbyveka.supabase.co:5432/postgres'
  });

  try {
    const res = await pool.query(
      "UPDATE vocabularies SET kanji = '' WHERE kanji IN ('-', '–', '—')"
    );
    console.log(`[Supabase PostgreSQL] Updated ${res.rowCount} rows in vocabularies table`);

    // Verify
    const checkRes = await pool.query(
      "SELECT count(*) as cnt FROM vocabularies WHERE kanji IN ('-', '–', '—')"
    );
    console.log(`[PostgreSQL Verification] Remaining dash kanji in DB: ${checkRes.rows[0].cnt}`);
  } catch (err) {
    console.error('Supabase DB update error:', err);
  } finally {
    await pool.end();
  }
}

run();
