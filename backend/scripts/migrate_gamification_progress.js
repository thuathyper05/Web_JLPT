const db = require('../db');

setTimeout(async function() {
  try {
    console.log('[Migration] Starting database migration for gamification and progress...');

    // 1. Drop foreign key constraint on user_progress.vocabulary_id to allow custom, quiz, and seed word IDs without conflict
    await db.pool.query('ALTER TABLE user_progress DROP CONSTRAINT IF EXISTS user_progress_vocabulary_id_fkey;');
    console.log('[Migration] Dropped constraint user_progress_vocabulary_id_fkey successfully.');

    // 2. Add daily_study_counts JSONB and target_per_day to user_gamification
    await db.pool.query('ALTER TABLE user_gamification ADD COLUMN IF NOT EXISTS daily_study_counts JSONB DEFAULT \'{}\'::jsonb;');
    await db.pool.query('ALTER TABLE user_gamification ADD COLUMN IF NOT EXISTS target_per_day INT DEFAULT 10;');
    console.log('[Migration] Added daily_study_counts and target_per_day columns successfully.');

    // 3. Populate existing user_gamification rows with accurate counts from user_progress if available
    const usersRes = await db.pool.query('SELECT id FROM users');
    for (let i = 0; i < usersRes.rows.length; i++) {
      const uId = usersRes.rows[i].id;
      const progRes = await db.pool.query(
        'SELECT TO_CHAR(last_studied_at, \'YYYY-MM-DD\') as study_date, COUNT(*) as word_count FROM user_progress WHERE user_id = $1 GROUP BY TO_CHAR(last_studied_at, \'YYYY-MM-DD\')',
        [uId]
      );
      if (progRes.rows.length > 0) {
        const counts = {};
        let totalWords = 0;
        for (let j = 0; j < progRes.rows.length; j++) {
          const row = progRes.rows[j];
          counts[row.study_date] = parseInt(row.word_count, 10);
          totalWords += parseInt(row.word_count, 10);
        }
        await db.pool.query(
          'UPDATE user_gamification SET daily_study_counts = $1 WHERE user_id = $2',
          [JSON.stringify(counts), uId]
        );
      }
    }
    console.log('[Migration] Completed migration successfully.');
  } catch (err) {
    console.error('[Migration Error]', err);
  }
  process.exit(0);
}, 1200);
