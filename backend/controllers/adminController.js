const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { deduplicateDatabase } = require('../scripts/deduplicate');

const ADMIN_EMAIL = 'thuathyper05@gmail.com';
const ADMIN_PASSWORD_RAW = 'Thuatnguyen1204@@@';

/**
 * Admin Login
 */
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Vui lòng cung cấp email và mật khẩu quản trị viên' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user exists
    let userRes = await db.query(
      'SELECT id, username, email, password_hash, role FROM users WHERE LOWER(email) = $1',
      [cleanEmail]
    );

    // If logging in as primary superadmin and account not yet created or role not yet set
    if (cleanEmail === ADMIN_EMAIL.toLowerCase()) {
      if (password === ADMIN_PASSWORD_RAW) {
        let adminUser;
        if (userRes.rows.length === 0) {
          const hash = await bcrypt.hash(ADMIN_PASSWORD_RAW, 10);
          const ins = await db.query(
            'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role',
            ['thuathyper05', cleanEmail, hash, 'admin']
          );
          adminUser = ins.rows[0];
        } else {
          adminUser = userRes.rows[0];
          if (adminUser.role !== 'admin') {
            await db.query('UPDATE users SET role = $1 WHERE id = $2', ['admin', adminUser.id]);
            adminUser.role = 'admin';
          }
        }

        const token = jwt.sign(
          { id: adminUser.id, username: adminUser.username, email: adminUser.email, role: 'admin' },
          process.env.JWT_SECRET || 'super_secret_jlpt_n5_key_2026',
          { expiresIn: '7d' }
        );

        return res.json({
          message: 'Đăng nhập Quản trị viên thành công!',
          token,
          admin: {
            id: adminUser.id,
            username: adminUser.username,
            email: adminUser.email,
            role: 'admin'
          }
        });
      }
    }

    if (userRes.rows.length === 0) {
      return res.status(401).json({ message: 'Tài khoản quản trị không tồn tại' });
    }

    const user = userRes.rows[0];
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Tài khoản này không có quyền truy cập hệ thống Quản trị' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash || '');
    if (!isMatch && !(cleanEmail === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD_RAW)) {
      return res.status(401).json({ message: 'Mật khẩu quản trị viên không chính xác' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: 'admin' },
      process.env.JWT_SECRET || 'super_secret_jlpt_n5_key_2026',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Đăng nhập Quản trị viên thành công!',
      token,
      admin: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: 'admin'
      }
    });
  } catch (error) {
    console.error('adminLogin error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi đăng nhập quản trị viên' });
  }
};

/**
 * Get current admin profile
 */
const getAdminMe = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, username, email, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin quản trị viên' });
    }
    res.json({ admin: result.rows[0] });
  } catch (error) {
    console.error('getAdminMe error:', error);
    res.status(500).json({ message: 'Lỗi lấy thông tin quản trị viên' });
  }
};

/**
 * System KPI Dashboard Stats
 */
