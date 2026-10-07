const db = require('../config/db');

// Get all favorite vocabularies for current user
const getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const { lesson } = req.query;

    let query = `
      SELECT 
        v.*,
        true as is_favorite,
        COALESCE(up.status, 'learning') as user_status,
        n.content as user_note,
        f.created_at as favorited_at
      FROM favorites f
      JOIN vocabularies v ON f.vocabulary_id = v.id
      LEFT JOIN user_progress up ON v.id = up.vocabulary_id AND up.user_id = $1
      LEFT JOIN notes n ON v.id = n.vocabulary_id AND n.user_id = $1
      WHERE f.user_id = $1
    `;
    const params = [userId];

    if (lesson) {
      params.push(parseInt(lesson));
      query += ` AND v.lesson_number = $${params.length}`;
    }

    query += ' ORDER BY v.lesson_number ASC, v.order_num ASC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('getFavorites error:', error);
    res.status(500).json({ message: 'Lỗi tải danh sách yêu thích' });
  }
};

// Toggle favorite
const toggleFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { vocabulary_id } = req.body;

    if (!vocabulary_id) {
      return res.status(400).json({ message: 'Thiếu vocabulary_id' });
    }

    // Check if exists
    const check = await db.query(
      'SELECT id FROM favorites WHERE user_id = $1 AND vocabulary_id = $2',
      [userId, vocabulary_id]
    );

    if (check.rows.length > 0) {
      await db.query(
        'DELETE FROM favorites WHERE user_id = $1 AND vocabulary_id = $2',
        [userId, vocabulary_id]
      );
      return res.json({ is_favorite: false, message: 'Đã xóa khỏi danh sách yêu thích' });
    } else {
      await db.query(
        'INSERT INTO favorites (user_id, vocabulary_id) VALUES ($1, $2)',
        [userId, vocabulary_id]
      );
      return res.json({ is_favorite: true, message: 'Đã thêm vào danh sách yêu thích' });
    }
  } catch (error) {
    console.error('toggleFavorite error:', error);
    res.status(500).json({ message: 'Lỗi cập nhật yêu thích' });
  }
};

module.exports = { getFavorites, toggleFavorite };
