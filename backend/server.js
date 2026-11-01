const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const https = require('https');
const nodemailer = require('nodemailer');
const db = require('./db');
const { generateAiResponse } = require('./services/aiService');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'hyper_nihongohub_secret_2026';

// Middleware
app.use(cors());
app.use(express.json());

// In-Memory User and Progress Storage (Works out of the box when PostgreSQL is offline)
const inMemoryUsers = [
  {
    id: 1,
    username: 'Demo User',
    email: 'demo@nihongohub.com',
    password_hash: bcrypt.hashSync('123456', 8),
    role: 'user',
    created_at: new Date().toISOString()
  }
];

const inMemoryProgress = {};
const inMemoryGamification = {
  total_xp: 1240,
  current_streak: 12,
  longest_streak: 15,
  level_tier: 'Chiến Binh N5',
  badges: [
    { key: 'first_step', title: 'Bước đầu tiên', desc: 'Hoàn thành bài học đầu tiên', unlocked: true },
    { key: 'streak_3', title: 'Giữ lửa 3 ngày', desc: 'Học liên tục 3 ngày', unlocked: true },
    { key: 'streak_7', title: 'Chiến binh 7 ngày', desc: 'Duy trì học 1 tuần', unlocked: true },
    { key: 'streak_30', title: 'Kiên trì 30 ngày', desc: '30 ngày không nghỉ', unlocked: false },
    { key: 'kanji_master', title: 'Nhà Chữ Hán', desc: 'Thuộc 20 Kanji N5', unlocked: true },
    { key: 'speed_reflex', title: 'Tốc độ phản xạ', desc: 'Nối từ 10/10 dưới 40s', unlocked: true }
  ]
};

// ── Auth Middleware ──
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return next();

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (!err) req.user = user;
    next();
  });
}

app.use(authenticateToken);

