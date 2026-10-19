const db = require('../config/db');

async function inspectLessonWords(lesson) {
  const res = await db.pool.query(
    'SELECT id, kanji, kana, clean_kana, romaji, vietnamese, clean_vietnamese FROM vocabularies WHERE lesson_number = $1 ORDER BY id ASC',
    [lesson]
  );
  console.log(`\n=== WORDS IN LESSON ${lesson} (${res.rows.length}) ===`);
  res.rows.forEach((w, i) => {
    console.log(`${i+1}. [${w.id}] ${w.kanji || '-'} | ${w.kana} (${w.romaji}): ${w.clean_vietnamese || w.vietnamese}`);
  });
}

async function main() {
  const lessonsToInspect = [3, 5, 6, 7, 8];
  for (const l of lessonsToInspect) {
    await inspectLessonWords(l);
  }
  process.exit(0);
}

main().catch(console.error);
