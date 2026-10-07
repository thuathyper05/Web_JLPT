const db = require('../config/db');

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
    res.json(result.rows);
  } catch (error) {
    console.error('getLessons error:', error);
    res.status(500).json({ message: 'Lỗi tải danh sách bài học' });
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

    if (lessonResult.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy bài học' });
    }

    const lesson = lessonResult.rows[0];
    res.json(lesson);
  } catch (error) {
    console.error('getLessonById error:', error);
    res.status(500).json({ message: 'Lỗi khi lấy thông tin bài học' });
  }
};

module.exports = { getLessons, getLessonById };
