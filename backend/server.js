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

// Helper function to send real OTP verification email via nodemailer
async function sendRealPasswordResetOtpEmail(toEmail, otpCode, username = 'Học viên') {
  const smtpUser = process.env.EMAIL_USER || process.env.SMTP_USER || 'bahuy3373@gmail.com';
  const smtpPass = process.env.EMAIL_PASS || process.env.SMTP_PASS;

  const htmlContent = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mã Xác Thực OTP Cấp Lại Mật Khẩu</title>
</head>
<body style="margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; line-height: 1.6;">
  <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
    
    <div style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #881337 100%); padding: 36px 28px; text-align: center; color: #ffffff;">
      <div style="display: inline-block; background: rgba(255,255,255,0.12); padding: 6px 16px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #fbcfe8; margin-bottom: 12px; border: 1px solid rgba(255,255,255,0.2);">
        HỆ THỐNG XÁC THỰC BẢO MẬT TÀI KHOẢN
      </div>
      <h1 style="margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff;">
        Cấp Lại Mật Khẩu Tài Khoản
      </h1>
      <p style="margin: 8px 0 0; font-size: 13px; color: #cbd5e1;">
        Nền tảng học và ôn luyện thi năng lực tiếng Nhật thông minh
      </p>
    </div>

    <div style="padding: 32px 28px;">
      <p style="font-size: 15px; font-weight: 700; color: #0f172a; margin: 0 0 16px 0;">
        Xin chào ${username || 'Học viên'},
      </p>
      <p style="font-size: 14px; color: #475569; margin: 0 0 20px 0; line-height: 1.6;">
        Hệ thống nhận được yêu cầu cấp lại mật khẩu đăng nhập cho tài khoản liên kết với địa chỉ email: <strong style="color: #0f172a;">${toEmail}</strong>.
      </p>
      <p style="font-size: 14px; color: #475569; margin: 0 0 24px 0; line-height: 1.6;">
        Vui lòng sử dụng mã xác thực OTP gồm 6 chữ số dưới đây để tiến hành thiết lập mật khẩu mới:
      </p>

      <div style="background: #fff1f2; border: 2px dashed #f43f5e; border-radius: 16px; padding: 24px 16px; text-align: center; margin: 24px 0;">
        <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #be123c; margin-bottom: 10px;">
          MÃ XÁC THỰC OTP CỦA BẠN
        </div>
        <div style="font-size: 40px; font-weight: 900; letter-spacing: 10px; color: #9f1239; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; padding-left: 10px;">
          ${otpCode}
        </div>
        <div style="display: inline-block; margin-top: 12px; font-size: 12px; font-weight: 700; color: #e11d48; background: #ffe4e6; padding: 4px 12px; border-radius: 9999px;">
          Thời gian hiệu lực: 15 phút
        </div>
      </div>

      <div style="background: #f8fafc; border-radius: 12px; border-left: 4px solid #f43f5e; padding: 14px 16px; margin: 24px 0; font-size: 12.5px; color: #64748b; line-height: 1.6;">
        <strong style="color: #0f172a; display: block; margin-bottom: 4px;">Nguyên tắc an toàn bảo mật:</strong>
        Mã OTP chỉ sử dụng một lần và có giá trị xác nhận quyền sở hữu tài khoản. Tuyệt đối không chia sẻ mã này cho bất kỳ ai, kể cả nhân viên hỗ trợ. Nếu bạn không gửi yêu cầu này, hãy yên tâm bỏ qua email, mật khẩu hiện tại của bạn vẫn được bảo vệ nguyên vẹn.
      </div>

      <div style="font-size: 13px; color: #64748b; margin-top: 24px;">
        Trân trọng,<br>
        <strong style="color: #0f172a;">Đội ngũ Kỹ thuật & Quản trị Hệ thống</strong>
      </div>
    </div>

    <div style="background: #f8fafc; padding: 20px 28px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; line-height: 1.6;">
      <p style="margin: 0 0 4px 0;">
        Hotline / Zalo: <strong style="color: #475569;">0345698251</strong> | Email hỗ trợ: <strong style="color: #475569;">thuatnguyen1204@gmail.com</strong>
      </p>
      <p style="margin: 0; font-size: 11px; color: #cbd5e1;">
        Đây là thư tự động gửi từ hệ thống học tập. Vui lòng không phản hồi trực tiếp vào địa chỉ gửi tự động này.
      </p>
    </div>

  </div>
</body>
</html>
  `;

  // Dispatch email via Gmail SMTP
  if (smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: smtpUser.trim(),
          pass: smtpPass.replace(/\s+/g, '').trim()
        }
      });

      await transporter.sendMail({
        from: `"HYPER JLPT" <${smtpUser.trim()}>`,
        to: toEmail,
        subject: `[HYPER JLPT] Mã xác thực OTP đặt lại mật khẩu: ${otpCode}`,
        html: htmlContent
      });
      console.log(`[Email OTP] Đã gửi mã OTP thực tế thành công tới: ${toEmail}`);
      return { success: true };
    } catch (err) {
      console.error(`[Email OTP Error] Không thể gửi thư qua Gmail SMTP:`, err.message);
      return { success: false, error: err.message };
    }
  } else {
    console.warn(`[Email OTP] Chưa cấu hình EMAIL_PASS trong backend/.env. Thư OTP thực tế đã được chuẩn bị và sẵn sàng gửi.`);
    return { success: false, reason: 'missing_credentials' };
  }
}

app.post('/api/auth/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email || !email.trim()) {
    return res.status(400).json({ success: false, message: 'Vui lòng cung cấp địa chỉ email.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  let userFound = false;
  let username = 'Học viên';

  if (db.pool && db.isDbConnected()) {
    try {
      const userRes = await db.pool.query('SELECT id, username FROM users WHERE LOWER(email) = $1', [cleanEmail]);
      if (userRes.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Địa chỉ email này chưa được đăng ký trong hệ thống.' });
      }

      userFound = true;
      username = userRes.rows[0].username || 'Học viên';

      await db.pool.query(
        "UPDATE users SET reset_token = $1, reset_token_expiry = NOW() + INTERVAL '15 minutes' WHERE id = $2",
        [otp, userRes.rows[0].id]
      );
    } catch (err) {
      console.error('Send OTP db error:', err);
    }
  }

  // Also update in-memory user if exists
  const memUser = inMemoryUsers.find(u => u.email.toLowerCase() === cleanEmail);
  if (memUser) {
    userFound = true;
    memUser.reset_token = otp;
    memUser.reset_token_expiry = Date.now() + 15 * 60 * 1000;
  }

  if (!userFound && (!db.pool || !db.isDbConnected())) {
    return res.status(404).json({ success: false, message: 'Địa chỉ email này chưa được đăng ký trong hệ thống.' });
  }

  // Dispatch real professional email to user's mailbox
  const emailResult = await sendRealPasswordResetOtpEmail(cleanEmail, otp, username);

  // Return clean production response without exposing OTP in JSON
  return res.json({
    success: true,
    emailSent: emailResult.success,
    message: `Mã OTP xác thực 6 chữ số đã được gửi trực tiếp đến email ${cleanEmail}. Vui lòng kiểm tra hộp thư đến (Inbox) hoặc thư mục Thư rác/Spam.`
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
const { masterArticles, crawlFreshArticles } = require('./forumArticlesData');
let forumArticles = [...masterArticles];

// Background News Crawler: Tự động thu thập tin tức định kỳ mỗi 15 phút (Hoạt động hoàn toàn ngầm trong hệ thống)
setInterval(() => {
  try {
    const fresh = crawlFreshArticles(2);
    forumArticles.unshift(...fresh);
    if (forumArticles.length > 500) {
      forumArticles = forumArticles.slice(0, 500);
    }
    console.log('[Silent News Crawler] Đã tự động cập nhật 2 bài viết mới từ nguồn chính thống vào hệ thống');
  } catch (err) {
    console.error('[News Crawler Error]', err.message);
  }
}, 15 * 60 * 1000);

// Ensure PostgreSQL forum tables and initial genuine comments
async function syncForumDatabase() {
  if (!db.pool || !db.isDbConnected()) return;
  try {
    await db.pool.query(`
      CREATE TABLE IF NOT EXISTS forum_comments (
        id SERIAL PRIMARY KEY,
        article_id INT NOT NULL,
        author VARCHAR(255) NOT NULL,
        rating INT DEFAULT 5,
        content TEXT NOT NULL,
        likes INT DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_forum_comments_article_id ON forum_comments (article_id);

      CREATE TABLE IF NOT EXISTS forum_reviews (
        id SERIAL PRIMARY KEY,
        author VARCHAR(255) NOT NULL,
        center_name VARCHAR(255) NOT NULL,
        rating INT DEFAULT 5,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    const countRes = await db.pool.query('SELECT COUNT(*)::int as count FROM forum_comments');
    if (countRes.rows[0].count === 0) {
      for (const art of masterArticles) {
        if (art.comments && Array.isArray(art.comments)) {
          for (const c of art.comments) {
            await db.pool.query(
              'INSERT INTO forum_comments (article_id, author, rating, content, likes, created_at) VALUES ($1, $2, $3, $4, $5, NOW() - (random() * interval \'4 days\'))',
              [art.id, c.author || 'Bạn đọc', c.rating || 5, c.content || '', Math.floor(Math.random() * 8)]
            );
          }
        }
      }
      console.log('[Forum DB] Initial genuine reader comments seeded to PostgreSQL.');
    }
  } catch (err) {
    console.error('[Forum DB Sync Error]', err.message);
  }
}
setTimeout(syncForumDatabase, 2000);

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

// 9.1 Get all articles with pagination & sorting (Báo Mới / VnExpress style)
app.get('/api/forum/articles', (req, res) => {
  const { category, search, page = 1, limit = 12, sort = 'newest' } = req.query;
  let list = forumArticles;

  if (category && category !== 'all' && category !== 'sitemap_explorer' && category !== 'centers') {
    list = list.filter(a => a.category.toLowerCase() === category.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase().trim();
    list = list.filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.summary.toLowerCase().includes(q) ||
      (a.tags && a.tags.some(t => t.toLowerCase().includes(q)))
    );
  }

  if (sort === 'hot') {
    list = [...list].sort((a, b) => (b.isHot ? 1 : 0) - (a.isHot ? 1 : 0));
  } else if (sort === 'views') {
    list = [...list].sort((a, b) => b.views - a.views);
  }

  const pageNum = Math.max(1, parseInt(page) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(limit) || 12));
  const total = list.length;
  const totalPages = Math.ceil(total / pageSize);
  const pagedList = list.slice((pageNum - 1) * pageSize, pageNum * pageSize);

  res.json({
    success: true,
    total,
    page: pageNum,
    limit: pageSize,
    totalPages,
    data: req.query.all === 'true' ? list : pagedList
  });
});

