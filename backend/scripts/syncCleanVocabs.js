const db = require('../config/db');
const fs = require('fs');
const path = require('path');

async function syncDb() {
  const jsonPath = path.join(__dirname, '../../database/n5_full_lessons.json');
  const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    let totalUpdated = 0;

    for (let i = 1; i <= 25; i++) {
      const words = raw[String(i)] || [];
      for (let idx = 0; idx < words.length; idx++) {
        const w = words[idx];
        const res = await client.query(
          `UPDATE vocabularies 
            SET kanji = $1, 
                kana = $2, 
                clean_kana = $3, 
                romaji = $4,
                vietnamese = $5,
                clean_vietnamese = $6
            WHERE lesson_number = $7 AND (order_num = $8 OR (LOWER(romaji) = LOWER($4) AND lesson_id = $7))`,
          [
            w.kanji || null,
            w.kana,
            w.clean_kana || w.kana,
            w.romaji,
            w.vietnamese,
            w.clean_vietnamese || w.vietnamese,
            i,
            idx + 1
          ]
        );
        totalUpdated += res.rowCount;
      }
    }
    await client.query('COMMIT');
    console.log('Successfully synced DB vocabularies! Row updates:', totalUpdated);
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('DB Sync error:', e.message);
  } finally {
    client.release();
    db.pool.end();
  }
}

syncDb();
