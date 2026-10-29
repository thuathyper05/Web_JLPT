const path = require('path');
const fs = require('fs');
const db = require('../config/db');

/**
 * Migrate V2: Grammar Points, Gamification & Badges
 */
async function migrateV2() {
  console.log('[Migration V2] Initializing V2 database schema...');

  try {
    // 1. Create grammar_points table
    await db.query(`
      CREATE TABLE IF NOT EXISTS grammar_points (
        id SERIAL PRIMARY KEY,
        level VARCHAR(10) NOT NULL DEFAULT 'N5',
        lesson_number INT NOT NULL,
        order_num INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        structure TEXT NOT NULL,
        meaning TEXT NOT NULL,
        usage_notes TEXT,
        examples JSONB NOT NULL DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE UNIQUE INDEX IF NOT EXISTS uq_grammar_lesson_order ON grammar_points (level, lesson_number, order_num);
      CREATE INDEX IF NOT EXISTS idx_grammar_lesson ON grammar_points (level, lesson_number);
    `);

    // 2. Seed grammar_points from n5_grammar_data.json
    const grammarJsonPath = path.join(__dirname, '../data/n5_grammar_data.json');
    if (fs.existsSync(grammarJsonPath)) {
      const grammarList = JSON.parse(fs.readFileSync(grammarJsonPath, 'utf8'));
      let insertedGrammar = 0;

      for (const g of grammarList) {
        const res = await db.query(`
          INSERT INTO grammar_points (level, lesson_number, order_num, title, structure, meaning, usage_notes, examples)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (level, lesson_number, order_num) DO UPDATE
          SET title = $4, structure = $5, meaning = $6, usage_notes = $7, examples = $8
        `, [
          'N5',
          g.lesson_number,
          g.order_num,
          g.title,
          g.structure,
          g.meaning,
          g.usage_notes || '',
          JSON.stringify(g.examples || [])
        ]);
        insertedGrammar += res.rowCount;
      }
      console.log(`[Migration V2] Seeded/Verified ${insertedGrammar} grammar points.`);
    }

    // 3. Create user_gamification table
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_gamification (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        current_streak INT DEFAULT 0,
        longest_streak INT DEFAULT 0,
        last_study_date DATE,
        total_xp INT DEFAULT 0,
        level_tier VARCHAR(50) DEFAULT 'Mầm non N5',
        gems_count INT DEFAULT 100,
        freeze_streak_count INT DEFAULT 1,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_gamify_xp ON user_gamification (total_xp DESC);
      CREATE INDEX IF NOT EXISTS idx_gamify_streak ON user_gamification (current_streak DESC);
    `);

    // 4. Create user_badges table
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_badges (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        badge_key VARCHAR(100) NOT NULL,
        unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (user_id, badge_key)
      );
      CREATE INDEX IF NOT EXISTS idx_badges_user ON user_badges (user_id);
    `);

    console.log('[Migration V2] Completed successfully!');
    return { success: true };
  } catch (err) {
    console.error('[Migration V2 Error]', err);
    throw err;
  }
}

if (require.main === module) {
  migrateV2()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { migrateV2 };