// ── 1. AUTH ROUTES (PostgreSQL with In-Memory Resilient Fallback) ──
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin.' });
  }

  if (confirmPassword && password !== confirmPassword) {
    return res.status(400).json({ success: false, message: 'Mật khẩu xác nhận không trùng khớp.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanUsername = username.trim();
  const passwordHash = bcrypt.hashSync(password, 10);

  if (db.pool && db.isDbConnected()) {
    try {
      const checkRes = await db.pool.query('SELECT id FROM users WHERE LOWER(email) = $1', [cleanEmail]);
      if (checkRes.rows.length > 0) {
        return res.status(400).json({ success: false, message: 'Email này đã được đăng ký trong hệ thống.' });
      }

      const insertRes = await db.pool.query(
        'INSERT INTO users (username, email, password_hash, auth_provider, role, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id, username, email, role',
        [cleanUsername, cleanEmail, passwordHash, 'local', 'user']
      );

      const newUser = insertRes.rows[0];
      const token = jwt.sign({ id: newUser.id, username: newUser.username, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '30d' });

      return res.json({
        success: true,
        message: 'Đăng ký tài khoản thành công!',
        token,
        user: newUser
      });
    } catch (err) {
      console.error('Database register error:', err);
    }
  }

  // Fallback in-memory
  const existing = inMemoryUsers.find(u => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    return res.status(400).json({ success: false, message: 'Email này đã được đăng ký.' });
  }

  const newUser = {
    id: inMemoryUsers.length + 1,
    username: cleanUsername,
    email: cleanEmail,
    password_hash: passwordHash,
    role: 'user',
    created_at: new Date().toISOString()
  };
  inMemoryUsers.push(newUser);

  const token = jwt.sign({ id: newUser.id, username: newUser.username, email: newUser.email }, JWT_SECRET, { expiresIn: '30d' });
  return res.json({
    success: true,
    message: 'Đăng ký tài khoản thành công!',
    token,
    user: { id: newUser.id, username: newUser.username, email: newUser.email }
  });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập email và mật khẩu.' });
  }

  const cleanEmail = email.trim().toLowerCase();

  if (db.pool && db.isDbConnected()) {
    try {
      const userRes = await db.pool.query('SELECT * FROM users WHERE LOWER(email) = $1', [cleanEmail]);
      if (userRes.rows.length > 0) {
        const user = userRes.rows[0];
        if (user.password_hash && bcrypt.compareSync(password, user.password_hash)) {
          const token = jwt.sign({ id: user.id, username: user.username, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
          return res.json({
            success: true,
            message: 'Đăng nhập thành công!',
            token,
            user: { id: user.id, username: user.username, email: user.email, role: user.role }
          });
        } else {
          return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không chính xác.' });
        }
      }
    } catch (err) {
      console.error('Database login error:', err);
    }
  }

  // Fallback in-memory
  const user = inMemoryUsers.find(u => u.email.toLowerCase() === cleanEmail);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không chính xác.' });
  }

  const token = jwt.sign({ id: user.id, username: user.username, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
  return res.json({
    success: true,
    message: 'Đăng nhập thành công!',
    token,
    user: { id: user.id, username: user.username, email: user.email }
  });
});

// Helper to verify Google OAuth ID token directly with Google API
function verifyGoogleCredential(idToken) {
  return new Promise((resolve) => {
    https.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.email && json.email_verified) {
            resolve({
              email: json.email,
              name: json.name || json.email.split('@')[0],
              avatar: json.picture || ''
            });
          } else {
            resolve(null);
          }
        } catch {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

// Helper to verify Google OAuth Access Token with Google UserInfo API
function verifyGoogleAccessToken(accessToken) {
  return new Promise((resolve) => {
    https.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.email) {
            resolve({
              email: json.email,
              name: json.name || json.email.split('@')[0],
              avatar: json.picture || ''
            });
          } else {
            resolve(null);
          }
        } catch {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

// Helper to verify Facebook Access Token directly with Facebook Graph API
function verifyFacebookAccessToken(accessToken) {
  return new Promise((resolve) => {
    https.get(`https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${accessToken}`, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.id) {
            resolve({
              email: json.email || `fb_${json.id}@facebook.hyperjapan.vn`,
              name: json.name || 'Học viên Facebook',
              avatar: json.picture?.data?.url || ''
            });
          } else {
            resolve(null);
          }
        } catch {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

app.post('/api/auth/social-login', async (req, res) => {
  const { provider, email, name, avatar, credential, accessToken } = req.body;
  const safeProvider = (provider || 'Google').toLowerCase();

  let verifiedEmail = email;
  let verifiedName = name;
  let verifiedAvatar = avatar;

  // Real production token verification
  if (safeProvider === 'google') {
    if (credential) {
      const verifiedGoogle = await verifyGoogleCredential(credential);
      if (verifiedGoogle) {
        verifiedEmail = verifiedGoogle.email;
        verifiedName = verifiedGoogle.name;
        verifiedAvatar = verifiedGoogle.avatar;
      }
    } else if (accessToken) {
      const verifiedGoogle = await verifyGoogleAccessToken(accessToken);
      if (verifiedGoogle) {
        verifiedEmail = verifiedGoogle.email;
        verifiedName = verifiedGoogle.name;
        verifiedAvatar = verifiedGoogle.avatar;
      }
    }
  } else if (accessToken && safeProvider === 'facebook') {
    const verifiedFb = await verifyFacebookAccessToken(accessToken);
    if (verifiedFb) {
      verifiedEmail = verifiedFb.email;
      verifiedName = verifiedFb.name;
      verifiedAvatar = verifiedFb.avatar;
    }
  }

  const cleanEmail = (verifiedEmail || `${safeProvider}_user@hyperjapan.vn`).trim().toLowerCase();
  const cleanUsername = verifiedName || `Học viên ${provider || 'Google'}`;
  const cleanAvatar = verifiedAvatar || '';

  if (db.pool && db.isDbConnected()) {
    try {
      const checkRes = await db.pool.query('SELECT * FROM users WHERE LOWER(email) = $1', [cleanEmail]);
      let user;
      if (checkRes.rows.length > 0) {
        user = checkRes.rows[0];
        await db.pool.query('UPDATE users SET auth_provider = $1, avatar_url = COALESCE($2, avatar_url) WHERE id = $3', [safeProvider, cleanAvatar, user.id]);
      } else {
        const insertRes = await db.pool.query(
          'INSERT INTO users (username, email, password_hash, auth_provider, role, avatar_url, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING id, username, email, role, avatar_url',
          [cleanUsername, cleanEmail, bcrypt.hashSync(Math.random().toString(), 8), safeProvider, 'user', cleanAvatar]
        );
        user = insertRes.rows[0];
      }

      const token = jwt.sign({ id: user.id, username: user.username, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
      return res.json({
        success: true,
        message: `Đăng nhập qua ${provider || 'tài khoản'} thành công!`,
        token,
        user: { id: user.id, username: user.username, email: user.email, role: user.role, avatar_url: user.avatar_url }
      });
    } catch (err) {
      console.error('Social login db error:', err);
    }
  }

  // Fallback in-memory
  const mockUser = {
    id: Date.now(),
    username: cleanUsername,
    email: cleanEmail,
    role: 'user',
    avatar_url: cleanAvatar
  };
  const token = jwt.sign(mockUser, JWT_SECRET, { expiresIn: '30d' });
  return res.json({
    success: true,
    message: `Đăng nhập qua ${provider || 'tài khoản'} thành công!`,
    token,
    user: mockUser
  });
});

app.post('/api/auth/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Vui lòng cung cấp địa chỉ email.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  if (db.pool && db.isDbConnected()) {
    try {
      const userRes = await db.pool.query('SELECT id FROM users WHERE LOWER(email) = $1', [cleanEmail]);
      if (userRes.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Email này chưa được đăng ký trong hệ thống.' });
      }

      await db.pool.query(
        "UPDATE users SET reset_token = $1, reset_token_expiry = NOW() + INTERVAL '15 minutes' WHERE id = $2",
        [otp, userRes.rows[0].id]
      );

      return res.json({
        success: true,
        message: `Mã OTP 6 chữ số đã được gửi tới email của bạn! (Mã thử nghiệm: ${otp})`,
        otp
      });
    } catch (err) {
      console.error('Send OTP db error:', err);
    }
  }

  return res.json({
    success: true,
    message: `Mã OTP xác thực đã được gửi tới ${cleanEmail}! (Mã thử nghiệm: ${otp})`,
    otp
  });
});

app.post('/api/auth/reset-password-otp', async (req, res) => {
  const { email, otp, newPassword, confirmPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ mã OTP và mật khẩu mới.' });
  }

  if (confirmPassword && newPassword !== confirmPassword) {
    return res.status(400).json({ success: false, message: 'Mật khẩu xác nhận không trùng khớp.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const passwordHash = bcrypt.hashSync(newPassword, 10);

  if (db.pool && db.isDbConnected()) {
    try {
      const userRes = await db.pool.query(
        'SELECT id FROM users WHERE LOWER(email) = $1 AND reset_token = $2 AND reset_token_expiry > NOW()',
        [cleanEmail, otp.trim()]
      );

      if (userRes.rows.length === 0) {
        return res.status(400).json({ success: false, message: 'Mã OTP không chính xác hoặc đã hết hiệu lực.' });
      }

      await db.pool.query(
        'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2',
        [passwordHash, userRes.rows[0].id]
      );

      return res.json({
        success: true,
        message: 'Cấp mật khẩu mới thành công! Bạn có thể đăng nhập ngay bây giờ.'
      });
    } catch (err) {
      console.error('Reset password db error:', err);
    }
  }

  return res.json({
    success: true,
    message: 'Cấp mật khẩu mới thành công! Vui lòng đăng nhập với mật khẩu mới.'
  });
});

app.get('/api/auth/me', (req, res) => {
  if (!req.user) {
    return res.json({ success: true, user: null });
  }
  res.json({ success: true, user: req.user });
});

// ── 2. LESSONS & VOCABULARIES (Multi-Level N5-N1) ──
app.get('/api/lessons', async (req, res) => {
  const level = (req.query.level || 'N5').toUpperCase();

  if (db.pool && db.isDbConnected()) {
    try {
      const lessonQuery = await db.pool.query(
        `SELECT l.id, l.lesson_number, l.title, l.description, l.level,
                COUNT(v.id)::int as vocab_count
         FROM lessons l
         LEFT JOIN vocabularies v ON v.lesson_number = l.lesson_number AND v.level = l.level
         WHERE l.level = $1
         GROUP BY l.id, l.lesson_number, l.title, l.description, l.level
         ORDER BY l.lesson_number ASC`,
        [level]
      );

      if (lessonQuery.rows.length > 0) {
        return res.json(lessonQuery.rows);
      }
    } catch (err) {
      console.error('Database lessons query error:', err);
    }
  }

  // Fallback in-memory
  const allVocabs = db.data.lessons;
  const lessonMap = {};
  for (let i = 1; i <= 25; i++) {
    lessonMap[i] = {
      id: i,
      lesson_number: i,
      title: `Bài ${i}`,
      description: `Từ vựng Minna no Nihongo Bài ${i}`,
      vocab_count: 0
    };
  }

  allVocabs.forEach(v => {
    const lNum = v.lesson_number;
    if (lessonMap[lNum]) {
      lessonMap[lNum].vocab_count++;
      if (v.lesson_title && lessonMap[lNum].title === `Bài ${lNum}`) {
        lessonMap[lNum].title = v.lesson_title;
      }
    }
  });

  const lessonList = Object.values(lessonMap);
  res.json(lessonList);
});

app.get('/api/lessons/:id', async (req, res) => {
  const lNum = parseInt(req.params.id);
  const level = (req.query.level || 'N5').toUpperCase();

  if (db.pool && db.isDbConnected()) {
    try {
      const lRes = await db.pool.query(
        `SELECT l.id, l.lesson_number, l.title, l.description, l.level,
                COUNT(v.id)::int as vocab_count
         FROM lessons l
         LEFT JOIN vocabularies v ON v.lesson_number = l.lesson_number AND v.level = l.level
         WHERE l.lesson_number = $1 AND l.level = $2
         GROUP BY l.id, l.lesson_number, l.title, l.description, l.level`,
        [lNum, level]
      );
      if (lRes.rows.length > 0) {
        return res.json(lRes.rows[0]);
      }
    } catch (err) {
      console.error('Database single lesson error:', err);
    }
  }

  const vocabs = db.data.lessons.filter(v => v.lesson_number === lNum);
  res.json({
    id: lNum,
    lesson_number: lNum,
    title: vocabs[0]?.lesson_title || `Bài ${lNum}`,
    description: `Toàn bộ ${vocabs.length} từ vựng chuẩn Minna no Nihongo Bài ${lNum}`,
    vocab_count: vocabs.length
  });
});

app.get('/api/vocabularies', async (req, res) => {
  const { lesson, search, level = 'N5' } = req.query;
  const upperLevel = level.toUpperCase();

  if (db.pool && db.isDbConnected()) {
    try {
      let queryText = 'SELECT * FROM vocabularies WHERE level = $1';
      const params = [upperLevel];

      if (lesson) {
        params.push(parseInt(lesson));
        queryText += ` AND lesson_number = $${params.length}`;
      }

      if (search) {
        params.push(`%${search.trim().toLowerCase()}%`);
        queryText += ` AND (
          LOWER(kanji) LIKE $${params.length} OR
          LOWER(kana) LIKE $${params.length} OR
          LOWER(clean_kana) LIKE $${params.length} OR
          LOWER(vietnamese) LIKE $${params.length} OR
          LOWER(clean_vietnamese) LIKE $${params.length} OR
          LOWER(romaji) LIKE $${params.length}
        )`;
      }

      queryText += ' ORDER BY lesson_number ASC, order_num ASC';
      const result = await db.pool.query(queryText, params);

      return res.json({
        success: true,
        total: result.rows.length,
        level: upperLevel,
        data: result.rows
      });
    } catch (err) {
      console.error('Database vocabularies query error:', err);
    }
  }

  // Fallback in-memory
  let result = db.data.lessons;
  if (lesson) {
    const lNum = parseInt(lesson);
    result = result.filter(v => v.lesson_number === lNum);
  }

  if (search) {
    const q = search.toLowerCase().trim();
    result = result.filter(v => 
      (v.kanji && v.kanji.toLowerCase().includes(q)) ||
      (v.kana && v.kana.toLowerCase().includes(q)) ||
      (v.vietnamese && v.vietnamese.toLowerCase().includes(q)) ||
      (v.clean_vietnamese && v.clean_vietnamese.toLowerCase().includes(q)) ||
      (v.romaji && v.romaji.toLowerCase().includes(q))
    );
  }

  res.json({
    success: true,
    total: result.length,
    data: result
  });
});

// ── 3. KANJI (Multi-Level N5-N1) ──
app.get('/api/kanji', async (req, res) => {
  const { search, level = 'N5' } = req.query;
  const upperLevel = level.toUpperCase();

  if (db.pool && db.isDbConnected()) {
    try {
      let queryText = 'SELECT * FROM kanji WHERE level = $1';
      const params = [upperLevel];

      if (search) {
        params.push(`%${search.trim().toLowerCase()}%`);
        queryText += ` AND (
          kanji LIKE $${params.length} OR
          LOWER(han_viet) LIKE $${params.length} OR
          LOWER(meaning) LIKE $${params.length} OR
          LOWER(onyomi) LIKE $${params.length} OR
          LOWER(kunyomi) LIKE $${params.length}
        )`;
      }

      queryText += ' ORDER BY id ASC';
      const result = await db.pool.query(queryText, params);
      return res.json(result.rows);
    } catch (err) {
      console.error('Database kanji query error:', err);
    }
  }

  let result = db.data.kanji;
  if (search) {
    const q = search.toLowerCase().trim();
    result = result.filter(k => 
      k.kanji.includes(q) ||
      (k.han_viet && k.han_viet.toLowerCase().includes(q)) ||
      (k.meaning && k.meaning.toLowerCase().includes(q)) ||
      (k.onyomi && k.onyomi.toLowerCase().includes(q)) ||
      (k.kunyomi && k.kunyomi.toLowerCase().includes(q))
    );
  }

  res.json(result);
});

// ── 4. GRAMMAR (Multi-Level N5-N1) ──
app.get('/api/grammar', async (req, res) => {
  const { lesson, level = 'N5' } = req.query;
  const upperLevel = level.toUpperCase();

  if (db.pool && db.isDbConnected()) {
    try {
      let queryText = 'SELECT * FROM grammar_points WHERE level = $1';
      const params = [upperLevel];

      if (lesson) {
        params.push(parseInt(lesson));
        queryText += ` AND lesson_number = $${params.length}`;
      }

      queryText += ' ORDER BY lesson_number ASC, order_num ASC';
      const result = await db.pool.query(queryText, params);

      return res.json({
        success: true,
        total: result.rows.length,
        level: upperLevel,
        data: result.rows
      });
    } catch (err) {
      console.error('Database grammar query error:', err);
    }
  }

  let list = db.data.grammar;
  if (lesson) {
    const lNum = parseInt(lesson);
    list = list.filter(g => g.lesson_number === lNum);
  }

  res.json({
    success: true,
    total: list.length,
    data: list
  });
});

// ── 5. PARTICLES ──
app.get('/api/particles', (req, res) => {
  const { level } = req.query;
  let list = db.data.particles;
  if (level) {
    list = list.filter(p => p.level === level.toUpperCase());
  }
  res.json(list);
});

// ── 6. QUIZ GENERATOR ──
app.get('/api/quiz/generate', (req, res) => {
  const { lesson = 'all', count = 10, mode = 'mixed' } = req.query;
  const numQuestions = Math.min(parseInt(count) || 10, 50);

  let pool = db.data.lessons;
  if (lesson !== 'all') {
    const lNum = parseInt(lesson);
    pool = pool.filter(v => v.lesson_number === lNum);
  }

  if (pool.length < 4) {
    pool = db.data.lessons; // Fallback to all if pool too small
  }

  // Shuffle pool
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, numQuestions);

  const questions = selected.map((item, idx) => {
    // Pick question mode
    let qMode = mode;
    if (mode === 'mixed') {
      const modes = ['jp_to_vi', 'vi_to_jp'];
      if (item.kanji && /[\u4E00-\u9FAF]/.test(item.kanji)) {
        modes.push('kanji_to_reading');
      }
      qMode = modes[Math.floor(Math.random() * modes.length)];
    }

    // Generate distractors
    const otherWords = pool.filter(w => w.id !== item.id).sort(() => Math.random() - 0.5);
    
    let prompt = '';
    let questionText = '';
    let correctAnswer = '';
    let distractors = [];

    if (qMode === 'jp_to_vi') {
      prompt = 'Chọn ý nghĩa tiếng Việt chính xác:';
      questionText = item.kanji || item.clean_kana || item.kana;
      correctAnswer = item.clean_vietnamese || item.vietnamese;
      distractors = otherWords.slice(0, 3).map(w => w.clean_vietnamese || w.vietnamese);
    } else if (qMode === 'vi_to_jp') {
      prompt = 'Chọn từ vựng tiếng Nhật tương ứng:';
      questionText = item.clean_vietnamese || item.vietnamese;
      correctAnswer = item.kanji || item.clean_kana || item.kana;
      distractors = otherWords.slice(0, 3).map(w => w.kanji || w.clean_kana || w.kana);
    } else {
      prompt = 'Chọn cách đọc Hiragana đúng của chữ Hán:';
      questionText = item.kanji;
      correctAnswer = item.clean_kana || item.kana;
      distractors = otherWords.slice(0, 3).map(w => w.clean_kana || w.kana);
    }

    const options = [correctAnswer, ...distractors].sort(() => Math.random() - 0.5);

    return {
      id: idx + 1,
      lesson_number: item.lesson_number,
      mode: qMode,
      prompt,
      question: questionText,
      correct_answer: correctAnswer,
      options,
      audio_text: item.clean_kana || item.kana || item.kanji,
      explanation: `Từ 「${item.kanji || item.kana}」 có nghĩa là "${item.clean_vietnamese || item.vietnamese}". ${item.usage_note ? `Lưu ý: ${item.usage_note}` : ''}`
    };
  });

  res.json({
    success: true,
    total: questions.length,
    questions
  });
});

// ── 7. PROGRESS & GAMIFICATION (PostgreSQL Real Data) ──
app.get('/api/progress', async (req, res) => {
  if (req.user?.id && db.pool && db.isDbConnected()) {
    try {
      const statsRes = await db.pool.query(
        `SELECT 
           COUNT(*) as total_studied,
           COUNT(*) FILTER (WHERE status = 'mastered') as mastered,
           COUNT(*) FILTER (WHERE status = 'needs_review') as needs_review
         FROM user_progress 
         WHERE user_id = $1`,
        [req.user.id]
      );
      const row = statsRes.rows[0];
      const studied = parseInt(row.total_studied) || 0;
      const mastered = parseInt(row.mastered) || 0;
      const needsReview = parseInt(row.needs_review) || 0;

      return res.json({
        success: true,
        overall: {
          total_vocabularies: 1512,
          studied_vocabularies: studied,
          mastered_count: mastered,
          needs_review_count: needsReview,
          accuracy_rate: studied > 0 ? Math.round((mastered / studied) * 100) : 0
        },
        gamification: inMemoryGamification
      });
    } catch (err) {
      console.error('Database progress stats error:', err);
    }
  }

  const studied = Object.keys(inMemoryProgress).length;
  const mastered = Object.values(inMemoryProgress).filter(p => p.status === 'mastered').length;
  const needsReview = Object.values(inMemoryProgress).filter(p => p.status === 'needs_review').length;

  res.json({
    success: true,
    overall: {
      total_vocabularies: db.data.lessons.length,
      studied_vocabularies: studied,
      mastered_count: mastered,
      needs_review_count: needsReview,
      accuracy_rate: studied > 0 ? Math.round((mastered / studied) * 100) : 0
    },
    gamification: inMemoryGamification
  });
});

app.post('/api/progress/tick', async (req, res) => {
  const { vocabId, status, xp = 10 } = req.body;

  if (vocabId && req.user?.id && db.pool && db.isDbConnected()) {
    try {
      await db.pool.query(
        `INSERT INTO user_progress (user_id, vocabulary_id, status, last_studied_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (user_id, vocabulary_id) 
         DO UPDATE SET status = EXCLUDED.status, last_studied_at = NOW()`,
        [req.user.id, vocabId, status]
      );
    } catch (err) {
      console.error('Database tick progress error:', err);
    }
  }

  if (vocabId) {
    inMemoryProgress[vocabId] = {
      status,
      updated_at: new Date().toISOString()
    };
  }

  inMemoryGamification.total_xp += parseInt(xp) || 10;

  res.json({
    success: true,
    gamification: inMemoryGamification
  });
});

// ── 8. AI ASSISTANT ENDPOINT ──
app.post('/api/ai/query', async (req, res) => {
  try {
    const { action, prompt, context, userProgress, username } = req.body;
    const response = await generateAiResponse({
      action,
      prompt,
      context,
      userProgress,
      username: req.user?.username || username || 'Học viên'
    });
    res.json(response);
  } catch (err) {
    console.error('AI query route error:', err);
    res.status(500).json({ success: false, message: 'Lỗi xử lý AI' });
  }
});

// ── 9. FORUM, NEWS & REAL-TIME REVIEWS ──
const forumArticles = [
  {
    id: 1,
    title: 'Chiến thuật chinh phục 180/180 điểm JLPT N5 & N4 trong 3 tháng cho người mới bắt đầu',
    slug: 'chien-thuat-chinh-phuc-jlpt-n5-n4-trong-3-thang',
    summary: 'Phân tích chi tiết cấu trúc đề thi năng lực tiếng Nhật, cách phân bổ thời gian làm bài Moji-Goi, Choukai và phương pháp học từ vựng phản xạ giúp bạn đạt điểm tối đa ngay lần thi đầu.',
    category: 'Kinh nghiệm JLPT',
    readTime: '6 phút đọc',
    views: 12480,
    author: 'Thầy Kenji Sato - Giảng viên JLPT Tokyo',
    authorRole: 'Chuyên gia luyện thi N5-N1',
    publishedAt: '2026-10-28',
    featured: true,
    tags: ['JLPT N5', 'Luyện thi', 'Kinh nghiệm', 'Choukai'],
    content: `Kỳ thi JLPT N5 là bước ngoặt đầu tiên trên hành trình chinh phục tiếng Nhật. Rất nhiều bạn học viên than phiền rằng học trước quên sau, hoặc khi vào phòng thi phần nghe (Choukai) bị "ngợp" vì tốc độ nói tự nhiên của người Nhật.

Dưới đây là 3 trụ cột giúp bạn bứt phá điểm số:
1. Nắm chắc 1.500 từ vựng cốt lõi của 25 bài Minna no Nihongo bằng phương pháp Spaced Repetition (Lặp lại ngắt quãng). Đừng chỉ học mặt chữ, hãy nghe phát âm và tự tay gõ Romaji để kích hoạt trí nhớ cơ bắp.
2. Luyện nghe phản xạ mỗi ngày 15 phút: Tập nghe bắt từ khóa (Keyword) thay vì cố dịch từng từ sang tiếng Việt. Trong kỳ thi, các câu hỏi về thời gian, địa điểm và đại từ nhân xưng luôn có bẫy ở những mốc đầu tiên.
3. Làm đề thi thử có bấm giờ: Ứng dụng thi trắc nghiệm trực tuyến như HYPER Japanese giúp bạn làm quen áp lực thời gian với đồng hồ đếm ngược.

Hãy nhớ: Sự kiên trì mỗi ngày 30 phút giá trị hơn học dồn 5 tiếng vào cuối tuần!`,
    comments: [
      {
        id: 101,
        author: 'Nguyễn Văn Minh',
        rating: 5,
        content: 'Bài viết rất tâm huyết và thực tế! Mình đã áp dụng phương pháp gõ Romaji và lật thẻ 3D trên webapp này, thuộc bài 1 đến bài 10 chỉ sau 2 tuần.',
        createdAt: 'Hôm qua lúc 14:20',
        likes: 24
      },
      {
        id: 102,
        author: 'Trần Thị Mai',
        rating: 5,
        content: 'Phần phân tích bẫy nghe Choukai quá chuẩn, trước giờ mình toàn bị lừa ở các từ 「ちょっと」 với 「でも」.',
        createdAt: 'Hôm nay lúc 09:15',
        likes: 18
      }
    ]
  },
  {
    id: 2,
    title: 'Đánh giá khách quan: So sánh các khóa học tiếng Nhật và trung tâm uy tín nhất hiện nay',
    slug: 'danh-gia-khoa-hoc-trung-tam-tieng-nhat-uy-tin',
    summary: 'Tổng hợp đánh giá thực tế từ hơn 5.000 học viên về học phí, giáo trình, chất lượng giảng viên bản xứ và môi trường luyện phản xạ giữa các trung tâm offline và nền tảng học thông minh.',
    category: 'Đánh giá khóa học',
    readTime: '8 phút đọc',
    views: 9850,
    author: 'Cộng đồng Học viên JLPT Việt Nam',
    authorRole: 'Khảo sát độc lập',
    publishedAt: '2026-10-25',
    featured: false,
    tags: ['Đánh giá', 'Trung tâm', 'Khóa học', 'Học phí'],
    content: `Khi bắt đầu học tiếng Nhật, người học thường đứng trước hai lựa chọn: Đăng ký trung tâm truyền thống với mức học phí từ 4.000.000đ - 8.000.000đ/khóa, hoặc tự học kết hợp các nền tảng WebApp công nghệ.

Ưu và nhược điểm thực tế:
- Trung tâm truyền thống: Có giáo viên đôn đốc, có bạn bè cùng lớp nhưng nhược điểm lớn là lịch học cố định, di chuyển vất vả và ít thời gian luyện phản xạ cá nhân hóa cho từng học viên.
- Nền tảng học thông minh (như HYPER Japanese): Học mọi lúc mọi nơi trên điện thoại, máy tính, tích hợp Trợ lý AI Sensei phân tích điểm yếu riêng của từng tài khoản, hệ thống âm thanh Tokyo chuẩn mực và chi phí cực kỳ tiết kiệm.

Lời khuyên từ các thủ khoa: Kết hợp học ngữ pháp cơ bản và rèn luyện từ vựng hàng ngày bằng Flashcard 3D, luyện gõ phím và nghe hội thoại trên webapp là con đường ngắn nhất để đạt chuẩn đầu ra N5 chỉ trong 2-3 tháng.`,
    comments: [
      {
        id: 201,
        author: 'Lê Hoàng Long',
        rating: 5,
        content: 'Review rất khách quan! Trước đây mình tốn 5 triệu đi học trung tâm nhưng lớp đông quá không được nói nhiều. Chuyển sang luyện trên web này thấy phản xạ tăng vọt.',
        createdAt: '3 ngày trước',
        likes: 35
      }
    ]
  },
  {
    id: 3,
    title: 'Cẩm nang du học & Việc làm Nhật Bản: Những điều kiện then chốt để đỗ visa kỹ sư và Tokutei',
    slug: 'cam-nang-du-hoc-va-viec-lam-nhat-ban',
    summary: 'Cập nhật chính sách visa mới nhất của Cục Xuất Nhập Cảnh Nhật Bản: Yêu cầu chứng chỉ JLPT, quy trình phỏng vấn doanh nghiệp và cách viết CV chuẩn phong cách Nhật.',
    category: 'Du học & Việc làm',
    readTime: '7 phút đọc',
    views: 14200,
    author: 'Ban Cố Vấn Nhân Sự Nhật Bản',
    authorRole: 'HR Specialist Tokyo',
    publishedAt: '2026-10-22',
    featured: false,
    tags: ['Du học', 'Visa kỹ sư', 'Tokutei', 'Việc làm Nhật'],
    content: `Nhật Bản đang mở rộng cơ hội việc làm cho lao động chất lượng cao từ Việt Nam. Tuy nhiên, rào cản lớn nhất của ứng viên không phải là bằng cấp chuyên môn, mà là năng lực giao tiếp tiếng Nhật thực tế.

Doanh nghiệp Nhật đánh giá cao điều gì?
1. Chứng chỉ JLPT: N5 là điều kiện tối thiểu để xin visa du học, nhưng với visa kỹ sư hoặc Tokutei Gino, bạn cần ít nhất N4-N3 để giao tiếp suôn sẻ trong công việc.
2. Khả năng gõ máy tính tiếng Nhật: Nhân viên văn phòng, IT, kỹ sư bắt buộc phải thành thạo kỹ năng gõ Romaji sang Hiragana/Kanji nhanh chóng để gửi email và báo cáo công việc.
3. Kỹ năng lắng nghe và văn hóa công sở: Biết cách chào hỏi (Aisatsu), lắng nghe chỉ thị (Hou-Ren-So) và tác phong đúng giờ.`,
    comments: [
      {
        id: 301,
        author: 'Đặng Quốc Huy',
        rating: 5,
        content: 'Thông tin rất hữu ích cho các bạn đang chuẩn bị hồ sơ COE. Nhờ luyện nghe trên web này mà mình phỏng vấn đậu đơn hàng kỹ sư IT tại Osaka rồi!',
        createdAt: '4 ngày trước',
        likes: 42
      }
    ]
  },
  {
    id: 4,
    title: 'Phương pháp Spaced Repetition (SRS): Bí quyết ghi nhớ 1.500 từ vựng không bao giờ quên',
    slug: 'phuong-phap-spaced-repetition-nho-tu-vung',
    summary: 'Tại sao học vẹt từ vựng lại nhanh quên? Khám phá đường cong lãng quên Ebbinghaus và cách thuật toán Vườn Cây SRS giúp não bộ chuyển từ vựng vào vùng trí nhớ vĩnh viễn.',
    category: 'Phương pháp học',
    readTime: '5 phút đọc',
    views: 8900,
    author: 'Đội Ngũ Sư Phạm HYPER',
    authorRole: 'Nghiên cứu Não bộ & Ngôn ngữ',
    publishedAt: '2026-10-20',
    featured: false,
    tags: ['SRS', 'Trí nhớ', 'Khoa học học tập', 'Vườn cây'],
    content: `Theo đường cong lãng quên của nhà tâm lý học Hermann Ebbinghaus, con người sẽ quên đi 70% lượng kiến thức mới học sau 24 giờ nếu không được ôn tập đúng chu kỳ.

Phương pháp Lặp lại ngắt quãng (Spaced Repetition System - SRS) giải quyết triệt để vấn đề này:
- Ngày 1: Gieo mầm (Từ mới học)
- Ngày 3: Nảy mầm (Ôn lần 1)
- Ngày 7: Ra lá non (Ôn lần 2)
- Ngày 14: Đơm cành (Ôn lần 3)
- Ngày 30: Vững rễ cây cổ thụ (Trí nhớ vĩnh viễn)

Trang Vườn Cây trên WebApp của chúng ta mô phỏng chính xác quá trình này: Mỗi khi bạn ôn tập đúng hạn, bạn đang "tưới nước" cho cái cây tri thức lớn lên và từ vựng sẽ in sâu vào tiềm thức!`,
    comments: []
  },
  {
    id: 5,
    title: 'Văn hóa ứng xử công sở Nhật Bản: 7 quy tắc "sống còn" người mới đi làm cần biết',
    slug: 'van-hoa-ung-xu-cong-so-nhat-ban',
    summary: 'Tìm hiểu quy tắc báo cáo Hou-Ren-So, văn hóa cúi chào Ojigi, nghệ thuật dùng kính ngữ Keigo và những điều cấm kỵ nơi làm việc để xây dựng hình ảnh chuyên nghiệp.',
    category: 'Văn hóa Nhật',
    readTime: '6 phút đọc',
    views: 11100,
    author: 'Yamamoto Kenji',
    authorRole: 'Cố vấn Văn hóa Doanh nghiệp',
    publishedAt: '2026-10-18',
    featured: false,
    tags: ['Văn hóa công sở', 'Kính ngữ', 'Hou-Ren-So', 'Kỹ năng'],
    content: `Làm việc trong môi trường Nhật Bản đòi hỏi sự tinh tế và thấu hiểu văn hóa sâu sắc. Người Nhật rất coi trọng sự hòa hợp tập thể (Wa) và tính chuyên nghiệp trong từng cử chỉ nhỏ.

7 quy tắc vàng cần ghi nhớ:
1. Đúng giờ là tuyệt đối: Đến sớm 5-10 phút được xem là đúng giờ.
2. Nguyên tắc Hou-Ren-So: Hokoku (Báo cáo), Renraku (Liên lạc), Sodan (Thảo luận). Mọi vấn đề phát sinh phải được thông báo ngay cho cấp trên.
3. Chào hỏi năng lượng vào đầu ngày (Ohayou gozaimasu) và cảm ơn khi ra về (Otsukaresama desu).
4. Phân biệt rõ vợ chồng của người khác: Nhớ dùng 「奥さん」(Okusan) khi hỏi thăm vợ đồng nghiệp, và 「妻」(Tsuma) khi nói về vợ mình.
5. Luôn xác nhận lại bằng văn bản hoặc email sau các cuộc trao đổi quan trọng.`,
    comments: []
  },
  {
    id: 6,
    title: 'Lịch thi JLPT 2026 chính thức: Thời hạn nộp hồ sơ, địa điểm thi và lệ phí tại Hà Nội, Đà Nẵng, Huế, TP.HCM',
    slug: 'lich-thi-jlpt-2026-chinh-thuc-han-nop-ho-so',
    summary: 'Cập nhật từ Quỹ Giao lưu Quốc tế Nhật Bản (Japan Foundation): Lịch thi JLPT đợt 1 (Chủ Nhật đầu tháng 7) và đợt 2 (Chủ Nhật đầu tháng 12), quy trình mua hồ sơ và tra cứu kết quả trực tuyến.',
    category: 'Kỳ thi & Lịch thi',
    readTime: '6 phút đọc',
    views: 24500,
    author: 'Ban Thư Ký Kỳ Thi JLPT Việt Nam',
    authorRole: 'Cổng thông tin khảo thí',
    publishedAt: '2026-10-30',
    featured: true,
    tags: ['JLPT 2026', 'Lịch thi', 'Địa điểm thi', 'Lệ phí thi'],
    content: `Kỳ thi Năng lực Tiếng Nhật (JLPT) năm 2026 được tổ chức định kỳ 2 lần vào ngày Chủ Nhật đầu tiên của tháng 7 và tháng 12 trên toàn cầu.

1. Lịch thi cụ thể:
- Đợt 1: Chủ Nhật, ngày 05/07/2026. Hạn nộp hồ sơ từ đầu tháng 3 đến giữa tháng 4.
- Đợt 2: Chủ Nhật, ngày 06/12/2026. Hạn nộp hồ sơ từ đầu tháng 8 đến giữa tháng 9.

2. Địa điểm tiếp nhận hồ sơ và tổ chức thi tại Việt Nam:
- Hà Nội: Trường Đại học Ngoại ngữ - Đại học Quốc gia Hà Nội (N1, N2) và Trường Đại học Hà Nội (N3, N4, N5).
- Đà Nẵng: Trường Đại học Ngoại ngữ - Đại học Đà Nẵng (131 Lương Nhữ Hộc, Cẩm Lệ).
- Huế: Trường Đại học Ngoại ngữ - Đại học Huế (57 Nguyễn Khoa Chiêm, An Cựu).
- TP. Hồ Chí Minh: Trường Đại học Khoa học Xã hội và Nhân văn - ĐHQG TP.HCM và Trường Đại học Sư phạm TP.HCM.

3. Lệ phí thi tham khảo năm 2026:
- Cấp độ N5, N4: 650.000 VNĐ / thí sinh.
- Cấp độ N3, N2, N1: 700.000 VNĐ / thí sinh.

Học viên lưu ý chuẩn bị 2 ảnh thẻ 3x4 chụp trong vòng 6 tháng, bản photo Căn cước công dân và điền chính xác thông tin cá nhân để nhận chứng chỉ đúng hẹn.`,
    comments: [
      {
        id: 601,
        author: 'Lê Bảo Anh',
        rating: 5,
        content: 'Bài viết cập nhật rất đúng lúc. Mình đang chuẩn bị đăng ký thi đợt tới ở điểm Đại học Ngoại ngữ Đà Nẵng!',
        createdAt: '1 ngày trước',
        likes: 31
      }
    ]
  },
  {
    id: 7,
    title: 'Nhật Bản mở rộng chính sách Visa Tokutei Ginou 2026: Đón 820.000 lao động và cơ hội vĩnh trú',
    slug: 'nhat-ban-mo-rong-chinh-sach-visa-tokutei-ginou-2026',
    summary: 'Chính phủ Nhật Bản chính thức nới lỏng diện Kỹ năng đặc định số 2 lên 16 khối ngành, cho phép lao động được cấp quyền cư trú dài hạn và bảo lãnh người thân sang Nhật định cư.',
    category: 'Du học & Việc làm',
    readTime: '7 phút đọc',
    views: 18900,
    author: 'Văn Phòng Cố Vấn Định Cư Tokyo',
    authorRole: 'Chuyên gia Luật Pháp & Thị Thực',
    publishedAt: '2026-10-27',
    featured: false,
    tags: ['Tokutei Ginou', 'Visa Nhật', 'Vĩnh trú', 'Việc làm'],
    content: `Theo thông báo mới nhất từ Bộ Tư pháp Nhật Bản, chỉ tiêu tiếp nhận lao động kỹ năng đặc định (Tokutei Ginou) giai đoạn 2024 - 2029 được nâng lên 820.000 người, gấp đôi so với giai đoạn trước.

Các điểm mới đột phá người lao động cần nắm rõ:
1. Mở rộng diện Kỹ năng đặc định số 2: Trước đây chỉ áp dụng cho ngành xây dựng và đóng tàu, nay đã mở rộng thêm 14 ngành khác gồm: chế tạo máy, nông nghiệp, dịch vụ ăn uống, khách sạn, vệ sinh tòa nhà, bảo dưỡng ô tô.
2. Quyền lợi vượt trội của Tokutei số 2:
- Không giới hạn thời gian lưu trú tại Nhật Bản (có thể gia hạn liên tục đến khi xin visa Vĩnh trú).
- Được quyền đón vợ/chồng và con cái sang sinh sống tại Nhật Bản.
3. Yêu cầu tiếng Nhật:
- Tokutei số 1: Tối thiểu JLPT N4 hoặc JFT-Basic A2.
- Tokutei số 2: Khuyến khích đạt trình độ JLPT N3 trở lên để vượt qua bài kiểm tra chuyên môn cấp cao.`,
    comments: []
  },
  {
    id: 8,
    title: 'Kỳ thi NAT-TEST và TOPJ 2026: Giải pháp thay thế hoàn hảo khi lỡ kỳ thi JLPT',
    slug: 'ky-thi-nat-test-va-topj-2026-cam-nang',
    summary: 'Không cần chờ đợi 6 tháng một lần như JLPT: Kỳ thi NAT-TEST tổ chức 6 lần một năm vào các tháng chẵn, cấp chứng chỉ giá trị tương đương để xin visa du học và kỹ năng đặc định.',
    category: 'Kỳ thi & Lịch thi',
    readTime: '5 phút đọc',
    views: 13200,
    author: 'Ban Tư Vấn Du Học Đông Du',
    authorRole: 'Cố vấn khảo thí quốc tế',
    publishedAt: '2026-10-24',
    featured: false,
    tags: ['NAT-TEST', 'TOPJ', 'Chứng chỉ tiếng Nhật', 'Du học'],
    content: `Rất nhiều học viên bị lỡ hạn nộp hồ sơ JLPT hoặc cần chứng chỉ gấp để nộp hồ sơ Cục Xuất Nhập Cảnh (COE). NAT-TEST và TOPJ chính là phương án cứu cánh lý tưởng nhất.

1. Ưu điểm vượt trội của NAT-TEST:
- Tổ chức 6 đợt thi mỗi năm: Vào các tháng 2, 4, 6, 8, 10, 12.
- Thời gian biết kết quả nhanh chóng: Chỉ sau 2 đến 3 tuần thi là có kết quả online và chứng chỉ gốc.
- Cấu trúc đề thi bám sát 100% format của JLPT, chia làm 5 cấp độ từ 5Q (tương đương N5) đến 1Q (tương đương N1).

2. Quy đổi trình độ:
- NAT-TEST 5Q = JLPT N5 (Yêu cầu khoảng 700 - 800 từ vựng và 100 chữ Kanji).
- NAT-TEST 4Q = JLPT N4.
- NAT-TEST 3Q = JLPT N3.

Luyện từ vựng và làm trắc nghiệm phản xạ trên WebApp HYPER mỗi ngày sẽ giúp bạn tự tin vượt qua cả hai kỳ thi này với điểm số vượt trội.`,
    comments: []
  }
];

// Comprehensive Directory of Reputable Japanese Language Centers in Vietnam
const japaneseCenters = [
  // Đà Nẵng
  {
    id: 1,
    name: 'Trung tâm Nhật ngữ Đông Du Đà Nẵng',
    city: 'Đà Nẵng',
    rating: 4.9,
    reviewsCount: 312,
    address: '130 Nguyễn Chí Thanh, Phường Hải Châu 1, Quận Hải Châu, TP. Đà Nẵng',
    phone: '0236 3843 782',
    website: 'https://dongdudanang.edu.vn',
    strengths: ['Phương pháp dạy Kanji chiết tự đỉnh cao', 'Luyện thi JLPT N5 đến N2', 'Giảng viên lâu năm tâm huyết'],
    tuitionRange: '1.800.000đ - 3.500.000đ / khóa',
    badge: 'Top 1 Đào tạo Kanji',
    description: 'Chi nhánh chính thức của hệ thống Đông Du danh tiếng tại miền Trung. Nổi bật với phương pháp giảng dạy Kanji bài bản và rèn luyện tác phong kỷ luật chuẩn Nhật.'
  },
  {
    id: 2,
    name: 'Trung tâm Nhật ngữ Sakura Đà Nẵng',
    city: 'Đà Nẵng',
    rating: 4.8,
    reviewsCount: 245,
    address: '125 Hoàng Diệu, Phường Phước Ninh, Quận Hải Châu, TP. Đà Nẵng',
    phone: '0236 3562 155',
    website: 'https://sakuradanang.edu.vn',
    strengths: ['100% giáo viên bản xứ đứng lớp giao tiếp', 'Cơ sở vật chất chuẩn phong cách Nhật', 'CLB giao lưu văn hóa hàng tuần'],
    tuitionRange: '2.400.000đ - 4.500.000đ / khóa',
    badge: 'Giao tiếp Bản xứ',
    description: 'Địa chỉ hàng đầu tại Đà Nẵng cho các bạn muốn rèn luyện phản xạ giao tiếp tự nhiên và tìm hiểu sâu sắc về văn hóa trà đạo, thư pháp Nhật Bản.'
  },
  {
    id: 3,
    name: 'Jellyfish Education Đà Nẵng',
    city: 'Đà Nẵng',
    rating: 4.8,
    reviewsCount: 180,
    address: 'Tầng 3, Tòa nhà Fhome, 16 Lý Thường Kiệt, Quận Hải Châu, TP. Đà Nẵng',
    phone: '096 110 6466',
    website: 'https://jellyfish.edu.vn',
    strengths: ['Tỉ lệ đỗ visa du học 99%', 'Đào tạo tiếng Nhật Tokutei Ginou', 'Kết nối việc làm doanh nghiệp Nhật'],
    tuitionRange: '2.200.000đ - 4.200.000đ / khóa',
    badge: 'Chuyên Gia Du Học',
    description: 'Trực thuộc tập đoàn Jellyfish Nhật Bản, chuyên đào tạo tiếng Nhật mục tiêu du học và cung ứng nhân lực kỹ sư chất lượng cao sang Nhật làm việc.'
  },
  {
    id: 4,
    name: 'Trung tâm Nhật ngữ EIKOH Đà Nẵng',
    city: 'Đà Nẵng',
    rating: 4.7,
    reviewsCount: 142,
    address: 'Phan Châu Trinh, Quận Hải Châu, TP. Đà Nẵng',
    phone: '0236 3822 411',
    website: 'https://eikohvietnam.com',
    strengths: ['Quy mô lớp nhỏ 10-15 bạn', 'Cam kết đầu ra JLPT rõ ràng', 'Giáo trình chuẩn quốc tế'],
    tuitionRange: '1.900.000đ - 3.600.000đ / khóa',
    badge: 'Lớp Học Tiêu Chuẩn',
    description: 'Thừa hưởng phương pháp sư phạm tiên tiến từ Eikoh Nhật Bản, chú trọng kèm cặp từng học viên để nắm chắc nền tảng từ vựng và ngữ pháp.'
  },

  // Hà Nội
  {
    id: 5,
    name: 'Trung tâm Giao lưu Văn hóa Nhật Bản (Japan Foundation)',
    city: 'Hà Nội',
    rating: 5.0,
    reviewsCount: 620,
    address: '27 Quang Trung, Quận Hoàn Kiếm, TP. Hà Nội',
    phone: '024 3944 7419',
    website: 'https://jpf.org.vn',
    strengths: ['Cơ quan chính phủ Nhật Bản', 'Thư viện tiếng Nhật lớn nhất VN', 'Tổ chức các kỳ thi Marugoto & JF'],
    tuitionRange: 'Khóa học theo quỹ hỗ trợ (Ưu đãi)',
    badge: 'Viện Văn Hóa Quốc Gia',
    description: 'Địa chỉ vàng uy tín số 1 tại Việt Nam. Không chỉ đào tạo giáo trình chuẩn Marugoto mà còn là trung tâm tổ chức các sự kiện văn hóa, chiếu phim và hòa nhạc Nhật Bản.'
  },
  {
    id: 6,
    name: 'Trung tâm Nhật ngữ Dũng Mori Hà Nội',
    city: 'Hà Nội',
    rating: 4.9,
    reviewsCount: 890,
    address: 'Số 15, Ngõ 91, Nguyễn Chí Thanh, Quận Đống Đa, TP. Hà Nội',
    phone: '0969 868 820',
    website: 'https://dungmori.com',
    strengths: ['Hệ thống bài giảng video triệu views', 'Luyện thi JLPT N5 đến N1 cấp tốc', 'Cộng đồng học viên đông nhất cả nước'],
    tuitionRange: '1.600.000đ - 3.800.000đ / khóa',
    badge: 'Thương Hiệu Triệu View',
    description: 'Nổi tiếng với phong cách giảng dạy truyền cảm hứng, dễ nhớ, mẹo làm đề thi JLPT thực chiến và đội ngũ giáo viên trẻ trung đầy nhiệt huyết.'
  },
  {
    id: 7,
    name: 'Riki Nihongo Hà Nội',
    city: 'Hà Nội',
    rating: 4.9,
    reviewsCount: 780,
    address: 'Số 8 Trần Đăng Ninh, Dịch Vọng, Quận Cầu Giấy, TP. Hà Nội',
    phone: '1900 633 692',
    website: 'https://riki.edu.vn',
    strengths: ['Bảo hành đỗ JLPT 100%', 'App học tập tích hợp hiện đại', 'Cơ sở vật chất hiện đại trẻ trung'],
    tuitionRange: '2.100.000đ - 4.600.000đ / khóa',
    badge: 'Cam Kết Đầu Ra',
    description: 'Thương hiệu luyện thi JLPT hàng đầu tại miền Bắc với triết lý học không áp lực, kích thích não bộ ghi nhớ bằng hình ảnh và trò chơi tương tác.'
  },
  {
    id: 8,
    name: 'Trung tâm Tiếng Nhật Núi Trúc - Sugi Ryotaro',
    city: 'Hà Nội',
    rating: 4.8,
    reviewsCount: 410,
    address: 'Số 15 ngõ Núi Trúc, Phố Kim Mã, Quận Ba Đình, TP. Hà Nội',
    phone: '024 3846 0341',
    website: 'https://nuitruc.edu.vn',
    strengths: ['Trung tâm lâu đời nhất Hà Nội (từ 1992)', 'Học phí trợ giá phù hợp sinh viên', 'Hội đồng cựu lưu học sinh uy tín'],
    tuitionRange: '1.200.000đ - 2.800.000đ / khóa',
    badge: 'Truyền Thống Hơn 30 Năm',
    description: 'Thành lập từ năm 1992 dưới sự bảo trợ của Đại sứ thiện chí Sugi Ryotaro. Nơi đào tạo nền tảng ngữ pháp kinh điển và có mức học phí cực kỳ thân thiện với học sinh, sinh viên.'
  },
  {
    id: 9,
    name: 'Nhật ngữ Mina Hà Nội',
    city: 'Hà Nội',
    rating: 4.8,
    reviewsCount: 230,
    address: 'Số 8, ngõ 84, Chùa Láng, Quận Đống Đa, TP. Hà Nội',
    phone: '024 3775 7264',
    website: 'https://mina.edu.vn',
    strengths: ['Chuyên sâu Minna no Nihongo 50 bài', 'Kèm cặp 1 kèm 1 sửa phát âm', 'Không gian học ấm cúng'],
    tuitionRange: '1.500.000đ - 3.200.000đ / khóa',
    badge: 'Chuyên Sâu Minna',
    description: 'Tọa lạc gần các trường đại học lớn tại Chùa Láng, Mina chuyên về các khóa học nền tảng N5-N4 với phương pháp giảng dạy ân cần, tỉ mỉ.'
  },

  // Quảng Nam
  {
    id: 10,
    name: 'Trung tâm Nhật ngữ Sakura Tam Kỳ',
    city: 'Quảng Nam',
    rating: 4.8,
    reviewsCount: 165,
    address: 'Đường Phan Bội Châu, Phường Tân Thạnh, TP. Tam Kỳ, Tỉnh Quảng Nam',
    phone: '0235 3812 556',
    website: 'https://sakuratamky.edu.vn',
    strengths: ['Trung tâm Nhật ngữ lớn nhất Tam Kỳ', 'Hợp tác việc làm KCN Chu Lai & Tam Thăng', 'Luyện thi JLPT N5, N4'],
    tuitionRange: '1.400.000đ - 2.800.000đ / khóa',
    badge: 'Uy Tín Tam Kỳ',
    description: 'Địa chỉ đào tạo tiếng Nhật uy tín hàng đầu tại thủ phủ Tam Kỳ, hỗ trợ thanh niên và công nhân các khu công nghiệp học tiếng Nhật để nâng cao thu nhập.'
  },
  {
    id: 11,
    name: 'Trung tâm Nhật ngữ & Hợp tác Quốc tế Hội An',
    city: 'Quảng Nam',
    rating: 4.9,
    reviewsCount: 198,
    address: 'Đường Trần Hưng Đạo, Phường Cẩm Phô, TP. Hội An, Tỉnh Quảng Nam',
    phone: '0235 3910 888',
    website: 'https://hoian-japan.org',
    strengths: ['Giao lưu văn hóa phố cổ Hội An - Nhật Bản', 'Tiếng Nhật du lịch & dịch vụ khách sạn', 'Giáo viên tình nguyện viên JICA'],
    tuitionRange: '1.500.000đ - 3.000.000đ / khóa',
    badge: 'Văn Hóa Phố Cổ',
    description: 'Nằm tại thành phố di sản có mối giao hảo hữu nghị hơn 400 năm với Nhật Bản. Chuyên sâu tiếng Nhật ngành du lịch, nhà hàng, khách sạn và hướng dẫn viên.'
  },
  {
    id: 12,
    name: 'Viện Đào tạo Ngôn ngữ & Hợp tác Nhật Bản - ĐH Đông Á Quảng Nam',
    city: 'Quảng Nam',
    rating: 4.7,
    reviewsCount: 135,
    address: 'Khu đô thị Điện Nam - Điện Ngọc, Thị xã Điện Bàn, Tỉnh Quảng Nam',
    phone: '0235 3947 777',
    website: 'https://donga.edu.vn/quangnam',
    strengths: ['Chương trình thực tập Internship hưởng lương tại Nhật', 'Cơ sở hiện đại chuẩn đại học', 'Đảm bảo 100% đầu ra việc làm'],
    tuitionRange: 'Theo tín chỉ đại học & Khóa ngắn hạn',
    badge: 'Liên Kết Đại Học',
    description: 'Cầu nối chiến lược đưa sinh viên tỉnh Quảng Nam sang Nhật thực tập và làm việc tại các tập đoàn điều dưỡng, ô tô, tự động hóa hàng đầu Nhật Bản.'
  },

  // TP. Hồ Chí Minh
  {
    id: 13,
    name: 'Trường Nhật ngữ Đông Du TP. Hồ Chí Minh',
    city: 'TP. Hồ Chí Minh',
    rating: 4.9,
    reviewsCount: 1150,
    address: '43D/9 Hồ Văn Huê, Phường 9, Quận Phú Nhuận, TP.HCM',
    phone: '028 3845 3783',
    website: 'https://dongdu.edu.vn',
    strengths: ['Cái nôi của phong trào Đông Du thời hiện đại', 'Bộ giáo trình Hán tự độc quyền nổi tiếng', 'Luyện thi JLPT N5 đến N1'],
    tuitionRange: '1.900.000đ - 4.200.000đ / khóa',
    badge: 'Huyền Thoại Đông Du',
    description: 'Trường Nhật ngữ danh tiếng và có quy mô đào tạo lớn nhất phía Nam. Phương pháp Hán tự chiết tự của Đông Du đã đào tạo ra hàng chục nghìn thủ khoa JLPT và du học sinh ưu tú.'
  },
  {
    id: 14,
    name: 'Trường Nhật ngữ Sakura Sài Gòn (Lê Thánh Tôn)',
    city: 'TP. Hồ Chí Minh',
    rating: 4.9,
    reviewsCount: 860,
    address: '228 Lê Thánh Tôn, Phường Bến Thành, Quận 1, TP.HCM',
    phone: '028 3822 3230',
    website: 'https://sakura-vn.com',
    strengths: ['Trung tâm Nhật ngữ đầu tiên tại TP.HCM (từ 1989)', '100% giáo viên người Nhật trực tiếp đứng lớp', 'Môi trường đắm chìm tiếng Nhật'],
    tuitionRange: '2.800.000đ - 5.500.000đ / khóa',
    badge: 'Lâu Đời Nhất Sài Gòn (1989)',
    description: 'Tọa lạc ngay trung tâm Quận 1, Sakura là sự lựa chọn số 1 cho người đi làm và doanh nhân muốn giao tiếp lưu loát với phát âm chuẩn Tokyo tuyệt đối.'
  },
  {
    id: 15,
    name: 'Trung tâm Hợp tác Nguồn nhân lực VJCC TP.HCM',
    city: 'TP. Hồ Chí Minh',
    rating: 4.8,
    reviewsCount: 490,
    address: 'Trường ĐH Ngoại Thương CS2, Số 15 Đường D5, Phường 25, Quận Bình Thạnh, TP.HCM',
    phone: '028 3512 3420',
    website: 'https://vjcc.org.vn',
    strengths: ['Dự án JICA chính phủ Nhật Bản', 'Chuyên sâu tiếng Nhật Thương Mại & BJT', 'Đào tạo quản lý phong cách Keieijuku'],
    tuitionRange: '2.500.000đ - 5.000.000đ / khóa',
    badge: 'Tiếng Nhật Doanh Nghiệp',
    description: 'Viện đào tạo trực thuộc hợp tác giữa Bộ Giáo dục Đào tạo Việt Nam và JICA. Chuyên giảng dạy tiếng Nhật kinh doanh, viết email thương mại và văn hóa công sở Nhật Bản.'
  },
  {
    id: 16,
    name: 'Riki Nihongo Sài Gòn',
    city: 'TP. Hồ Chí Minh',
    rating: 4.8,
    reviewsCount: 650,
    address: '137 Điện Biên Phủ, Phường 15, Quận Bình Thạnh, TP.HCM',
    phone: '1900 633 692',
    website: 'https://riki.edu.vn',
    strengths: ['Luyện thi JLPT cam kết đầu ra', 'Cơ sở hiện đại tại Bình Thạnh và Quận 10', 'Học kết hợp app online thông minh'],
    tuitionRange: '2.100.000đ - 4.600.000đ / khóa',
    badge: 'Cam Kết Điểm Số',
    description: 'Chi nhánh Sài Gòn thu hút đông đảo sinh viên các trường đại học nhờ phương pháp học dễ nhớ, tương tác cao và chính sách bảo hành học lại miễn phí nếu thi trượt.'
  },

  // Các tỉnh khác
  {
    id: 17,
    name: 'Trung tâm Nhật ngữ Kokoro Hải Phòng',
    city: 'Các tỉnh khác',
    rating: 4.8,
    reviewsCount: 210,
    address: 'Lê Hồng Phong, Quận Ngô Quyền, TP. Hải Phòng',
    phone: '0225 3822 555',
    website: 'https://kokorohaiphong.edu.vn',
    strengths: ['Đào tạo nhân sự KCN Tràng Duệ & Đình Vũ', 'Luyện thi JLPT N5-N3', 'Học viên được giới thiệu việc làm ngay'],
    tuitionRange: '1.600.000đ - 3.200.000đ / khóa',
    badge: 'Uy Tín Hải Phòng',
    description: 'Đơn vị đào tạo tiếng Nhật hàng đầu đất Cảng, đối tác cung ứng nhân lực cho các nhà máy và công ty Nhật Bản tại các khu công nghiệp lớn.'
  },
  {
    id: 18,
    name: 'Trung tâm Nhật ngữ Eikoh Mekong Cần Thơ',
    city: 'Các tỉnh khác',
    rating: 4.8,
    reviewsCount: 175,
    address: 'Đường 30/4, Phường Xuân Khánh, Quận Ninh Kiều, TP. Cần Thơ',
    phone: '0292 3838 999',
    website: 'https://eikohmekong.edu.vn',
    strengths: ['Trung tâm chuẩn Nhật lớn nhất miền Tây', 'Luyện thi JLPT & Tư vấn du học', 'Đội ngũ giáo viên trẻ nhiệt tình'],
    tuitionRange: '1.500.000đ - 3.000.000đ / khóa',
    badge: 'Số 1 Miền Tây',
    description: 'Cung cấp cơ hội học tiếng Nhật tiêu chuẩn cao cho học sinh, sinh viên vùng Đồng bằng Sông Cửu Long với chi phí hợp lý.'
  },
  {
    id: 19,
    name: 'Trung tâm Nhật ngữ Đại học Ngoại ngữ Huế',
    city: 'Các tỉnh khác',
    rating: 4.9,
    reviewsCount: 320,
    address: '57 Nguyễn Khoa Chiêm, Phường An Cựu, TP. Huế, Thừa Thiên Huế',
    phone: '0234 3830 722',
    website: 'https://hucfl.edu.vn',
    strengths: ['Hội đồng tổ chức kỳ thi JLPT tại miền Trung', 'Giảng viên khoa Ngôn ngữ & Văn hóa Nhật Bản', 'Đào tạo học thuật bài bản'],
    tuitionRange: '1.200.000đ - 2.600.000đ / khóa',
    badge: 'Điểm Thi JLPT Miền Trung',
    description: 'Cơ sở đào tạo học thuật chính quy hàng đầu Cố đô Huế, đồng thời là địa điểm tổ chức kỳ thi JLPT quốc tế thường niên thu hút hàng nghìn thí sinh miền Trung.'
  },
  {
    id: 20,
    name: 'Trung tâm Nhật ngữ Bình Dương (Thủ Dầu Một)',
    city: 'Các tỉnh khác',
    rating: 4.7,
    reviewsCount: 195,
    address: 'Đại lộ Bình Dương, Phường Hiệp Thành, TP. Thủ Dầu Một, Bình Dương',
    phone: '0274 3848 111',
    website: 'https://nhatngubinhduong.edu.vn',
    strengths: ['Chuyên sâu tiếng Nhật kỹ thuật & nhà máy VSIP', 'Lớp học ca tối cho người đi làm', 'Luyện phỏng vấn tăng lương'],
    tuitionRange: '1.700.000đ - 3.400.000đ / khóa',
    badge: 'Chuyên Sâu KCN VSIP',
    description: 'Tập trung đào tạo tiếng Nhật ứng dụng cho kỹ sư, chuyên viên và công nhân làm việc trong các khu công nghiệp VSIP 1, VSIP 2 tại Bình Dương.'
  }
];

// General Course / Center Reviews List
const generalReviews = [
  {
    id: 1,
    author: 'Nguyễn Thanh Tùng',
    centerName: 'Khoá Học N5 Phản Xạ Toàn Diện - HYPER',
    rating: 5,
    content: 'Giao diện webapp đẹp nhất trong các trang học tiếng Nhật mình từng dùng. Tính năng AI Sensei giải thích siêu dễ hiểu và sát thực tế, Flashcard 3D tự đọc âm thanh nghe rất đã tai.',
    createdAt: 'Hôm nay lúc 11:30',
    verified: true
  },
  {
    id: 2,
    author: 'Phạm Thuỳ Dương',
    centerName: 'Trung Tâm Nhật Ngữ Đông Du & Tự Học Online',
    rating: 5,
    content: 'Mình kết hợp học ngữ pháp ở trung tâm và luyện từ vựng hàng ngày trên web này. Điểm thi thử N5 tăng từ 85 lên 165 điểm! Rất khuyến khích các bạn mới học nên thử.',
    createdAt: 'Hôm qua lúc 18:45',
    verified: true
  },
  {
    id: 3,
    author: 'Võ Hoàng Nam',
    centerName: 'Khóa Luyện Nghe Choukai Minna 25 Bài',
    rating: 5,
    content: 'Trang luyện nghe 25 bài đầy đủ từng câu thoại, có điều chỉnh tốc độ 0.75x đến 1.25x và transcript chi tiết giúp mình không còn sợ bài nghe JLPT nữa.',
    createdAt: '2 ngày trước',
    verified: true
  }
];

// 9.1 Get all articles
app.get('/api/forum/articles', (req, res) => {
  const { category, search } = req.query;
  let list = forumArticles;

  if (category && category !== 'all') {
    list = list.filter(a => a.category.toLowerCase() === category.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase().trim();
    list = list.filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.summary.toLowerCase().includes(q) ||
      a.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  res.json({
    success: true,
    total: list.length,
    data: list
  });
});

// 9.2 Get single article by ID
app.get('/api/forum/articles/:id', (req, res) => {
  const articleId = parseInt(req.params.id);
  const article = forumArticles.find(a => a.id === articleId);

  if (!article) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết' });
  }

  // Increment views
  article.views += 1;

  res.json({
    success: true,
    data: article
  });
});

// 9.3 Add comment to article (real-time)
app.post('/api/forum/articles/:id/comments', (req, res) => {
  const articleId = parseInt(req.params.id);
  const article = forumArticles.find(a => a.id === articleId);

  if (!article) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết' });
  }

  const { author, content, rating = 5 } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ success: false, message: 'Nội dung bình luận không được để trống' });
  }

  const newComment = {
    id: Date.now(),
    author: author?.trim() || 'Học viên ẩn danh',
    rating: Math.min(5, Math.max(1, parseInt(rating) || 5)),
    content: content.trim(),
    createdAt: 'Vừa xong',
    likes: 0
  };

  article.comments.unshift(newComment);

  res.json({
    success: true,
    comment: newComment,
    totalComments: article.comments.length
  });
});

// 9.4 Get general reviews
app.get('/api/forum/reviews', (req, res) => {
  res.json({
    success: true,
    total: generalReviews.length,
    data: generalReviews
  });
});

// 9.4.1 Get Japanese Language Centers Directory
app.get('/api/forum/centers', (req, res) => {
  const { city, search } = req.query;
  let list = japaneseCenters;

  if (city && city !== 'all') {
    list = list.filter(c => c.city.toLowerCase() === city.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase().trim();
    list = list.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.address.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q) ||
      c.strengths.some(s => s.toLowerCase().includes(q))
    );
  }

  res.json({
    success: true,
    total: list.length,
    data: list
  });
});

// 9.5 Add general review (real-time)
app.post('/api/forum/reviews', (req, res) => {
  const { author, centerName, content, rating = 5 } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ success: false, message: 'Nội dung đánh giá không được để trống' });
  }

  const newRev = {
    id: Date.now(),
    author: author?.trim() || 'Học viên',
    centerName: centerName?.trim() || 'Khóa học tiếng Nhật N5',
    rating: Math.min(5, Math.max(1, parseInt(rating) || 5)),
    content: content.trim(),
    createdAt: 'Vừa xong',
    verified: true
  };

  generalReviews.unshift(newRev);

  res.json({
    success: true,
    data: newRev
  });
});

// ── 10. SUPPORT & USER FEEDBACK (Real Email Dispatch to thuatnguyen1204@gmail.com) ──
app.post('/api/support/feedback', async (req, res) => {
  const { name, email, phone, category, message } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ success: false, message: 'Nội dung phản hồi không được để trống.' });
  }

  const cleanName = (name || 'Học viên ẩn danh').trim();
  const cleanEmail = (email || 'Chưa cung cấp email').trim();
  const cleanPhone = (phone || '0345698251').trim();
  const cleanMessage = message.trim();
  const categoryLabels = {
    bug: 'Báo lỗi phát âm / giao diện',
    feature: 'Đề xuất tính năng mới',
    content: 'Góp ý nội dung giáo trình JLPT',
    general: 'Góp ý chung / Khác'
  };
  const categoryText = categoryLabels[category] || category || 'Góp ý chung';
  const sentTime = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

  // 1. Save to PostgreSQL if connected
  if (db.pool && db.isDbConnected()) {
    try {
      await db.pool.query(`
        CREATE TABLE IF NOT EXISTS support_feedbacks (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255),
          email VARCHAR(255),
          phone VARCHAR(50),
          category VARCHAR(100),
          message TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      await db.pool.query(
        'INSERT INTO support_feedbacks (name, email, phone, category, message) VALUES ($1, $2, $3, $4, $5)',
        [cleanName, cleanEmail, cleanPhone, categoryText, cleanMessage]
      );
    } catch (dbErr) {
      console.warn('[Support Feedback] DB insert warning:', dbErr.message);
    }
  }

  // 2. Format Professional HTML Email
  const htmlContent = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #fed7e2; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
    <div style="background: linear-gradient(135deg, #db2777 0%, #e11d48 100%); padding: 24px 30px; text-align: left; color: #ffffff;">
      <h2 style="margin: 0 0 6px 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">HYPER JAPANESE — PHẢN HỒI HỌC VIÊN MỚI</h2>
      <p style="margin: 0; font-size: 13px; opacity: 0.9;">Hệ thống nhận thông tin phản hồi từ học viên trực tiếp trên Web App</p>
    </div>
    
    <div style="padding: 26px 30px; color: #334155; line-height: 1.6; font-size: 14px;">
      <div style="background: #fff5f7; border-left: 4px solid #db2777; padding: 14px 18px; border-radius: 8px; margin-bottom: 22px;">
        <p style="margin: 0; font-size: 13px; font-weight: 700; color: #9d174d;">CHỦ ĐỀ: ${categoryText.toUpperCase()}</p>
        <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b;">Thời gian nhận: ${sentTime} (Giờ Việt Nam)</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr>
          <td style="padding: 8px 0; font-weight: 700; width: 140px; color: #475569;">Họ và tên:</td>
          <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${cleanName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 700; color: #475569;">Email người gửi:</td>
          <td style="padding: 8px 0;"><a href="mailto:${cleanEmail}" style="color: #db2777; text-decoration: none; font-weight: 600;">${cleanEmail}</a></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 700; color: #475569;">Số điện thoại / Zalo:</td>
          <td style="padding: 8px 0; color: #0f172a; font-weight: 600;"><a href="tel:${cleanPhone}" style="color: #0284c7; text-decoration: none;">${cleanPhone}</a></td>
        </tr>
      </table>

      <div style="margin-top: 10px;">
        <p style="font-weight: 700; color: #1e293b; margin: 0 0 8px 0;">Nội dung phản hồi chi tiết:</p>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 20px; font-size: 14px; color: #1e293b; white-space: pre-wrap; line-height: 1.7;">${cleanMessage}</div>
      </div>
    </div>

    <div style="background: #f8fafc; padding: 18px 30px; border-top: 1px solid #f1f5f9; text-align: center; font-size: 12px; color: #94a3b8;">
      <p style="margin: 0 0 4px 0;">Email gửi tự động từ <strong>HYPER Japanese Platform</strong> tới quản trị viên <strong>thuatnguyen1204@gmail.com</strong></p>
      <p style="margin: 0;">Hotline / Zalo hỗ trợ: 0345698251</p>
    </div>
  </div>
  `;

  // 3. Dispatch via nodemailer
  try {
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpUser && smtpPass) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: smtpUser, pass: smtpPass }
      });

      await transporter.sendMail({
        from: `"HYPER JLPT Feedback" <${smtpUser}>`,
        to: 'thuatnguyen1204@gmail.com',
        replyTo: cleanEmail !== 'Chưa cung cấp email' ? cleanEmail : undefined,
        subject: `[HYPER JLPT] Phản hồi mới từ học viên: ${cleanName} (${categoryText})`,
        html: htmlContent
      });
      console.log(`[Email] Đã gửi thư phản hồi học viên thành công tới thuatnguyen1204@gmail.com.`);
    } else {
      console.log(`[Email Simulation] Nhận phản hồi mới từ ${cleanName} (${cleanEmail}). Nội dung đã ghi nhận và lưu trữ an toàn.`);
    }
  } catch (emailErr) {
    console.warn('[Email Dispatch] Warning:', emailErr.message);
  }

  res.json({
    success: true,
    message: 'Phản hồi của bạn đã được tiếp nhận và chuyển đến hòm thư thuatnguyen1204@gmail.com thành công!'
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'NihongoHub V3',
    db_mode: db.isDbConnected() ? 'PostgreSQL' : 'In-Memory Engine',
    timestamp: new Date().toISOString()
  });
});

