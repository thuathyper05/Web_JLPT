const db = require('../config/db');
const fallback = require('../data/fallbackData');

// Get all Kanji with filters (level, search, han_viet)
const getKanjiList = async (req, res) => {
  try {
    const { level = 'N5', search } = req.query;
    let query = 'SELECT * FROM kanji WHERE 1=1';
    const params = [];

    if (level && level !== 'all') {
      params.push(level.toUpperCase());
      query += ` AND level = $${params.length}`;
    }

    if (search) {
      params.push(`%${search.trim().toLowerCase()}%`);
      const pIdx = params.length;
      query += ` AND (
        kanji LIKE $${pIdx} OR 
        LOWER(han_viet) LIKE $${pIdx} OR 
        LOWER(meaning) LIKE $${pIdx} OR
        LOWER(kunyomi) LIKE $${pIdx} OR
        LOWER(onyomi) LIKE $${pIdx}
      )`;
    }

    query += ' ORDER BY stroke_count ASC, id ASC';

    const result = await db.query(query, params);
    if (result.rows && result.rows.length > 0) {
      return res.json(result.rows);
    }
    return res.json(fallback.getFallbackKanji(req.query));
  } catch (error) {
    console.warn('[getKanjiList DB Notice] Using local fallback kanji:', error.message);
    res.json(fallback.getFallbackKanji(req.query));
  }
};

// Get single Kanji details
const getKanjiById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM kanji WHERE id = $1 OR kanji = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy chữ Hán' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('getKanjiById error:', error);
    res.status(500).json({ message: 'Lỗi khi lấy chi tiết Kanji' });
  }
};

module.exports = { getKanjiList, getKanjiById };