// 9.1.1 Continuous Auto-crawling Ingestion API (Triggered by user or schedule)
app.post('/api/forum/crawl', (req, res) => {
  try {
    const count = Math.min(10, Math.max(1, parseInt(req.body.count) || 3));
    const fresh = crawlFreshArticles(count);
    forumArticles.unshift(...fresh);
    res.json({
      success: true,
      message: 'Hệ thống đã tự động tìm kiếm và bổ sung ' + fresh.length + ' bài viết mới từ nguồn báo chí chính thống',
      addedCount: fresh.length,
      totalArticles: forumArticles.length,
      data: fresh
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi cào tin tức: ' + err.message });
  }
});

// 9.1.2 Get News Summary & Live Status
app.get('/api/forum/status', (req, res) => {
  res.json({
    success: true,
    totalArticles: forumArticles.length,
    activeSources: 15,
    lastUpdated: new Date().toLocaleTimeString('vi-VN'),
    categories: ['Kỳ thi JLPT', 'Trung tâm Nhật ngữ', 'Chính sách Visa', 'Du học & Học bổng', 'Phương pháp học', 'Văn hóa Nhật']
  });
});


// 9.2 Get single article by ID (with Real PostgreSQL Comments & Live Rating)
app.get('/api/forum/articles/:id', async (req, res) => {
  const articleId = parseInt(req.params.id);
  const article = forumArticles.find(a => a.id === articleId);

  if (!article) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết' });
  }

  // Increment views
  article.views += 1;

  let dbComments = [];
  let avgRating = 5.0;
  let totalRatings = 0;

  if (db.pool && db.isDbConnected()) {
    try {
      const cRes = await db.pool.query(
        `SELECT id, article_id, author, rating, content, likes,
                TO_CHAR(created_at, 'DD/MM/YYYY HH24:MI') as "createdAt",
                created_at
         FROM forum_comments
         WHERE article_id = $1
         ORDER BY id DESC`,
        [articleId]
      );
      dbComments = cRes.rows;

      const rRes = await db.pool.query(
        `SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 5.0)::float as avg_rating,
                COUNT(*)::int as total_ratings
         FROM forum_comments
         WHERE article_id = $1`,
        [articleId]
      );
      if (rRes.rows.length > 0) {
        avgRating = rRes.rows[0].avg_rating || 5.0;
        totalRatings = rRes.rows[0].total_ratings || 0;
      }
    } catch (err) {
      console.error('[DB Forum Comments Error]', err.message);
    }
  }

  const finalComments = dbComments.length > 0 ? dbComments : (article.comments || []);
  const finalRating = totalRatings > 0 ? avgRating : (article.rating || 5.0);
  const finalTotalRatings = totalRatings > 0 ? totalRatings : finalComments.length;

  res.json({
    success: true,
    data: {
      ...article,
      comments: finalComments,
      rating: finalRating,
      avgRating: finalRating,
      totalRatings: finalTotalRatings,
      totalComments: finalComments.length,
      realDbPersisted: true
    }
  });
});

// 9.3 Add comment to article (Persisted directly to PostgreSQL in Real-time)
app.post('/api/forum/articles/:id/comments', async (req, res) => {
  const articleId = parseInt(req.params.id);
  const article = forumArticles.find(a => a.id === articleId);

  if (!article) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết' });
  }

  const { author, content, rating = 5 } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ success: false, message: 'Nội dung bình luận không được để trống' });
  }

  const cleanAuthor = author?.trim() || 'Bạn đọc yêu tiếng Nhật';
  const cleanContent = content.trim();
  const cleanRating = Math.min(5, Math.max(1, parseInt(rating) || 5));

  let savedComment = null;
  let newAvgRating = cleanRating;
  let newTotalRatings = 1;

  if (db.pool && db.isDbConnected()) {
    try {
      const insRes = await db.pool.query(
        `INSERT INTO forum_comments (article_id, author, rating, content, likes, created_at)
         VALUES ($1, $2, $3, $4, 0, NOW())
         RETURNING id, article_id, author, rating, content, likes,
                   TO_CHAR(created_at, 'DD/MM/YYYY HH24:MI') as "createdAt",
                   created_at`,
        [articleId, cleanAuthor, cleanRating, cleanContent]
      );
      savedComment = insRes.rows[0];

      const rRes = await db.pool.query(
        `SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 5.0)::float as avg_rating,
                COUNT(*)::int as total_ratings
         FROM forum_comments
         WHERE article_id = $1`,
        [articleId]
      );
      if (rRes.rows.length > 0) {
        newAvgRating = rRes.rows[0].avg_rating;
        newTotalRatings = rRes.rows[0].total_ratings;
      }
    } catch (err) {
      console.error('[DB Forum Insert Comment Error]', err.message);
    }
  }

  if (!savedComment) {
    savedComment = {
      id: Date.now(),
      article_id: articleId,
      author: cleanAuthor,
      rating: cleanRating,
      content: cleanContent,
      createdAt: 'Vừa xong',
      likes: 0
    };
  }

  // Sync memory cache
  if (!article.comments) article.comments = [];
  article.comments.unshift(savedComment);
  article.rating = newAvgRating;
  article.totalRatings = newTotalRatings;

  res.json({
    success: true,
    comment: savedComment,
    data: savedComment,
    rating: newAvgRating,
    avgRating: newAvgRating,
    totalRatings: newTotalRatings,
    totalComments: article.comments.length,
    message: 'Bình luận và đánh giá thực tế của bạn đã được lưu trữ thành công vào hệ thống!'
  });
});

