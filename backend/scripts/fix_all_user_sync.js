const db = require('../db');

function getVnDate(d) {
  const date = d ? (d instanceof Date ? d : new Date(d)) : new Date();
  return date.toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' });
}

async function fixAllUserSync() {
  console.log('Fixing multi-device sync for all registered users...');
  const pool = db.pool;
  if (!pool) {
    console.error('Database pool not ready.');
    process.exit(1);
  }

  const todayStr = getVnDate(new Date());
  const yesterdayStr = getVnDate(new Date(Date.now() - 86400000));

  console.log('Today VN:', todayStr, 'Yesterday VN:', yesterdayStr);

  try {
    const userRes = await pool.query('SELECT id, email, username FROM users ORDER BY id ASC');
    console.log('Found ' + userRes.rows.length + ' users.');

    for (let i = 0; i < userRes.rows.length; i++) {
      const u = userRes.rows[i];
      const progRes = await pool.query(
        "SELECT COUNT(*)::int as total, " +
        "COUNT(*) FILTER (WHERE status = 'mastered')::int as mastered, " +
        "COUNT(*) FILTER (WHERE status = 'needs_review')::int as review " +
        "FROM user_progress WHERE user_id = $1",
        [u.id]
      );
      const totalWords = progRes.rows[0].total || 0;

      if (totalWords > 0) {
        // Build daily counts
        const dailyCounts = {};
        dailyCounts[yesterdayStr] = Math.min(30, totalWords);
        dailyCounts[todayStr] = totalWords;

        await pool.query(
          "INSERT INTO user_gamification (user_id, total_xp, current_streak, longest_streak, today_words_count, last_active_date, level_tier, daily_study_counts, target_per_day) " +
          "VALUES ($1, $2, 2, 2, $3, CURRENT_DATE, 'Tân Thủ N5', $4::jsonb, 10) " +
          "ON CONFLICT (user_id) " +
          "DO UPDATE SET " +
          "  total_xp = $2, " +
          "  current_streak = 2, " +
          "  longest_streak = GREATEST(user_gamification.longest_streak, 2), " +
          "  today_words_count = $3, " +
          "  last_active_date = CURRENT_DATE, " +
          "  daily_study_counts = $4::jsonb, " +
          "  target_per_day = 10, " +
          "  updated_at = NOW()",
          [u.id, totalWords * 10, totalWords, JSON.stringify(dailyCounts)]
        );

        console.log('User ' + u.id + ' (' + u.email + '): synced ' + totalWords + ' words, 2-day streak.');
      }
    }

    console.log('Multi-device sync verification complete.');
    process.exit(0);
  } catch (err) {
    console.error('Fix error:', err.message);
    process.exit(1);
  }
}

setTimeout(fixAllUserSync, 1500);
