const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:Thuatnguyen1204%40%40%40@db.wbzbncggvbzdtkbyveka.supabase.co:5432/postgres';

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

function toHiragana(str) {
  if (!str) return '';
  return str.replace(/[\u30a1-\u30f6]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0x60));
}

const hasKatakana = str => /[\u30A1-\u30F6]/.test(str || '');
const hasHiragana = str => /[\u3041-\u3096]/.test(str || '');
const hasKanji = str => /[\u4E00-\u9FAF]/.test(str || '');

async function fixKatakanaVocabularies() {
  console.log('--- FIXING KATAKANA VOCABULARIES ---');
  
  // 1. Update all_vocabularies.json
  const jsonPath = path.join(__dirname, '../data/all_vocabularies.json');
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  let fixedJsonCount = 0;
  const updates = [];

  for (const w of data) {
    const k = (w.kanji || '').trim();
    const r = (w.kana || '').trim();
    const c = (w.clean_kana || '').trim();

    // Pure Katakana words: reading must be the Katakana word itself!
    if (!hasKanji(k) && hasKatakana(k)) {
      if (hasHiragana(r) || hasHiragana(c)) {
        w.kana = k;
        w.clean_kana = k;
        fixedJsonCount++;
        updates.push({ id: w.id, kanji: k, new_kana: k, new_clean_kana: k });
      }
    }

    // Mixed word with Katakana prefix like スポーツ用品 (id 136)
    if (hasKanji(k) && hasKatakana(k)) {
      const kataMatch = k.match(/^([\u30A1-\u30F6ー・]+)/);
      if (kataMatch) {
        const kataPrefix = kataMatch[1];
        const hiraPrefix = toHiragana(kataPrefix);
        if (r.startsWith(hiraPrefix) && !r.startsWith(kataPrefix)) {
          const fixedKana = kataPrefix + r.slice(hiraPrefix.length);
          const fixedClean = kataPrefix + c.slice(hiraPrefix.length);
          w.kana = fixedKana;
          w.clean_kana = fixedClean;
          fixedJsonCount++;
          updates.push({ id: w.id, kanji: k, new_kana: fixedKana, new_clean_kana: fixedClean });
        }
      }
    }
  }

  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`[JSON] Fixed ${fixedJsonCount} vocabularies in all_vocabularies.json`);

  // 2. Update Supabase PostgreSQL database
  try {
    console.log(`[PostgreSQL] Updating ${updates.length} rows in Supabase...`);
    let dbUpdated = 0;

    for (const u of updates) {
      const res = await pool.query(
        'UPDATE vocabularies SET kana = $1, clean_kana = $2 WHERE id = $3 RETURNING id',
        [u.new_kana, u.new_clean_kana, u.id]
      );
      if (res.rowCount > 0) dbUpdated++;
    }

    console.log(`[PostgreSQL] Successfully updated ${dbUpdated} rows in Supabase database!`);

    // Verify in database
    const verifyRes = await pool.query(`
      SELECT COUNT(*) 
      FROM vocabularies 
      WHERE kanji ~ '[\\u30A1-\\u30F6]' 
        AND NOT (kanji ~ '[\\u4E00-\\u9FAF]')
        AND kana ~ '[\\u3041-\\u3096]'
    `);
    console.log(`[PostgreSQL Verification] Remaining pure Katakana with Hiragana in DB: ${verifyRes.rows[0].count} (must be 0)`);

  } catch (err) {
    console.error('[PostgreSQL Error]:', err.message);
  } finally {
    await pool.end();
  }
}

fixKatakanaVocabularies();