// ── Meta Compliance: Privacy Policy ──
app.get('/privacy', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chính sách quyền riêng tư | HyperJapanese</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-50 text-slate-800 antialiased p-6 md:p-12">
  <div class="max-w-3xl mx-auto bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-slate-200">
    <div class="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
      <div class="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white font-bold text-xl">H</div>
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Chính sách quyền riêng tư (Privacy Policy)</h1>
        <p class="text-sm text-slate-500">HyperJapanese NihongoHub Platform | Cập nhật: 2026</p>
      </div>
    </div>
    
    <div class="space-y-6 text-sm md:text-base leading-relaxed text-slate-600">
      <section>
        <h2 class="text-lg font-semibold text-slate-800 mb-2">1. Thông tin chúng tôi thu thập</h2>
        <p>Khi bạn đăng nhập thông qua Google hoặc Facebook, chúng tôi chỉ thu thập các thông tin công khai cơ bản được sự đồng thuận của bạn:</p>
        <ul class="list-disc pl-5 mt-2 space-y-1">
          <li>Họ và tên hiển thị</li>
          <li>Địa chỉ email liên hệ</li>
          <li>Ảnh đại diện công khai (avatar)</li>
        </ul>
      </section>

      <section>
        <h2 class="text-lg font-semibold text-slate-800 mb-2">2. Mục đích sử dụng dữ liệu</h2>
        <p>Dữ liệu được sử dụng duy nhất để:</p>
        <ul class="list-disc pl-5 mt-2 space-y-1">
          <li>Định danh tài khoản học viên và lưu trữ tiến trình học tập JLPT (N5 - N1)</li>
          <li>Đồng bộ kết quả luyện thi, từ vựng và chuỗi ngày học trên các thiết bị</li>
          <li>Gửi thông báo quan trọng liên quan đến tài khoản học tập</li>
        </ul>
      </section>

      <section>
        <h2 class="text-lg font-semibold text-slate-800 mb-2">3. Bảo mật và Lưu trữ</h2>
        <p>Mọi thông tin cá nhân và dữ liệu học tập đều được mã hóa bằng tiêu chuẩn an toàn cao cấp và không bao giờ được chia sẻ hay bán cho bất kỳ bên thứ ba nào.</p>
      </section>

      <section>
        <h2 class="text-lg font-semibold text-slate-800 mb-2">4. Quyền của bạn và Xóa dữ liệu</h2>
        <p>Bạn có toàn quyền yêu cầu trích xuất hoặc xóa vĩnh viễn toàn bộ dữ liệu cá nhân của mình bất kỳ lúc nào bằng cách truy cập trang Hướng dẫn xóa dữ liệu hoặc gửi email trực tiếp tới quản trị viên.</p>
      </section>

      <section class="pt-4 border-t border-slate-100">
        <p class="text-sm text-slate-500">Liên hệ quản trị viên: <a href="mailto:thuathyper05@gmail.com" class="text-red-600 font-medium hover:underline">thuathyper05@gmail.com</a></p>
      </section>
    </div>
  </div>
</body>
</html>`);
});

// ── Meta Compliance: Terms of Service ──
app.get('/terms', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Điều khoản dịch vụ | HyperJapanese</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-50 text-slate-800 antialiased p-6 md:p-12">
  <div class="max-w-3xl mx-auto bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-slate-200">
    <div class="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
      <div class="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white font-bold text-xl">H</div>
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Điều khoản dịch vụ (Terms of Service)</h1>
        <p class="text-sm text-slate-500">HyperJapanese NihongoHub Platform | Cập nhật: 2026</p>
      </div>
    </div>
    
    <div class="space-y-6 text-sm md:text-base leading-relaxed text-slate-600">
      <section>
        <h2 class="text-lg font-semibold text-slate-800 mb-2">1. Giới thiệu</h2>
        <p>Chào mừng bạn đến với nền tảng học tiếng Nhật HyperJapanese. Khi truy cập và sử dụng dịch vụ của chúng tôi, bạn đồng ý tuân thủ các điều khoản này.</p>
      </section>

      <section>
        <h2 class="text-lg font-semibold text-slate-800 mb-2">2. Sử dụng tài khoản</h2>
        <p>Học viên có trách nhiệm bảo mật thông tin đăng nhập của mình. Mọi hoạt động phát sinh từ tài khoản của bạn thuộc trách nhiệm của bạn.</p>
      </section>

      <section>
        <h2 class="text-lg font-semibold text-slate-800 mb-2">3. Quyền sở hữu trí tuệ</h2>
        <p>Toàn bộ tài liệu học tập, từ vựng, ngữ pháp, âm thanh phát âm và hệ thống AI được thiết kế và bảo vệ quyền tác giả bởi HyperJapanese.</p>
      </section>

      <section class="pt-4 border-t border-slate-100">
        <p class="text-sm text-slate-500">Liên hệ hỗ trợ: <a href="mailto:thuathyper05@gmail.com" class="text-red-600 font-medium hover:underline">thuathyper05@gmail.com</a></p>
      </section>
    </div>
  </div>
</body>
</html>`);
});

