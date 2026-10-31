const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
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

// ── 1. AUTH ROUTES ──
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin.' });
  }

  const existing = inMemoryUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ success: false, message: 'Email này đã được đăng ký.' });
  }

  const newUser = {
    id: inMemoryUsers.length + 1,
    username: username.trim(),
    email: email.trim().toLowerCase(),
    password_hash: bcrypt.hashSync(password, 8),
    role: 'user',
    created_at: new Date().toISOString()
  };

  inMemoryUsers.push(newUser);

  const token = jwt.sign({ id: newUser.id, username: newUser.username, email: newUser.email }, JWT_SECRET, { expiresIn: '30d' });

  res.json({
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

  const user = inMemoryUsers.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không chính xác.' });
  }

  const token = jwt.sign({ id: user.id, username: user.username, email: user.email }, JWT_SECRET, { expiresIn: '30d' });

  res.json({
    success: true,
    message: 'Đăng nhập thành công!',
    token,
    user: { id: user.id, username: user.username, email: user.email }
  });
});

app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập địa chỉ email.' });
  }
  // Simulated instant token or email delivery
  res.json({
    success: true,
    message: 'Hướng dẫn khôi phục mật khẩu đã được gửi đến email của bạn! (Kiểm tra hòm thư)'
  });
});

app.get('/api/auth/me', (req, res) => {
  if (!req.user) {
    return res.json({ success: true, user: null });
  }
  res.json({ success: true, user: req.user });
});

// ── 2. LESSONS & VOCABULARIES ──
app.get('/api/lessons', (req, res) => {
  const allVocabs = db.data.lessons;
  // Compute lessons 1 to 25
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

app.get('/api/lessons/:id', (req, res) => {
  const lNum = parseInt(req.params.id);
  const vocabs = db.data.lessons.filter(v => v.lesson_number === lNum);
  res.json({
    id: lNum,
    lesson_number: lNum,
    title: vocabs[0]?.lesson_title || `Bài ${lNum}`,
    description: `Toàn bộ ${vocabs.length} từ vựng chuẩn Minna no Nihongo Bài ${lNum}`,
    vocab_count: vocabs.length
  });
});

app.get('/api/vocabularies', (req, res) => {
  const { lesson, search } = req.query;
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

// ── 3. KANJI N5 ──
app.get('/api/kanji', (req, res) => {
  const { search } = req.query;
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

// ── 4. GRAMMAR N5 ──
app.get('/api/grammar', (req, res) => {
  const { lesson } = req.query;
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

// ── 5. PARTICLES N5 ──
app.get('/api/particles', (req, res) => {
  res.json(db.data.particles);
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

// ── 7. PROGRESS & GAMIFICATION ──
app.get('/api/progress', (req, res) => {
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

app.post('/api/progress/tick', (req, res) => {
  const { vocabId, status, xp = 10 } = req.body;
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
app.post('/api/ai/query', (req, res) => {
  const { action, prompt, context } = req.body;
  const response = generateAiResponse({ action, prompt, context });
  res.json(response);
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

app.listen(PORT, () => {
  console.log(`[NihongoHub API] Server running on port ${PORT} (http://localhost:${PORT})`);
});
