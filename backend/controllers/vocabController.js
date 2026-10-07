const db = require('../config/db');

// Get vocabularies with optional filters (lesson, search, favorite, status)
const getVocabularies = async (req, res) => {
  try {
    const { lesson, search, status, favorite } = req.query;
    const userId = req.user ? req.user.id : null;

    let query = `
      SELECT 
        v.id,
        v.lesson_id,
        v.lesson_number,
        v.order_num,
        v.kanji,
        v.kana,
        COALESCE(v.clean_kana, v.kana) as clean_kana,
        v.romaji,
        v.vietnamese,
        COALESCE(v.clean_vietnamese, v.vietnamese) as clean_vietnamese,
        v.usage_note,
        v.example_jp,
        v.example_vi,
        ${userId ? `COALESCE(up.status, 'learning') as user_status,` : `'learning' as user_status,`}
        ${userId ? `COALESCE(up.correct_count, 0) as correct_count,` : `0 as correct_count,`}
        ${userId ? `COALESCE(up.wrong_count, 0) as wrong_count,` : `0 as wrong_count,`}
        ${userId ? `(CASE WHEN f.id IS NOT NULL THEN true ELSE false END) as is_favorite,` : `false as is_favorite,`}
        ${userId ? `n.content as user_note` : `NULL as user_note`}
      FROM vocabularies v
    `;

    const joins = [];
    if (userId) {
      joins.push(`LEFT JOIN user_progress up ON v.id = up.vocabulary_id AND up.user_id = ${userId}`);
      joins.push(`LEFT JOIN favorites f ON v.id = f.vocabulary_id AND f.user_id = ${userId}`);
      joins.push(`LEFT JOIN notes n ON v.id = n.vocabulary_id AND n.user_id = ${userId}`);
    }

    if (joins.length > 0) {
      query += ' ' + joins.join(' ');
    }

    const whereClauses = [];
    const params = [];

    if (lesson && lesson !== 'all') {
      params.push(parseInt(lesson));
      whereClauses.push(`v.lesson_number = $${params.length}`);
    }

    if (search) {
      params.push(`%${search.trim().toLowerCase()}%`);
      const pIdx = params.length;
      whereClauses.push(`(
        LOWER(COALESCE(v.kanji, '')) LIKE $${pIdx} OR 
        LOWER(v.kana) LIKE $${pIdx} OR 
        LOWER(v.romaji) LIKE $${pIdx} OR 
        LOWER(v.vietnamese) LIKE $${pIdx} OR
        LOWER(COALESCE(v.clean_vietnamese, '')) LIKE $${pIdx}
      )`);
    }

    if (userId && favorite === 'true') {
      whereClauses.push(`f.id IS NOT NULL`);
    }

    if (userId && status) {
      if (status === 'needs_review') {
        whereClauses.push(`(up.status = 'needs_review' OR up.wrong_count > 0)`);
      } else {
        params.push(status);
        whereClauses.push(`up.status = $${params.length}`);
      }
    }

    if (whereClauses.length > 0) {
      query += ' WHERE ' + whereClauses.join(' AND ');
    }

    query += ' ORDER BY v.lesson_number ASC, v.order_num ASC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('getVocabularies error:', error);
    res.status(500).json({ message: 'Lỗi tải danh sách từ vựng' });
  }
};

// Get single vocabulary
const getVocabularyById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;

    let query = `
      SELECT 
        v.id,
        v.lesson_id,
        v.lesson_number,
        v.order_num,
        v.kanji,
        v.kana,
        COALESCE(v.clean_kana, v.kana) as clean_kana,
        v.romaji,
        v.vietnamese,
        COALESCE(v.clean_vietnamese, v.vietnamese) as clean_vietnamese,
        v.usage_note,
        v.example_jp,
        v.example_vi,
        ${userId ? `COALESCE(up.status, 'learning') as user_status,` : `'learning' as user_status,`}
        ${userId ? `COALESCE(up.correct_count, 0) as correct_count,` : `0 as correct_count,`}
        ${userId ? `COALESCE(up.wrong_count, 0) as wrong_count,` : `0 as wrong_count,`}
        ${userId ? `(CASE WHEN f.id IS NOT NULL THEN true ELSE false END) as is_favorite,` : `false as is_favorite,`}
        ${userId ? `n.content as user_note` : `NULL as user_note`}
      FROM vocabularies v
    `;

    if (userId) {
      query += `
        LEFT JOIN user_progress up ON v.id = up.vocabulary_id AND up.user_id = ${userId}
        LEFT JOIN favorites f ON v.id = f.vocabulary_id AND f.user_id = ${userId}
        LEFT JOIN notes n ON v.id = n.vocabulary_id AND n.user_id = ${userId}
      `;
    }

    query += ` WHERE v.id = $1`;

    const result = await db.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy từ vựng' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('getVocabularyById error:', error);
    res.status(500).json({ message: 'Lỗi khi lấy từ vựng' });
  }
};

// Search vocabulary across all fields with smart match and sorting
const searchVocabulary = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) {
      return res.json([]);
    }

    const term = `%${q.trim().toLowerCase()}%`;
    const exact = q.trim().toLowerCase();

    const query = `
      SELECT 
        v.id, v.lesson_number, v.order_num, v.kanji, v.kana, 
        COALESCE(v.clean_kana, v.kana) as clean_kana,
        v.romaji, v.vietnamese, 
        COALESCE(v.clean_vietnamese, v.vietnamese) as clean_vietnamese,
        v.usage_note,
        l.title as lesson_title
      FROM vocabularies v
      JOIN lessons l ON v.lesson_id = l.id
      WHERE 
        LOWER(COALESCE(v.kanji, '')) LIKE $1 OR 
        LOWER(v.kana) LIKE $1 OR 
        LOWER(v.romaji) LIKE $1 OR 
        LOWER(v.vietnamese) LIKE $1 OR
        LOWER(COALESCE(v.clean_vietnamese, '')) LIKE $1
      ORDER BY 
        CASE 
          WHEN LOWER(COALESCE(v.kanji, '')) = $2 THEN 1
          WHEN LOWER(v.kana) = $2 THEN 2
          WHEN LOWER(v.romaji) = $2 THEN 3
          WHEN LOWER(COALESCE(v.clean_vietnamese, '')) = $2 THEN 4
          WHEN LOWER(v.vietnamese) = $2 THEN 5
          WHEN LOWER(COALESCE(v.kanji, '')) LIKE $2 || '%' THEN 6
          WHEN LOWER(v.kana) LIKE $2 || '%' THEN 7
          ELSE 8
        END,
        v.lesson_number ASC, 
        v.order_num ASC
      LIMIT 100
    `;
    const result = await db.query(query, [term, exact]);
    res.json(result.rows);
  } catch (error) {
    console.error('searchVocabulary error:', error);
    res.status(500).json({ message: 'Lỗi tìm kiếm từ vựng' });
  }
};

module.exports = { getVocabularies, getVocabularyById, searchVocabulary };
