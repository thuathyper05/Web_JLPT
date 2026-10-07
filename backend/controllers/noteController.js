const db = require('../config/db');

// Get all notes for user
const getNotes = async (req, res) => {
  try {
    const userId = req.user.id;
    const { lesson, search } = req.query;

    let query = `
      SELECT 
        n.id as note_id,
        n.content,
        n.updated_at,
        v.id as vocabulary_id,
        v.lesson_number,
        v.order_num,
        v.kanji,
        v.kana,
        v.romaji,
        v.vietnamese
      FROM notes n
      JOIN vocabularies v ON n.vocabulary_id = v.id
      WHERE n.user_id = $1
    `;
    const params = [userId];

    if (lesson) {
      params.push(parseInt(lesson));
      query += ` AND v.lesson_number = $${params.length}`;
    }

    if (search) {
      params.push(`%${search.trim().toLowerCase()}%`);
      const pIdx = params.length;
      query += ` AND (LOWER(n.content) LIKE $${pIdx} OR LOWER(COALESCE(v.kanji, '')) LIKE $${pIdx} OR LOWER(v.kana) LIKE $${pIdx} OR LOWER(v.vietnamese) LIKE $${pIdx})`;
    }

    query += ' ORDER BY n.updated_at DESC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('getNotes error:', error);
    res.status(500).json({ message: 'Lỗi tải ghi chú' });
  }
};

// Save or update note for a vocabulary
const saveNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const { vocabulary_id, content } = req.body;

    if (!vocabulary_id) {
      return res.status(400).json({ message: 'Thiếu vocabulary_id' });
    }

    if (!content || !content.trim()) {
      // If content is empty, delete note
      await db.query('DELETE FROM notes WHERE user_id = $1 AND vocabulary_id = $2', [userId, vocabulary_id]);
      return res.json({ message: 'Đã xóa ghi chú', note: null });
    }

    const result = await db.query(`
      INSERT INTO notes (user_id, vocabulary_id, content, updated_at)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id, vocabulary_id) DO UPDATE
      SET content = $3, updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [userId, vocabulary_id, content.trim()]);

    res.json({ message: 'Đã lưu ghi chú thành công', note: result.rows[0] });
  } catch (error) {
    console.error('saveNote error:', error);
    res.status(500).json({ message: 'Lỗi khi lưu ghi chú' });
  }
};

// Delete note
const deleteNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params; // vocabulary_id or note_id

    await db.query(
      'DELETE FROM notes WHERE user_id = $1 AND (id = $2 OR vocabulary_id = $2)',
      [userId, parseInt(id)]
    );

    res.json({ message: 'Đã xóa ghi chú thành công' });
  } catch (error) {
    console.error('deleteNote error:', error);
    res.status(500).json({ message: 'Lỗi khi xóa ghi chú' });
  }
};

module.exports = { getNotes, saveNote, deleteNote };
