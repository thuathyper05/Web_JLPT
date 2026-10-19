const db = require('../config/db');

async function check() {
  const r = await db.pool.query(
    "SELECT id, lesson_number, kanji, kana, romaji, vietnamese FROM vocabularies WHERE kanji IS NULL OR kanji = '' OR kanji = '–' OR kanji = '-' ORDER BY lesson_number, id"
  );
  console.log(`Total words with no kanji: ${r.rows.length}`);
  for (const w of r.rows) {
    console.log(`L${w.lesson_number} id:${w.id} kana:'${w.kana}' romaji:'${w.romaji}' vi:'${w.vietnamese}'`);
  }
  process.exit(0);
}

check().catch(console.error);