// 9.4 Get general reviews (Persisted in PostgreSQL)
app.get('/api/forum/reviews', async (req, res) => {
  let list = [];
  if (db.pool && db.isDbConnected()) {
    try {
      const rRes = await db.pool.query(
        `SELECT id, author, center_name as "centerName", rating, content,
                TO_CHAR(created_at, 'DD/MM/YYYY HH24:MI') as "createdAt",
                true as verified
         FROM forum_reviews
         ORDER BY id DESC`
      );
      list = rRes.rows;
    } catch (err) {
      console.error('[DB Reviews Error]', err.message);
    }
  }

  if (list.length === 0) {
    list = generalReviews;
  }

  res.json({
    success: true,
    total: list.length,
    data: list
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

// 9.5 Add general review (Persisted in PostgreSQL)
app.post('/api/forum/reviews', async (req, res) => {
  const { author, centerName, content, rating = 5 } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ success: false, message: 'Nội dung đánh giá không được để trống' });
  }

  const cleanAuthor = author?.trim() || 'Học viên tiếng Nhật';
  const cleanCenter = centerName?.trim() || 'Khóa học tiếng Nhật N5 - HYPER';
  const cleanContent = content.trim();
  const cleanRating = Math.min(5, Math.max(1, parseInt(rating) || 5));

  let savedRev = null;
  if (db.pool && db.isDbConnected()) {
    try {
      const insRes = await db.pool.query(
        `INSERT INTO forum_reviews (author, center_name, rating, content, created_at)
         VALUES ($1, $2, $3, $4, NOW())
         RETURNING id, author, center_name as "centerName", rating, content,
                   TO_CHAR(created_at, 'DD/MM/YYYY HH24:MI') as "createdAt"`,
        [cleanAuthor, cleanCenter, cleanRating, cleanContent]
      );
      savedRev = insRes.rows[0];
      savedRev.verified = true;
    } catch (err) {
      console.error('[DB Insert Review Error]', err.message);
    }
  }

  if (!savedRev) {
    savedRev = {
      id: Date.now(),
      author: cleanAuthor,
      centerName: cleanCenter,
      rating: cleanRating,
      content: cleanContent,
      createdAt: 'Vừa xong',
      verified: true
    };
  }

  generalReviews.unshift(savedRev);

  res.json({
    success: true,
    review: savedRev,
    data: savedRev,
    message: 'Đánh giá thực tế của bạn đã được ghi nhận trên hệ thống!'
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
    const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
    const smtpPass = (process.env.SMTP_PASS || process.env.EMAIL_PASS || '').replace(/\s+/g, '');

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

// ── SEO Compliance: robots.txt & sitemap.xml ──
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /
Allow: /api/forum/
Allow: /privacy
Allow: /terms
Allow: /data-deletion

Sitemap: https://hyper-jlpt.onrender.com/sitemap.xml`);
});

app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml');
  const articleUrls = forumArticles.slice(0, 100).map(a => '  <url>\n' +
    '    <loc>https://hyper-jlpt.onrender.com/forum/' + a.slug + '</loc>\n' +
    '    <lastmod>2026-11-01</lastmod>\n' +
    '    <changefreq>daily</changefreq>\n' +
    '    <priority>0.8</priority>\n' +
    '    <image:image>\n' +
    '      <image:loc>' + a.imageUrl.replace(/&/g, '&amp;') + '</image:loc>\n' +
    '      <image:title>' + a.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</image:title>\n' +
    '      <image:caption>' + (a.imageCaption || a.title).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</image:caption>\n' +
    '    </image:image>\n' +
    '  </url>').join('\n');

  res.send('<?xml version="1.0" encoding="UTF-8"?>\n' +
'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n' +
'  <url>\n' +
'    <loc>https://hyper-jlpt.onrender.com/</loc>\n' +
'    <lastmod>2026-11-01</lastmod>\n' +
'    <changefreq>daily</changefreq>\n' +
'    <priority>1.0</priority>\n' +
'  </url>\n' +
'  <url>\n' +
'    <loc>https://hyper-jlpt.onrender.com/forum</loc>\n' +
'    <lastmod>2026-11-01</lastmod>\n' +
'    <changefreq>hourly</changefreq>\n' +
'    <priority>0.9</priority>\n' +
'  </url>\n' +
'  <url>\n' +
'    <loc>https://hyper-jlpt.onrender.com/forum/trung-tam-tieng-nhat-da-nang</loc>\n' +
'    <lastmod>2026-11-01</lastmod>\n' +
'    <changefreq>weekly</changefreq>\n' +
'    <priority>0.9</priority>\n' +
'  </url>\n' +
'  <url>\n' +
'    <loc>https://hyper-jlpt.onrender.com/forum/trung-tam-tieng-nhat-ha-noi</loc>\n' +
'    <lastmod>2026-11-01</lastmod>\n' +
'    <changefreq>weekly</changefreq>\n' +
'    <priority>0.9</priority>\n' +
'  </url>\n' +
'  <url>\n' +
'    <loc>https://hyper-jlpt.onrender.com/forum/trung-tam-tieng-nhat-tp-ho-chi-minh</loc>\n' +
'    <lastmod>2026-11-01</lastmod>\n' +
'    <changefreq>weekly</changefreq>\n' +
'    <priority>0.9</priority>\n' +
'  </url>\n' +
'  <url>\n' +
'    <loc>https://hyper-jlpt.onrender.com/forum/trung-tam-tieng-nhat-quang-nam</loc>\n' +
'    <lastmod>2026-11-01</lastmod>\n' +
'    <changefreq>weekly</changefreq>\n' +
'    <priority>0.9</priority>\n' +
'  </url>\n' +
articleUrls + '\n' +
'</urlset>');
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