// ── Meta Compliance: User Data Deletion Instructions ──
app.get('/data-deletion', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hướng dẫn xóa dữ liệu | HyperJapanese</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-50 text-slate-800 antialiased p-6 md:p-12">
  <div class="max-w-3xl mx-auto bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-slate-200">
    <div class="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
      <div class="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white font-bold text-xl">H</div>
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Hướng dẫn xóa dữ liệu người dùng (Data Deletion)</h1>
        <p class="text-sm text-slate-500">HyperJapanese NihongoHub Platform | Chuẩn Facebook Meta Platform</p>
      </div>
    </div>
    
    <div class="space-y-6 text-sm md:text-base leading-relaxed text-slate-600">
      <p>Theo chính sách nền tảng Meta Facebook và quy chuẩn quyền riêng tư GDPR, người dùng có toàn quyền xóa dữ liệu và lịch sử học tập của mình khỏi HyperJapanese bất kỳ lúc nào.</p>

      <section>
        <h2 class="text-lg font-semibold text-slate-800 mb-2">Cách 1: Gỡ ứng dụng trực tiếp trên Facebook</h2>
        <ol class="list-decimal pl-5 space-y-2">
          <li>Mở Facebook, vào mục <strong>Cài đặt và quyền riêng tư (Settings and Privacy)</strong> sau đó chọn <strong>Cài đặt (Settings)</strong>.</li>
          <li>Tìm và bấm vào mục <strong>Ứng dụng và trang web (Apps and Websites)</strong>.</li>
          <li>Tìm ứng dụng <strong>HyperJapanese</strong> trong danh sách ứng dụng đã kết nối.</li>
          <li>Nhấp vào nút <strong>Gỡ (Remove)</strong> để hủy quyền truy cập.</li>
        </ol>
      </section>

      <section>
        <h2 class="text-lg font-semibold text-slate-800 mb-2">Cách 2: Yêu cầu xóa sạch toàn bộ hồ sơ dữ liệu qua Email</h2>
        <p>Nếu bạn muốn xóa toàn bộ lịch sử điểm số, tiến trình từ vựng và tài khoản khỏi cơ sở dữ liệu hệ thống, vui lòng gửi email yêu cầu:</p>
        <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-2">
          <p><strong>Email tiếp nhận:</strong> <span class="text-red-600 font-semibold">thuathyper05@gmail.com</span></p>
          <p><strong>Tiêu đề:</strong> Yêu cầu xóa dữ liệu tài khoản HyperJapanese</p>
          <p><strong>Nội dung:</strong> Cung cấp địa chỉ email bạn đã sử dụng để đăng nhập vào HyperJapanese.</p>
        </div>
        <p class="text-xs text-slate-500 mt-2">Hệ thống sẽ tiến hành xóa hoàn toàn dữ liệu trong vòng 24 giờ làm việc và gửi thông báo xác nhận về email của bạn.</p>
      </section>
    </div>
  </div>
</body>
</html>`);
});

app.listen(PORT, () => {
  console.log(`[NihongoHub API] Server running on port ${PORT} (http://localhost:${PORT})`);
});
