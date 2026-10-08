const fs = require('fs');
const path = require('path');
const db = require('../config/db');

async function exportSql() {
  console.log('Exporting database to supabase_init.sql...');
  let sql = '-- ==========================================================================\n';
  sql += '-- HYPER JAPAN JLPT N5 — SUPABASE PRODUCTION DATABASE INITIALIZATION SCRIPT\n';
  sql += '-- Paste and Run this directly in Supabase -> SQL Editor\n';
  sql += '-- ==========================================================================\n\n';

  // 1. DDL
  sql += '-- 1. CREATE TABLES\n';
  sql += `
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    reset_token VARCHAR(50),
    reset_token_expiry TIMESTAMP WITH TIME ZONE,
    auth_provider VARCHAR(50),
    provider_id VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lessons (
    id SERIAL PRIMARY KEY,
    lesson_number INT UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vocabularies (
    id SERIAL PRIMARY KEY,
    lesson_id INT REFERENCES lessons(id) ON DELETE CASCADE,
    lesson_number INT NOT NULL,
    order_num INT NOT NULL,
    kanji VARCHAR(100),
    kana VARCHAR(150) NOT NULL,
    clean_kana VARCHAR(150),
    romaji VARCHAR(150) NOT NULL,
    vietnamese TEXT NOT NULL,
    clean_vietnamese TEXT,
    usage_note TEXT,
    example_jp TEXT,
    example_vi TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS kanji (
    id SERIAL PRIMARY KEY,
    kanji VARCHAR(20) NOT NULL,
    onyomi VARCHAR(150),
    kunyomi VARCHAR(150),
    han_viet VARCHAR(100),
    meaning VARCHAR(255),
    stroke_count INT,
    level VARCHAR(20) DEFAULT 'N5',
    examples JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_progress (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    vocabulary_id INT REFERENCES vocabularies(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'learning',
    correct_count INT DEFAULT 0,
    wrong_count INT DEFAULT 0,
    last_studied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, vocabulary_id)
);

CREATE TABLE IF NOT EXISTS favorites (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    vocabulary_id INT REFERENCES vocabularies(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, vocabulary_id)
);

CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    vocabulary_id INT REFERENCES vocabularies(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, vocabulary_id)
);

CREATE TABLE IF NOT EXISTS study_sessions (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    session_type VARCHAR(50) NOT NULL,
    lesson_number INT,
    total_questions INT NOT NULL,
    correct_answers INT NOT NULL,
    score_percentage NUMERIC(5,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vocab_lesson ON vocabularies(lesson_number);
CREATE INDEX IF NOT EXISTS idx_vocab_order ON vocabularies(lesson_number, order_num);
CREATE INDEX IF NOT EXISTS idx_progress_user ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_user ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_kanji_level ON kanji(level);
\n`;

  // 2. Export Lessons
  sql += '-- 2. SEED LESSONS (25 LESSONS)\n';
  const lessonsRes = await db.query('SELECT * FROM lessons ORDER BY lesson_number ASC');
  for (const l of lessonsRes.rows) {
    const title = (l.title || '').replace(/'/g, "''");
    const desc = (l.description || '').replace(/'/g, "''");
    sql += `INSERT INTO lessons (lesson_number, title, description) VALUES (${l.lesson_number}, '${title}', '${desc}') ON CONFLICT (lesson_number) DO NOTHING;\n`;
  }
  sql += '\n';

  // 3. Export Kanji
  sql += '-- 3. SEED KANJI N5 (80 KANJI)\n';
  const kanjiRes = await db.query('SELECT * FROM kanji ORDER BY stroke_count ASC, id ASC');
  for (const k of kanjiRes.rows) {
    const kanjiChar = (k.kanji || '').replace(/'/g, "''");
    const onyomi = (k.onyomi || '').replace(/'/g, "''");
    const kunyomi = (k.kunyomi || '').replace(/'/g, "''");
    const hanViet = (k.han_viet || '').replace(/'/g, "''");
    const meaning = (k.meaning || '').replace(/'/g, "''");
    const stroke = k.stroke_count || 1;
    const level = (k.level || 'N5').replace(/'/g, "''");
    const exJson = JSON.stringify(k.examples || []).replace(/'/g, "''");
    sql += `INSERT INTO kanji (kanji, onyomi, kunyomi, han_viet, meaning, stroke_count, level, examples) VALUES ('${kanjiChar}', '${onyomi}', '${kunyomi}', '${hanViet}', '${meaning}', ${stroke}, '${level}', '${exJson}'::jsonb);\n`;
  }
  sql += '\n';

  // 4. Export Vocabularies
  sql += '-- 4. SEED VOCABULARIES (1,589 WORDS)\n';
  const vocabRes = await db.query('SELECT * FROM vocabularies ORDER BY lesson_number ASC, order_num ASC');
  for (const v of vocabRes.rows) {
    const kanji = v.kanji ? `'${v.kanji.replace(/'/g, "''")}'` : 'NULL';
    const kana = (v.kana || '').replace(/'/g, "''");
    const cleanKana = v.clean_kana ? `'${v.clean_kana.replace(/'/g, "''")}'` : 'NULL';
    const romaji = (v.romaji || '').replace(/'/g, "''");
    const vietnamese = (v.vietnamese || '').replace(/'/g, "''");
    const cleanVi = v.clean_vietnamese ? `'${v.clean_vietnamese.replace(/'/g, "''")}'` : 'NULL';
    const usage = v.usage_note ? `'${v.usage_note.replace(/'/g, "''")}'` : 'NULL';
    const exJp = v.example_jp ? `'${v.example_jp.replace(/'/g, "''")}'` : 'NULL';
    const exVi = v.example_vi ? `'${v.example_vi.replace(/'/g, "''")}'` : 'NULL';

    sql += `INSERT INTO vocabularies (lesson_id, lesson_number, order_num, kanji, kana, clean_kana, romaji, vietnamese, clean_vietnamese, usage_note, example_jp, example_vi) VALUES ((SELECT id FROM lessons WHERE lesson_number = ${v.lesson_number}), ${v.lesson_number}, ${v.order_num}, ${kanji}, '${kana}', ${cleanKana}, '${romaji}', '${vietnamese}', ${cleanVi}, ${usage}, ${exJp}, ${exVi});\n`;
  }

  const outPath = path.join(__dirname, '../../database/supabase_init.sql');
  fs.writeFileSync(outPath, sql, 'utf8');
  console.log(`SUCCESS! Generated ${outPath} (${(sql.length / 1024).toFixed(1)} KB)`);
  process.exit(0);
}

exportSql().catch(err => {
  console.error('Export error:', err);
  process.exit(1);
});
