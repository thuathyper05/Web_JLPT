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

// ── 5. PARTICLES ──
app.get('/api/particles', (req, res) => {
  const { level } = req.query;
  let list = db.data.particles;
  if (level) {
    list = list.filter(p => p.level === level);
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