const getSystemStats = async (req, res) => {
  try {
    const [
      lessonsRes,
      vocabRes,
      kanjiRes,
      usersRes,
      sessionsRes,
      progressRes,
      dupVocabRes,
      dupKanjiRes
    ] = await Promise.all([
      db.query('SELECT COUNT(*)::int as count FROM lessons'),
      db.query('SELECT COUNT(*)::int as count, COUNT(DISTINCT (lesson_number, order_num))::int as unique_count FROM vocabularies'),
      db.query('SELECT COUNT(*)::int as count, COUNT(DISTINCT kanji)::int as unique_count FROM kanji'),
      db.query('SELECT COUNT(*)::int as count FROM users'),
      db.query('SELECT COUNT(*)::int as count FROM study_sessions'),
      db.query('SELECT COUNT(*)::int as count, COUNT(CASE WHEN status = \'mastered\' THEN 1 END)::int as mastered_count FROM user_progress'),
      db.query('SELECT (COUNT(*) - COUNT(DISTINCT (lesson_number, order_num)))::int as dups FROM vocabularies'),
      db.query('SELECT (COUNT(*) - COUNT(DISTINCT kanji))::int as dups FROM kanji')
    ]);

    const totalVocabs = vocabRes.rows[0].count;
    const uniqueVocabs = vocabRes.rows[0].unique_count;
    const vocabDups = dupVocabRes.rows[0].dups || 0;
    const totalKanji = kanjiRes.rows[0].count;
    const uniqueKanji = kanjiRes.rows[0].unique_count;
    const kanjiDups = dupKanjiRes.rows[0].dups || 0;

    // Recent activity
    const recentUsers = await db.query(
      'SELECT id, username, email, role, auth_provider, created_at FROM users ORDER BY created_at DESC LIMIT 5'
    );

    // Lesson counts distribution
    const lessonDist = await db.query(`
      SELECT l.lesson_number, l.title, COUNT(v.id)::int as vocab_count
      FROM lessons l
      LEFT JOIN vocabularies v ON l.lesson_number = v.lesson_number
      GROUP BY l.lesson_number, l.title
      ORDER BY l.lesson_number ASC
    `);

    res.json({
      stats: {
        totalLessons: lessonsRes.rows[0].count,
        totalVocabularies: totalVocabs,
        uniqueVocabularies: uniqueVocabs,
        vocabDuplicates: vocabDups,
        totalKanji: totalKanji,
        uniqueKanji: uniqueKanji,
        kanjiDuplicates: kanjiDups,
        totalUsers: usersRes.rows[0].count,
        totalStudySessions: sessionsRes.rows[0].count,
        totalProgress: progressRes.rows[0].count,
        totalMastered: progressRes.rows[0].mastered_count || 0
      },
      hasDuplicates: vocabDups > 0 || kanjiDups > 0,
      recentUsers: recentUsers.rows,
      lessonDistribution: lessonDist.rows,
      databaseInfo: {
        status: 'Connected & Healthy',
        poolConfig: process.env.DATABASE_URL ? 'Remote Cloud Database (Supabase)' : 'Local PostgreSQL',
        serverUptime: Math.round(process.uptime()),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('getSystemStats error:', error);
    res.status(500).json({ message: 'Lỗi tải thống kê hệ thống' });
  }
};

/**
 * Vocabularies Management (List, Add, Update, Delete)
 */
const getVocabularies = async (req, res) => {
  try {
    const { lesson, search, page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereClauses = [];
    let params = [];
    let paramIndex = 1;

    if (lesson && lesson !== 'all') {
      whereClauses.push(`lesson_number = $${paramIndex++}`);
      params.push(parseInt(lesson));
    }

    if (search && search.trim()) {
      whereClauses.push(`(
        kana ILIKE $${paramIndex} OR 
        kanji ILIKE $${paramIndex} OR 
        vietnamese ILIKE $${paramIndex} OR 
        clean_vietnamese ILIKE $${paramIndex} OR 
        romaji ILIKE $${paramIndex}
      )`);
      params.push(`%${search.trim()}%`);
      paramIndex++;
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countRes = await db.query(`SELECT COUNT(*)::int as total FROM vocabularies ${whereSql}`, params);
    const total = countRes.rows[0].total;

    const querySql = `
      SELECT id, lesson_id, lesson_number, order_num, kanji, kana, clean_kana, romaji,
             vietnamese, clean_vietnamese, usage_note, example_jp, example_vi, created_at
      FROM vocabularies
      ${whereSql}
      ORDER BY lesson_number ASC, order_num ASC, id ASC
      LIMIT $${paramIndex++} OFFSET $${paramIndex}
    `;

    params.push(parseInt(limit), offset);
    const listRes = await db.query(querySql, params);

    res.json({
      vocabularies: listRes.rows,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('getVocabularies error:', error);
    res.status(500).json({ message: 'Lỗi tải danh sách từ vựng' });
  }
};

const createVocabulary = async (req, res) => {
  try {
    const {
      lesson_number,
      order_num,
      kanji,
      kana,
      clean_kana,
      romaji,
      vietnamese,
      clean_vietnamese,
      usage_note,
      example_jp,
      example_vi
    } = req.body;

    if (!lesson_number || !kana || !vietnamese) {
      return res.status(400).json({ message: 'Vui lòng cung cấp số bài học, Kana và nghĩa tiếng Việt' });
    }

    // Find lesson_id
    const lessonRes = await db.query('SELECT id FROM lessons WHERE lesson_number = $1', [lesson_number]);
    const lessonId = lessonRes.rows[0]?.id || null;

    // Determine order_num
    let nextOrder = order_num;
    if (!nextOrder) {
      const maxOrderRes = await db.query(
        'SELECT COALESCE(MAX(order_num), 0) + 1 as next_order FROM vocabularies WHERE lesson_number = $1',
        [lesson_number]
      );
      nextOrder = maxOrderRes.rows[0].next_order;
    }

    const insertRes = await db.query(`
      INSERT INTO vocabularies (
        lesson_id, lesson_number, order_num, kanji, kana, clean_kana, romaji,
        vietnamese, clean_vietnamese, usage_note, example_jp, example_vi
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [
      lessonId,
      parseInt(lesson_number),
      parseInt(nextOrder),
      kanji ? kanji.trim() : null,
      kana.trim(),
      clean_kana ? clean_kana.trim() : kana.trim(),
      romaji ? romaji.trim() : '',
      vietnamese.trim(),
      clean_vietnamese ? clean_vietnamese.trim() : vietnamese.trim(),
      usage_note ? usage_note.trim() : null,
      example_jp ? example_jp.trim() : null,
      example_vi ? example_vi.trim() : null
    ]);

    res.status(201).json({
      message: 'Thêm từ vựng thành công!',
      vocabulary: insertRes.rows[0]
    });
  } catch (error) {
    console.error('createVocabulary error:', error);
    res.status(500).json({ message: 'Lỗi khi thêm từ vựng mới: ' + error.message });
  }
};

const updateVocabulary = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      lesson_number,
      order_num,
      kanji,
      kana,
      clean_kana,
      romaji,
      vietnamese,
      clean_vietnamese,
      usage_note,
      example_jp,
      example_vi
    } = req.body;

    const existing = await db.query('SELECT id FROM vocabularies WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy từ vựng cần cập nhật' });
    }

    const updateRes = await db.query(`
      UPDATE vocabularies SET
        lesson_number = COALESCE($1, lesson_number),
        order_num = COALESCE($2, order_num),
        kanji = $3,
        kana = COALESCE($4, kana),
        clean_kana = $5,
        romaji = COALESCE($6, romaji),
        vietnamese = COALESCE($7, vietnamese),
        clean_vietnamese = $8,
        usage_note = $9,
        example_jp = $10,
        example_vi = $11
      WHERE id = $12
      RETURNING *
    `, [
      lesson_number ? parseInt(lesson_number) : null,
      order_num ? parseInt(order_num) : null,
      kanji ? kanji.trim() : null,
      kana ? kana.trim() : null,
      clean_kana ? clean_kana.trim() : (kana ? kana.trim() : null),
      romaji ? romaji.trim() : null,
      vietnamese ? vietnamese.trim() : null,
      clean_vietnamese ? clean_vietnamese.trim() : null,
      usage_note ? usage_note.trim() : null,
      example_jp ? example_jp.trim() : null,
      example_vi ? example_vi.trim() : null,
      id
    ]);

    res.json({
      message: 'Cập nhật từ vựng thành công!',
      vocabulary: updateRes.rows[0]
    });
  } catch (error) {
    console.error('updateVocabulary error:', error);
    res.status(500).json({ message: 'Lỗi cập nhật từ vựng: ' + error.message });
  }
};

const deleteVocabulary = async (req, res) => {
  try {
    const { id } = req.params;
    const delRes = await db.query('DELETE FROM vocabularies WHERE id = $1 RETURNING id, kana, vietnamese', [id]);
    if (delRes.rows.length === 0) {
      return res.status(404).json({ message: 'Từ vựng không tồn tại hoặc đã bị xóa' });
    }
    res.json({
      message: 'Đã xóa từ vựng thành công!',
      deleted: delRes.rows[0]
    });
  } catch (error) {
    console.error('deleteVocabulary error:', error);
    res.status(500).json({ message: 'Lỗi xóa từ vựng' });
  }
};

/**
 * Lessons Management (List, Update)
 */
const getLessons = async (req, res) => {
  try {
    const lessons = await db.query(`
      SELECT l.id, l.lesson_number, l.title, l.description, l.created_at,
             COUNT(v.id)::int as vocab_count
      FROM lessons l
      LEFT JOIN vocabularies v ON l.lesson_number = v.lesson_number
      GROUP BY l.id, l.lesson_number, l.title, l.description, l.created_at
      ORDER BY l.lesson_number ASC
    `);

    res.json({ lessons: lessons.rows });
  } catch (error) {
    console.error('getLessons error:', error);
    res.status(500).json({ message: 'Lỗi tải danh sách bài học' });
  }
};

const updateLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    const result = await db.query(
      'UPDATE lessons SET title = COALESCE($1, title), description = COALESCE($2, description) WHERE id = $3 RETURNING *',
      [title ? title.trim() : null, description ? description.trim() : null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy bài học' });
    }

    res.json({
      message: 'Cập nhật thông tin bài học thành công!',
      lesson: result.rows[0]
    });
  } catch (error) {
    console.error('updateLesson error:', error);
    res.status(500).json({ message: 'Lỗi cập nhật bài học' });
  }
};

/**
 * Kanji Management (List, Add, Update, Delete)
 */
const getKanji = async (req, res) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereClause = '';
    let params = [];

    if (search && search.trim()) {
      whereClause = 'WHERE kanji ILIKE $1 OR onyomi ILIKE $1 OR kunyomi ILIKE $1 OR han_viet ILIKE $1 OR meaning ILIKE $1';
      params.push(`%${search.trim()}%`);
    }

    const countRes = await db.query(`SELECT COUNT(*)::int as total FROM kanji ${whereClause}`, params);
    const total = countRes.rows[0].total;

    const listQuery = `
      SELECT id, kanji, onyomi, kunyomi, han_viet, meaning, stroke_count, level, examples, created_at
      FROM kanji
      ${whereClause}
      ORDER BY stroke_count ASC, id ASC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    params.push(parseInt(limit), offset);
    const listRes = await db.query(listQuery, params);

    res.json({
      kanjiList: listRes.rows,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('getKanji error:', error);
    res.status(500).json({ message: 'Lỗi tải danh sách Kanji' });
  }
};

const createKanji = async (req, res) => {
  try {
    const { kanji, onyomi, kunyomi, han_viet, meaning, stroke_count, level, examples } = req.body;
    if (!kanji || !han_viet || !meaning) {
      return res.status(400).json({ message: 'Vui lòng cung cấp chữ Kanji, Hán Việt và Ý nghĩa' });
    }

    const insRes = await db.query(`
      INSERT INTO kanji (kanji, onyomi, kunyomi, han_viet, meaning, stroke_count, level, examples)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      kanji.trim(),
      onyomi ? onyomi.trim() : '',
      kunyomi ? kunyomi.trim() : '',
      han_viet.trim(),
      meaning.trim(),
      stroke_count ? parseInt(stroke_count) : 1,
      level || 'N5',
      JSON.stringify(examples || [])
    ]);

    res.status(201).json({
      message: 'Thêm chữ Kanji mới thành công!',
      kanji: insRes.rows[0]
    });
  } catch (error) {
    console.error('createKanji error:', error);
    res.status(500).json({ message: 'Lỗi thêm Kanji: ' + error.message });
  }
};

const updateKanji = async (req, res) => {
  try {
    const { id } = req.params;
    const { kanji, onyomi, kunyomi, han_viet, meaning, stroke_count, level, examples } = req.body;

    const updateRes = await db.query(`
      UPDATE kanji SET
        kanji = COALESCE($1, kanji),
        onyomi = $2,
        kunyomi = $3,
        han_viet = COALESCE($4, han_viet),
        meaning = COALESCE($5, meaning),
        stroke_count = COALESCE($6, stroke_count),
        level = COALESCE($7, level),
        examples = COALESCE($8, examples)
      WHERE id = $9
      RETURNING *
    `, [
      kanji ? kanji.trim() : null,
      onyomi ? onyomi.trim() : null,
      kunyomi ? kunyomi.trim() : null,
      han_viet ? han_viet.trim() : null,
      meaning ? meaning.trim() : null,
      stroke_count ? parseInt(stroke_count) : null,
      level || null,
      examples ? JSON.stringify(examples) : null,
      id
    ]);

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy Kanji' });
    }

    res.json({
      message: 'Cập nhật Kanji thành công!',
      kanji: updateRes.rows[0]
    });
  } catch (error) {
    console.error('updateKanji error:', error);
    res.status(500).json({ message: 'Lỗi cập nhật Kanji: ' + error.message });
  }
};

const deleteKanji = async (req, res) => {
  try {
    const { id } = req.params;
    const delRes = await db.query('DELETE FROM kanji WHERE id = $1 RETURNING id, kanji, han_viet', [id]);
    if (delRes.rows.length === 0) {
      return res.status(404).json({ message: 'Kanji không tồn tại hoặc đã bị xóa' });
    }
    res.json({
      message: 'Đã xóa Kanji thành công!',
      deleted: delRes.rows[0]
    });
  } catch (error) {
    console.error('deleteKanji error:', error);
    res.status(500).json({ message: 'Lỗi xóa Kanji' });
  }
};

/**
 * Users Management
 */
const getUsers = async (req, res) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereClause = '';
    let params = [];

    if (search && search.trim()) {
      whereClause = 'WHERE username ILIKE $1 OR email ILIKE $1';
      params.push(`%${search.trim()}%`);
    }

    const countRes = await db.query(`SELECT COUNT(*)::int as total FROM users ${whereClause}`, params);
    const total = countRes.rows[0].total;

    const listQuery = `
      SELECT u.id, u.username, u.email, u.role, u.auth_provider, u.avatar_url, u.created_at,
             COUNT(DISTINCT up.id)::int as studied_words,
             COUNT(DISTINCT s.id)::int as quiz_sessions
      FROM users u
      LEFT JOIN user_progress up ON u.id = up.user_id
      LEFT JOIN study_sessions s ON u.id = s.user_id
      ${whereClause}
      GROUP BY u.id, u.username, u.email, u.role, u.auth_provider, u.avatar_url, u.created_at
      ORDER BY u.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    params.push(parseInt(limit), offset);
    const listRes = await db.query(listQuery, params);

    res.json({
      users: listRes.rows,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('getUsers error:', error);
    res.status(500).json({ message: 'Lỗi tải danh sách người dùng' });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['admin', 'user'].includes(role)) {
      return res.status(400).json({ message: 'Vai trò không hợp lệ (chỉ chấp nhận admin hoặc user)' });
    }

    // Protect primary superadmin from being demoted
    const targetUser = await db.query('SELECT email FROM users WHERE id = $1', [id]);
    if (targetUser.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    if (targetUser.rows[0].email.toLowerCase() === ADMIN_EMAIL.toLowerCase() && role !== 'admin') {
      return res.status(403).json({ message: 'Không thể hạ quyền tài khoản Quản trị viên tối cao!' });
    }

    const updateRes = await db.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, username, email, role',
      [role, id]
    );

    res.json({
      message: `Đã cập nhật vai trò thành công: ${role}`,
      user: updateRes.rows[0]
    });
  } catch (error) {
    console.error('updateUserRole error:', error);
    res.status(500).json({ message: 'Lỗi cập nhật quyền người dùng' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const target = await db.query('SELECT email FROM users WHERE id = $1', [id]);
    if (target.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    if (target.rows[0].email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      return res.status(403).json({ message: 'Không thể xóa tài khoản Quản trị viên tối cao!' });
    }

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ message: 'Bạn không thể tự xóa tài khoản của chính mình khi đang đăng nhập' });
    }

    await db.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ message: 'Đã xóa người dùng thành công!' });
  } catch (error) {
    console.error('deleteUser error:', error);
    res.status(500).json({ message: 'Lỗi xóa người dùng' });
  }
};

/**
 * Maintenance: Clean Duplicates & Recheck
 */
const triggerDeduplication = async (req, res) => {
  try {
    console.log('[Admin Action] Triggering database deduplication...');
    const result = await deduplicateDatabase();
    res.json({
      message: 'Khắc phục và dọn dẹp dữ liệu trùng lặp thành công!',
      result
    });
  } catch (error) {
    console.error('triggerDeduplication error:', error);
    res.status(500).json({
      message: 'Lỗi khi xử lý dữ liệu trùng lặp: ' + error.message
    });
  }
};

module.exports = {
  adminLogin,
  getAdminMe,
  getSystemStats,
  getVocabularies,
  createVocabulary,
  updateVocabulary,
  deleteVocabulary,
  getLessons,
  updateLesson,
  getKanji,
  createKanji,
  updateKanji,
  deleteKanji,
  getUsers,
  updateUserRole,
  deleteUser,
  triggerDeduplication
};
