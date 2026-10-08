const db = require('../config/db');
const fallback = require('../data/fallbackData');

// Get all 25 lessons with vocabulary counts
const getLessons = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        l.id, 
        l.lesson_number, 
        l.title, 
        l.description, 
        COUNT(v.id)::int as vocab_count
      FROM lessons l
      LEFT JOIN vocabularies v ON l.id = v.lesson_id
      GROUP BY l.id, l.lesson_number, l.title, l.description
      ORDER BY l.lesson_number ASC
    `);
    
    if (result.rows && result.rows.length > 0) {
      return res.json(result.rows);
    }
    // Fallback if table is empty
    return res.json(fallback.getFallbackLessons());
  } catch (error) {
    console.warn('[getLessons DB Notice] Using local fallback lessons:', error.message);
    res.json(fallback.getFallbackLessons());
  }
};

// Get single lesson details
const getLessonById = async (req, res) => {
  try {
    const { id } = req.params;
    const lessonResult = await db.query(
      'SELECT * FROM lessons WHERE id = $1 OR lesson_number = $1',
      [parseInt(id)]
    );

    if (lessonResult.rows.length > 0) {
      return res.json(lessonResult.rows[0]);
    }

    const fbLesson = fallback.getFallbackLessonById(id);
    if (fbLesson) {
      return res.json(fbLesson);
    }
    return res.status(404).json({ message: 'Không tìm thấy bài học' });
  } catch (error) {
    console.warn('[getLessonById DB Notice] Using local fallback lesson:', error.message);
    const fbLesson = fallback.getFallbackLessonById(req.params.id);
    if (fbLesson) {
      return res.json(fbLesson);
    }
    res.status(404).json({ message: 'Không tìm thấy bài học' });
  }
};

module.exports = { getLessons, getLessonById };
