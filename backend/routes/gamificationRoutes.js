const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { optionalAuth, authMiddleware } = require('../middleware/auth');

// Tier mapping by XP
function calculateTier(xp) {
  if (xp >= 8000) return { title: 'Shogun N1 (Tướng quân)', nextXp: 15000, minXp: 8000 };
  if (xp >= 4000) return { title: 'Lãng khách N3 (Ronin)', nextXp: 8000, minXp: 4000 };
  if (xp >= 2000) return { title: 'Chiến binh N4 (Bushi)', nextXp: 4000, minXp: 2000 };
  if (xp >= 900) return { title: 'Samurai N5', nextXp: 2000, minXp: 900 };
  if (xp >= 300) return { title: 'Tập sự N5 (Deshi)', nextXp: 900, minXp: 300 };
  return { title: 'Mầm non N5 (Shin\'in)', nextXp: 300, minXp: 0 };
}

// Available Badges Catalog
const BADGES_CATALOG = {
  first_step: { key: 'first_step', title: 'Bước đầu tiên', desc: 'Hoàn thành bài học tiếng Nhật đầu tiên', icon: 'Award' },
  streak_3: { key: 'streak_3', title: 'Giữ lửa 3 ngày', desc: 'Học liên tục 3 ngày không nghỉ', icon: 'Flame' },
  streak_7: { key: 'streak_7', title: 'Chiến binh 7 ngày', desc: 'Duy trì chuỗi học tập trọn vẹn 1 tuần', icon: 'Zap' },
  streak_30: { key: 'streak_30', title: 'Kiên trì 30 ngày', desc: 'Thói quen vàng: 30 ngày liên tiếp', icon: 'Trophy' },
  speed_demon: { key: 'speed_demon', title: 'Phản xạ Thần tốc', desc: 'Ghép cặp nối từ 10/10 dưới 40 giây', icon: 'Sparkles' },
  kanji_explorer: { key: 'kanji_explorer', title: 'Thám hiểm Chữ Hán', desc: 'Học và ghi nhớ 20 Kanji căn bản', icon: 'BookOpen' }
};

// GET /api/gamification/status - Get current user streak, XP, badges
router.get('/status', optionalAuth, async (req, res) => {
  try {
    if (!req.user) {
      // Guest status default
      const defaultTier = calculateTier(0);
      return res.json({
        success: true,
        is_guest: true,
        current_streak: 1,
        longest_streak: 1,
        is_today_completed: false,
        total_xp: 0,
        level_tier: defaultTier.title,
        next_tier_xp: defaultTier.nextXp,
        min_tier_xp: defaultTier.minXp,
        gems_count: 50,
        freeze_streak_count: 1,
        badges: [
          { ...BADGES_CATALOG.first_step, unlocked: true, unlocked_at: new Date().toISOString() }
        ]
      });
    }

    const userId = req.user.id;

    // Fetch or initialize user_gamification record
    let gamifyRes = await db.query(
      'SELECT * FROM user_gamification WHERE user_id = $1',
      [userId]
    );

    if (gamifyRes.rows.length === 0) {
      await db.query(`
        INSERT INTO user_gamification (user_id, current_streak, longest_streak, total_xp, level_tier, gems_count)
        VALUES ($1, 1, 1, 50, 'Mầm non N5', 100)
        ON CONFLICT (user_id) DO NOTHING
      `, [userId]);

      gamifyRes = await db.query(
        'SELECT * FROM user_gamification WHERE user_id = $1',
        [userId]
      );
    }

    const record = gamifyRes.rows[0];
    const tierInfo = calculateTier(record.total_xp || 0);

    // Fetch user badges
    const badgesRes = await db.query(
      'SELECT badge_key, unlocked_at FROM user_badges WHERE user_id = $1',
      [userId]
    );
    const unlockedMap = {};
    badgesRes.rows.forEach(b => { unlockedMap[b.badge_key] = b.unlocked_at; });

    const allBadges = Object.values(BADGES_CATALOG).map(b => ({
      ...b,
      unlocked: Boolean(unlockedMap[b.key]),
      unlocked_at: unlockedMap[b.key] || null
    }));

    // Check if today was already completed
    const todayStr = new Date().toISOString().split('T')[0];
    const lastDateStr = record.last_study_date ? new Date(record.last_study_date).toISOString().split('T')[0] : null;
    const isTodayCompleted = todayStr === lastDateStr;

    res.json({
      success: true,
      is_guest: false,
      current_streak: record.current_streak || 1,
      longest_streak: record.longest_streak || 1,
      is_today_completed: isTodayCompleted,
      total_xp: record.total_xp || 0,
      level_tier: tierInfo.title,
      next_tier_xp: tierInfo.nextXp,
      min_tier_xp: tierInfo.minXp,
      gems_count: record.gems_count || 100,
      freeze_streak_count: record.freeze_streak_count || 1,
      badges: allBadges
    });
  } catch (err) {
    console.error('Error in /api/gamification/status:', err);
    res.status(500).json({ success: false, message: 'Server error fetching gamification status' });
  }
});

