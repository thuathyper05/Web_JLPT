const db = require('../config/db');

// Get overall and per-lesson progress for user
const getProgress = async (req, res) => {
  try {
    const userId = req.user.id;

    // Overall stats
    const statsQuery = `
      SELECT
        COUNT(v.id)::int as total_vocabularies,
        COUNT(up.id)::int as studied_vocabularies,
        COUNT(CASE WHEN up.status = 'mastered' THEN 1 END)::int as mastered_count,
        COUNT(CASE WHEN up.status = 'needs_review' OR up.wrong_count > 0 THEN 1 END)::int as needs_review_count,
        COALESCE(SUM(up.correct_count), 0)::int as total_correct,
        COALESCE(SUM(up.wrong_count), 0)::int as total_wrong
      FROM vocabularies v
      LEFT JOIN user_progress up ON v.id = up.vocabulary_id AND up.user_id = $1
    `;
    const statsRes = await db.query(statsQuery, [userId]);
    const stats = statsRes.rows[0];

    // Per-lesson progress
    const lessonProgressQuery = `
      SELECT 
        l.lesson_number,
        l.title,
        COUNT(v.id)::int as total_words,
        COUNT(CASE WHEN up.id IS NOT NULL THEN 1 END)::int as studied_words,
        COUNT(CASE WHEN up.status = 'mastered' THEN 1 END)::int as mastered_words,
        COUNT(CASE WHEN up.status = 'needs_review' THEN 1 END)::int as needs_review_words,
        ROUND(
          (COUNT(CASE WHEN up.status = 'mastered' THEN 1 END)::numeric / NULLIF(COUNT(v.id), 0)) * 100, 
          1
        ) as mastery_percent
      FROM lessons l
      JOIN vocabularies v ON l.id = v.lesson_id
      LEFT JOIN user_progress up ON v.id = up.vocabulary_id AND up.user_id = $1
      GROUP BY l.lesson_number, l.title
      ORDER BY l.lesson_number ASC
    `;
    const lessonRes = await db.query(lessonProgressQuery, [userId]);

    // Study session history
    const historyRes = await db.query(
      `SELECT * FROM study_sessions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20`,
      [userId]
    );

    res.json({
      overall: {
        total_vocabularies: stats.total_vocabularies,
        studied_vocabularies: stats.studied_vocabularies,
        mastered_count: stats.mastered_count,
        needs_review_count: stats.needs_review_count,
        accuracy_rate: (stats.total_correct + stats.total_wrong) > 0 
          ? Math.round((stats.total_correct / (stats.total_correct + stats.total_wrong)) * 100)
          : 0
      },
      lessons: lessonRes.rows,
      recent_sessions: historyRes.rows
    });
  } catch (error) {
    console.error('getProgress error:', error);
    res.status(500).json({ message: 'Lỗi tải tiến độ học tập' });
  }
};

// Update vocabulary progress directly (e.g. mark remembered/not remembered in Flashcard or Lesson mode)
const updateVocabularyProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { vocabulary_id, status } = req.body; // status: 'mastered' | 'needs_review' | 'learning'

    if (!vocabulary_id || !status) {
      return res.status(400).json({ message: 'Thiếu thông tin cập nhật' });
    }

    const isMastered = status === 'mastered';
    const isNeedsReview = status === 'needs_review';

    const result = await db.query(`
      INSERT INTO user_progress (user_id, vocabulary_id, status, correct_count, wrong_count, last_studied_at)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id, vocabulary_id) DO UPDATE
      SET 
        status = $3,
        correct_count = user_progress.correct_count + $4,
        wrong_count = user_progress.wrong_count + $5,
        last_studied_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [
      userId, 
      vocabulary_id, 
      status, 
      isMastered ? 1 : 0, 
      isNeedsReview ? 1 : 0
    ]);

    res.json({ message: 'Cập nhật tiến độ thành công', progress: result.rows[0] });
  } catch (error) {
    console.error('updateVocabularyProgress error:', error);
    res.status(500).json({ message: 'Lỗi cập nhật tiến độ' });
  }
};

module.exports = { getProgress, updateVocabularyProgress };
