const db = require('../config/db');

// Initialize SRS table if not exists
const initSrsTable = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS srs_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        vocab_id INTEGER NOT NULL REFERENCES vocabularies(id) ON DELETE CASCADE,
        level INTEGER NOT NULL DEFAULT 1,
        next_review_date TIMESTAMPTZ,
        last_reviewed_at TIMESTAMPTZ,
        correct_count INTEGER DEFAULT 0,
        wrong_count INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, vocab_id)
      )
    `);
  } catch (err) {
    console.warn('[SRS Table Init Notice]', err.message);
  }
};

// Auto-init
initSrsTable().catch(err => console.warn('[SRS] Table init warning:', err.message));

// SRS interval in days by level
const SRS_INTERVALS = { 1: 1, 2: 3, 3: 7, 4: 30 };

// GET /api/srs/garden - fetch all SRS entries for user
const getGarden = async (req, res) => {
  try {
    const userId = req.user.id;
    const { lesson, level } = req.query;

    let query = `
      SELECT 
        sp.id, sp.vocab_id, sp.level, sp.next_review_date, sp.last_reviewed_at,
        sp.correct_count, sp.wrong_count, sp.created_at,
        COALESCE(NULLIF(v.kanji, ''), v.kana) as word,
        v.kana as reading,
        COALESCE(v.clean_vietnamese, v.vietnamese) as meaning,
        v.lesson_number
      FROM srs_progress sp
      JOIN vocabularies v ON v.id = sp.vocab_id
      WHERE sp.user_id = $1
    `;
    const params = [userId];

    if (lesson) {
      params.push(parseInt(lesson));
      query += ` AND v.lesson_number = $${params.length}`;
    }
    if (level) {
      params.push(parseInt(level));
      query += ` AND sp.level = $${params.length}`;
    }

    query += ` ORDER BY sp.created_at DESC`;

    const result = await db.query(query, params);
    const now = new Date();

    const items = result.rows.map(row => ({
      ...row,
      is_due: row.level < 4 && row.next_review_date && new Date(row.next_review_date) <= now,
      is_overdue: row.level < 4 && row.next_review_date && (now - new Date(row.next_review_date)) > 24 * 60 * 60 * 1000
    }));

    // Summary stats
    const stats = {
      total: items.length,
      level1: items.filter(i => i.level === 1).length,
      level2: items.filter(i => i.level === 2).length,
      level3: items.filter(i => i.level === 3).length,
      level4: items.filter(i => i.level === 4).length,
      due_count: items.filter(i => i.is_due).length,
      overdue_count: items.filter(i => i.is_overdue).length
    };

    res.json({ items, stats });
  } catch (err) {
    console.error('[SRS] getGarden error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/srs/due - get due vocab for review session
const getDue = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 20;

    const result = await db.query(`
      SELECT 
        sp.id, sp.vocab_id, sp.level, sp.next_review_date,
        COALESCE(NULLIF(v.kanji, ''), v.kana) as word,
        v.kana as reading,
        COALESCE(v.clean_vietnamese, v.vietnamese) as meaning,
        v.lesson_number
      FROM srs_progress sp
      JOIN vocabularies v ON v.id = sp.vocab_id
      WHERE sp.user_id = $1
        AND sp.level < 4
        AND sp.next_review_date <= NOW()
      ORDER BY sp.next_review_date ASC
      LIMIT $2
    `, [userId, limit]);

    res.json({ items: result.rows, count: result.rows.length });
  } catch (err) {
    console.error('[SRS] getDue error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/srs/review - record a review result
const recordReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { vocab_id, correct } = req.body;

    if (!vocab_id) return res.status(400).json({ error: 'vocab_id is required' });

    // Upsert SRS entry
    const existing = await db.query(
      'SELECT * FROM srs_progress WHERE user_id = $1 AND vocab_id = $2',
      [userId, vocab_id]
    );

    const now = new Date();
    let newLevel;
    let nextReviewDate;

    if (existing.rows.length === 0) {
      // New entry
      newLevel = correct ? 2 : 1;
      const days = SRS_INTERVALS[newLevel] || 3;
      nextReviewDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

      await db.query(`
        INSERT INTO srs_progress (user_id, vocab_id, level, next_review_date, last_reviewed_at, correct_count, wrong_count)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [userId, vocab_id, newLevel, nextReviewDate, now, correct ? 1 : 0, correct ? 0 : 1]);
    } else {
      const entry = existing.rows[0];
      if (correct) {
        newLevel = Math.min(entry.level + 1, 4);
      } else {
        newLevel = Math.max(entry.level - 1, 1);
      }
      const days = SRS_INTERVALS[newLevel] || 3;
      nextReviewDate = newLevel === 4 ? null : new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

      await db.query(`
        UPDATE srs_progress 
        SET level = $1, next_review_date = $2, last_reviewed_at = $3,
            correct_count = correct_count + $4, wrong_count = wrong_count + $5
        WHERE user_id = $6 AND vocab_id = $7
      `, [newLevel, nextReviewDate, now, correct ? 1 : 0, correct ? 0 : 1, userId, vocab_id]);
    }

    res.json({ success: true, new_level: newLevel, next_review_date: nextReviewDate });
  } catch (err) {
    console.error('[SRS] recordReview error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/srs/add - add vocab to garden
const addToGarden = async (req, res) => {
  try {
    const userId = req.user.id;
    const { vocab_id } = req.body;

    if (!vocab_id) return res.status(400).json({ error: 'vocab_id is required' });

    const nextReviewDate = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);

    await db.query(`
      INSERT INTO srs_progress (user_id, vocab_id, level, next_review_date, last_reviewed_at)
      VALUES ($1, $2, 1, $3, NOW())
      ON CONFLICT (user_id, vocab_id) DO NOTHING
    `, [userId, vocab_id, nextReviewDate]);

    res.json({ success: true });
  } catch (err) {
    console.error('[SRS] addToGarden error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/srs/add-lesson - add all vocab from a lesson to garden
const addLessonToGarden = async (req, res) => {
  try {
    const userId = req.user.id;
    const { lesson_number } = req.body;

    if (!lesson_number) return res.status(400).json({ error: 'lesson_number is required' });

    const vocabs = await db.query(
      'SELECT id FROM vocabularies WHERE lesson_number = $1',
      [lesson_number]
    );

    const nextReviewDate = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);
    let added = 0;

    for (const vocab of vocabs.rows) {
      const result = await db.query(`
        INSERT INTO srs_progress (user_id, vocab_id, level, next_review_date, last_reviewed_at)
        VALUES ($1, $2, 1, $3, NOW())
        ON CONFLICT (user_id, vocab_id) DO NOTHING
      `, [userId, vocab.id, nextReviewDate]);
      if (result.rowCount > 0) added++;
    }

    res.json({ success: true, added, total: vocabs.rows.length });
  } catch (err) {
    console.error('[SRS] addLessonToGarden error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/srs/stats - summary for badge/navbar
const getStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await db.query(`
      SELECT 
        COUNT(*)::int as total,
        COUNT(CASE WHEN level = 4 THEN 1 END)::int as mastered,
        COUNT(CASE WHEN level < 4 AND next_review_date <= NOW() THEN 1 END)::int as due
      FROM srs_progress
      WHERE user_id = $1
    `, [userId]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getGarden, getDue, recordReview, addToGarden, addLessonToGarden, getStats };