// POST /api/gamification/tick - Record study action, update XP & Streak
router.post('/tick', optionalAuth, async (req, res) => {
  try {
    const { action_type = 'study_session', xp_gain = 15 } = req.body;

    if (!req.user) {
      // Guest response
      return res.json({
        success: true,
        xp_added: xp_gain,
        new_total_xp: xp_gain,
        streak: 1,
        is_guest: true
      });
    }

    const userId = req.user.id;
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Get current record
    let resGamify = await db.query(
      'SELECT * FROM user_gamification WHERE user_id = $1',
      [userId]
    );

    let currentStreak = 1;
    let longestStreak = 1;
    let totalXp = 0;
    let gems = 100;
    let lastDateStr = null;

    if (resGamify.rows.length === 0) {
      totalXp = xp_gain;
      currentStreak = 1;
      longestStreak = 1;
      await db.query(`
        INSERT INTO user_gamification (user_id, current_streak, longest_streak, last_study_date, total_xp, gems_count)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [userId, currentStreak, longestStreak, todayStr, totalXp, gems]);
    } else {
      const row = resGamify.rows[0];
      totalXp = (row.total_xp || 0) + xp_gain;
      currentStreak = row.current_streak || 1;
      longestStreak = row.longest_streak || 1;
      gems = (row.gems_count || 100) + 2; // small gem reward
      lastDateStr = row.last_study_date ? new Date(row.last_study_date).toISOString().split('T')[0] : null;

      if (lastDateStr !== todayStr) {
        // Calculate difference in days
        if (lastDateStr) {
          const lastDate = new Date(lastDateStr);
          const diffDays = Math.round((today - lastDate) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            currentStreak += 1;
          } else if (diffDays > 1) {
            currentStreak = 1; // streak reset if missed
          }
        }
        longestStreak = Math.max(longestStreak, currentStreak);
      }

      const tier = calculateTier(totalXp).title;

      await db.query(`
        UPDATE user_gamification
        SET current_streak = $1, longest_streak = $2, last_study_date = $3, total_xp = $4, level_tier = $5, gems_count = $6, updated_at = NOW()
        WHERE user_id = $7
      `, [currentStreak, longestStreak, todayStr, totalXp, tier, gems, userId]);
    }

    // Check & award badges automatically
    const newUnlockedBadges = [];
    if (currentStreak >= 3) {
      const r = await db.query(`
        INSERT INTO user_badges (user_id, badge_key) VALUES ($1, 'streak_3') ON CONFLICT DO NOTHING RETURNING *
      `, [userId]);
      if (r.rowCount > 0) newUnlockedBadges.push(BADGES_CATALOG.streak_3);
    }
    if (currentStreak >= 7) {
      const r = await db.query(`
        INSERT INTO user_badges (user_id, badge_key) VALUES ($1, 'streak_7') ON CONFLICT DO NOTHING RETURNING *
      `, [userId]);
      if (r.rowCount > 0) newUnlockedBadges.push(BADGES_CATALOG.streak_7);
    }
    if (totalXp >= 1000) {
      const r = await db.query(`
        INSERT INTO user_badges (user_id, badge_key) VALUES ($1, 'streak_30') ON CONFLICT DO NOTHING RETURNING *
      `, [userId]);
      if (r.rowCount > 0) newUnlockedBadges.push(BADGES_CATALOG.streak_30);
    }

    res.json({
      success: true,
      xp_added: xp_gain,
      new_total_xp: totalXp,
      current_streak: currentStreak,
      longest_streak: longestStreak,
      gems_count: gems,
      new_badges: newUnlockedBadges
    });
  } catch (err) {
    console.error('Error in /api/gamification/tick:', err);
    res.status(500).json({ success: false, message: 'Server error processing gamification tick' });
  }
});

// GET /api/gamification/leaderboard - Top learners
router.get('/leaderboard', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT u.id, u.username, u.email, COALESCE(g.total_xp, 0) as total_xp,
             COALESCE(g.current_streak, 1) as current_streak,
             COALESCE(g.level_tier, 'Mầm non N5') as level_tier
      FROM users u
      LEFT JOIN user_gamification g ON u.id = g.user_id
      ORDER BY total_xp DESC, current_streak DESC
      LIMIT 20
    `);

    const leaderboard = result.rows.map((row, idx) => ({
      rank: idx + 1,
      id: row.id,
      name: row.username || row.email?.split('@')[0] || `Học viên #${row.id}`,
      total_xp: parseInt(row.total_xp),
      current_streak: parseInt(row.current_streak),
      level_tier: row.level_tier
    }));

    res.json({ success: true, leaderboard });
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    res.status(500).json({ success: false, message: 'Server error fetching leaderboard' });
  }
});

module.exports = router;
