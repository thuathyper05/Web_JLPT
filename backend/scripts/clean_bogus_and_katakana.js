const fs = require('fs');
const path = require('path');
const db = require('../config/db');

async function cleanData() {
  const jsonPath = path.join(__dirname, '../../database/n5_full_lessons.json');
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  // 1. Fix CD in JSON
  if (data['6']) {
    for (const w of data['6']) {
      if (w.kana === 'しーでぃー') {
        w.kana = 'シーディー';
        w.clean_kana = 'シーディー';
        console.log('Fixed CD in JSON L6');
      }
    }
  }

  // 2. Remove 63 bogus words from JSON L4 and 14 bogus words from JSON L5
  const isBogus = (w) => {
    const k = w.kanji || '';
    const vi = (w.vietnamese || '').toLowerCase();
    return (
      (k.includes('先週の') || k.includes('今週の') || k.includes('来週の') || k.includes('今度の')) &&
      (k.includes('曜日') || vi.includes('tuần trước') || vi.includes('tuần sau') || vi.includes('kế tiếp'))
    );
  };

  const beforeL4 = data['4'] ? data['4'].length : 0;
  const beforeL5 = data['5'] ? data['5'].length : 0;

  data['4'] = (data['4'] || []).filter(w => !isBogus(w));
  data['5'] = (data['5'] || []).filter(w => !isBogus(w));

  console.log(`JSON L4 count: ${beforeL4} -> ${data['4'].length}`);
  console.log(`JSON L5 count: ${beforeL5} -> ${data['5'].length}`);

  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
  console.log('Successfully updated database/n5_full_lessons.json');

  // 3. Fix CD in Postgres DB
  await db.pool.query("UPDATE vocabularies SET kana = 'シーディー', clean_kana = 'シーディー' WHERE id = 385 OR kana = 'しーでぃー'");
  console.log('Updated CD to Katakana in PostgreSQL');

  // 4. Delete 77 bogus words from Postgres DB
  const delRes = await db.pool.query(
    "DELETE FROM vocabularies WHERE (kanji LIKE '%先週の%' OR kanji LIKE '%今週の%' OR kanji LIKE '%来週の%' OR kanji LIKE '%今度の%') AND (kanji LIKE '%曜日%' OR vietnamese ILIKE '%tuần trước%' OR vietnamese ILIKE '%tuần sau%' OR vietnamese ILIKE '%kế tiếp%')"
  );
  console.log(`Deleted ${delRes.rowCount} bogus words from PostgreSQL DB.`);

  // Verify counts in DB
  const rL4 = await db.pool.query('SELECT count(*) as cnt FROM vocabularies WHERE lesson_number = 4');
  const rL5 = await db.pool.query('SELECT count(*) as cnt FROM vocabularies WHERE lesson_number = 5');
  console.log(`DB L4 remaining words: ${rL4.rows[0].cnt}, L5 remaining words: ${rL5.rows[0].cnt}`);

  process.exit(0);
}

cleanData().catch(e => {
  console.error(e);
  process.exit(1);
});
