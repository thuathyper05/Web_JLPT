const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');

async function autoInitDatabase(pool) {
  if (!pool) return;

  const client = await pool.connect();
  try {
    // 1. Create Core Schema if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        auth_provider VARCHAR(50) DEFAULT 'local',
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS lessons (
        id SERIAL PRIMARY KEY,
        level VARCHAR(10) DEFAULT 'N5',
        lesson_number INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(level, lesson_number)
      );

      CREATE TABLE IF NOT EXISTS vocabularies (
        id SERIAL PRIMARY KEY,
        lesson_id INT REFERENCES lessons(id) ON DELETE CASCADE,
        level VARCHAR(10) DEFAULT 'N5',
        lesson_number INT NOT NULL,
        order_num INT NOT NULL,
        kanji VARCHAR(150),
        kana VARCHAR(200) NOT NULL,
        clean_kana VARCHAR(200),
        romaji VARCHAR(200) NOT NULL,
        vietnamese TEXT NOT NULL,
        clean_vietnamese TEXT,
        example_jp TEXT,
        example_vi TEXT,
        usage_note TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS kanji (
        id SERIAL PRIMARY KEY,
        level VARCHAR(10) DEFAULT 'N5',
        lesson_number INT DEFAULT 1,
        kanji VARCHAR(20) NOT NULL,
        onyomi VARCHAR(200),
        kunyomi VARCHAR(200),
        han_viet VARCHAR(100),
        meaning VARCHAR(255),
        stroke_count INT,
        examples JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS grammar_points (
        id SERIAL PRIMARY KEY,
        level VARCHAR(10) DEFAULT 'N5',
        lesson_number INT DEFAULT 1,
        order_num INT DEFAULT 1,
        title VARCHAR(255) NOT NULL,
        structure TEXT,
        meaning TEXT,
        usage_notes TEXT,
        examples JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS particles (
        id SERIAL PRIMARY KEY,
        level VARCHAR(10) DEFAULT 'N5',
        particle VARCHAR(50) NOT NULL,
        role TEXT,
        meaning TEXT,
        example TEXT,
        translation TEXT,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS particle_exercises (
        id SERIAL PRIMARY KEY,
        level VARCHAR(10) DEFAULT 'N5',
        sentence_jp TEXT NOT NULL,
        sentence_vi TEXT NOT NULL,
        options JSONB DEFAULT '[]'::jsonb,
        correct_answer VARCHAR(50) NOT NULL,
        explanation TEXT,
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

      CREATE TABLE IF NOT EXISTS user_gamification (
        user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        total_xp INT DEFAULT 0,
        current_streak INT DEFAULT 0,
        longest_streak INT DEFAULT 0,
        today_words_count INT DEFAULT 0,
        last_active_date DATE DEFAULT CURRENT_DATE,
        level_tier VARCHAR(50) DEFAULT 'Tân Thủ N5',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_badges (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        badge_key VARCHAR(50) NOT NULL,
        unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, badge_key)
      );

      CREATE TABLE IF NOT EXISTS srs_progress (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        vocabulary_id INT REFERENCES vocabularies(id) ON DELETE CASCADE,
        interval_days INT DEFAULT 1,
        ease_factor NUMERIC(3,2) DEFAULT 2.50,
        repetition_count INT DEFAULT 0,
        next_review_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, vocabulary_id)
      );

      CREATE TABLE IF NOT EXISTS forum_comments (
        id SERIAL PRIMARY KEY,
        article_id VARCHAR(100) NOT NULL,
        author_name VARCHAR(100) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS forum_reviews (
        id SERIAL PRIMARY KEY,
        center_name VARCHAR(150) NOT NULL,
        author_name VARCHAR(100) NOT NULL,
        rating INT DEFAULT 5,
        review_text TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS support_feedbacks (
        id SERIAL PRIMARY KEY,
        user_name VARCHAR(100) NOT NULL,
        user_email VARCHAR(150) NOT NULL,
        category VARCHAR(100) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ensure kanji unique index
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_kanji_level_char ON kanji (level, kanji);
      CREATE INDEX IF NOT EXISTS idx_vocab_level_lesson ON vocabularies (level, lesson_number);
      CREATE INDEX IF NOT EXISTS idx_lessons_level ON lessons (level);
    `);

    // 2. Check if vocabularies table has data
    const vocabCountRes = await client.query('SELECT COUNT(*) FROM vocabularies');
    const totalVocab = parseInt(vocabCountRes.rows[0].count, 10);

    if (totalVocab === 0) {
      console.log('[Auto Seed] Empty database detected on cloud/local. Seeding complete JLPT dataset (N5 - N1)...');

      // Seed Lessons
      const lessonsFile = path.join(DATA_DIR, 'all_lessons.json');
      if (fs.existsSync(lessonsFile)) {
        const lessonsData = JSON.parse(fs.readFileSync(lessonsFile, 'utf8'));
        for (const l of lessonsData) {
          await client.query(`
            INSERT INTO lessons (level, lesson_number, title, description)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (level, lesson_number) DO NOTHING
          `, [l.level, l.lesson_number, l.title, l.description]);
        }
        console.log(`[Auto Seed] Seeded ${lessonsData.length} lessons.`);
      }

      // Build lesson map
      const lessonRows = await client.query('SELECT id, level, lesson_number FROM lessons');
      const lessonIdMap = {};
      lessonRows.rows.forEach(r => {
        lessonIdMap[`${r.level}_${r.lesson_number}`] = r.id;
      });

      // Seed Vocabularies
      const vocabFile = path.join(DATA_DIR, 'all_vocabularies.json');
      if (fs.existsSync(vocabFile)) {
        const vocabData = JSON.parse(fs.readFileSync(vocabFile, 'utf8'));
        const BATCH_SIZE = 400;
        for (let i = 0; i < vocabData.length; i += BATCH_SIZE) {
          const batch = vocabData.slice(i, i + BATCH_SIZE);
          const values = [];
          const placeholders = [];
          let paramIdx = 1;

          for (const v of batch) {
            const lessonId = lessonIdMap[`${v.level}_${v.lesson_number}`] || null;
            placeholders.push(`($${paramIdx}, $${paramIdx+1}, $${paramIdx+2}, $${paramIdx+3}, $${paramIdx+4}, $${paramIdx+5}, $${paramIdx+6}, $${paramIdx+7}, $${paramIdx+8}, $${paramIdx+9}, $${paramIdx+10}, $${paramIdx+11}, $${paramIdx+12})`);
            values.push(
              lessonId,
              v.level || 'N5',
              v.lesson_number || 1,
              v.order_num || 1,
              v.kanji || '',
              v.kana || '',
              v.clean_kana || v.kana || '',
              v.romaji || '',
              v.vietnamese || '',
              v.clean_vietnamese || v.vietnamese || '',
              v.example_jp || '',
              v.example_vi || '',
              v.usage_note || ''
            );
            paramIdx += 13;
          }

          const query = `
            INSERT INTO vocabularies (
              lesson_id, level, lesson_number, order_num,
              kanji, kana, clean_kana, romaji,
              vietnamese, clean_vietnamese, example_jp, example_vi, usage_note
            ) VALUES ${placeholders.join(', ')}
          `;
          await client.query(query, values);
        }
        console.log(`[Auto Seed] Seeded ${vocabData.length} vocabularies successfully.`);
      }

      // Seed Kanji
      const kanjiFile = path.join(DATA_DIR, 'all_kanji.json');
      if (fs.existsSync(kanjiFile)) {
        const kanjiData = JSON.parse(fs.readFileSync(kanjiFile, 'utf8'));
        for (const k of kanjiData) {
          await client.query(`
            INSERT INTO kanji (level, lesson_number, kanji, onyomi, kunyomi, han_viet, meaning, stroke_count, examples)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (level, kanji) DO NOTHING
          `, [
            k.level,
            k.lesson_number || 1,
            k.kanji,
            k.onyomi || '',
            k.kunyomi || '',
            k.han_viet || '',
            k.meaning || '',
            k.stroke_count || 5,
            JSON.stringify(k.examples || [])
          ]);
        }
        console.log(`[Auto Seed] Seeded ${kanjiData.length} kanji successfully.`);
      }

      // Seed Grammar
      const grammarFile = path.join(DATA_DIR, 'all_grammar.json');
      if (fs.existsSync(grammarFile)) {
        const grammarData = JSON.parse(fs.readFileSync(grammarFile, 'utf8'));
        for (const g of grammarData) {
          await client.query(`
            INSERT INTO grammar_points (level, lesson_number, order_num, title, structure, meaning, usage_notes, examples)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `, [
            g.level,
            g.lesson_number || 1,
            g.order_num || 1,
            g.title,
            g.structure || '',
            g.meaning || '',
            g.usage_notes || '',
            JSON.stringify(g.examples || [])
          ]);
        }
        console.log(`[Auto Seed] Seeded ${grammarData.length} grammar points.`);
      }

      // Seed Particles
      const particlesFile = path.join(DATA_DIR, 'all_particles.json');
      if (fs.existsSync(particlesFile)) {
        const particlesData = JSON.parse(fs.readFileSync(particlesFile, 'utf8'));
        for (const p of particlesData) {
          await client.query(`
            INSERT INTO particles (level, particle, role, meaning, example, translation, notes)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
          `, [p.level, p.particle, p.role, p.meaning, p.example, p.translation, p.notes]);
        }
        console.log(`[Auto Seed] Seeded ${particlesData.length} particles.`);
      }

      // Seed Particle Exercises
      const exercisesFile = path.join(DATA_DIR, 'all_particle_exercises.json');
      if (fs.existsSync(exercisesFile)) {
        const exercisesData = JSON.parse(fs.readFileSync(exercisesFile, 'utf8'));
        for (const e of exercisesData) {
          await client.query(`
            INSERT INTO particle_exercises (level, sentence_jp, sentence_vi, options, correct_answer, explanation)
            VALUES ($1, $2, $3, $4, $5, $6)
          `, [e.level, e.sentence_jp, e.sentence_vi, JSON.stringify(e.options || []), e.correct_answer, e.explanation]);
        }
        console.log(`[Auto Seed] Seeded ${exercisesData.length} particle exercises.`);
      }

      console.log('[Auto Seed] Complete! All tables and JLPT datasets ready.');
    } else {
      console.log(`[PostgreSQL Schema] Database verified healthy with ${totalVocab} vocabularies.`);
    }
  } catch (err) {
    console.error('[Database Auto-Init] Error:', err.message);
  } finally {
    client.release();
  }
}

module.exports = {
  autoInitDatabase
};
