const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../config/db');

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự' });
    }

    // Check existing
    const existing = await db.query('SELECT id FROM users WHERE username = $1 OR email = $2', [username.trim(), email.trim().toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Tên người dùng hoặc email này đã tồn tại' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await db.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
      [username.trim(), email.trim().toLowerCase(), passwordHash]
    );

    const user = result.rows[0];
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET || 'super_secret_jlpt_n5_key_2026',
      { expiresIn: '30d' }
    );

    res.status(201).json({
      message: 'Đăng ký tài khoản HYPER JLPT thành công!',
      user,
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi đăng ký tài khoản' });
  }
};

const login = async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;
    if (!usernameOrEmail || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập tên tài khoản/email và mật khẩu' });
    }

    const input = usernameOrEmail.trim().toLowerCase();
    const result = await db.query(
      'SELECT * FROM users WHERE LOWER(username) = $1 OR LOWER(email) = $1',
      [input]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Tài khoản hoặc email không tồn tại trong hệ thống' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mật khẩu không chính xác, vui lòng thử lại' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET || 'super_secret_jlpt_n5_key_2026',
      { expiresIn: '30d' }
    );

    res.json({
      message: 'Đăng nhập thành công!',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        created_at: user.created_at
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Lỗi server khi đăng nhập' });
  }
};

const getMe = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, username, email, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('getMe error:', error);
    res.status(500).json({ message: 'Lỗi khi lấy thông tin người dùng' });
  }
};

// Forgot Password Request (Generate recovery code / token)
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Vui lòng cung cấp email tài khoản của bạn' });
    }

    const userRes = await db.query('SELECT id, username, email FROM users WHERE LOWER(email) = $1', [email.trim().toLowerCase()]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản nào gắn với email này' });
    }

    const user = userRes.rows[0];
    // Generate 6-digit numeric OTP recovery code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await db.query(
      'UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3',
      [resetCode, expiry, user.id]
    );

    res.json({
      message: 'Mã xác thực đặt lại mật khẩu đã được tạo thành công!',
      recovery_code: resetCode, // Direct code return for immediate instant usability
      expires_in: '15 phút'
    });
  } catch (error) {
    console.error('forgotPassword error:', error);
    res.status(500).json({ message: 'Lỗi xử lý yêu cầu quên mật khẩu' });
  }
};

// Reset Password with recovery code
const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ email, mã xác thực và mật khẩu mới' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu mới phải có tối thiểu 6 ký tự' });
    }

    const result = await db.query(
      'SELECT id, reset_token, reset_token_expiry FROM users WHERE LOWER(email) = $1',
      [email.trim().toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Email không tồn tại trong hệ thống' });
    }

    const user = result.rows[0];
    if (!user.reset_token || user.reset_token !== code.trim()) {
      return res.status(400).json({ message: 'Mã xác thực không chính xác' });
    }

    if (new Date() > new Date(user.reset_token_expiry)) {
      return res.status(400).json({ message: 'Mã xác thực đã hết hạn (chỉ có hiệu lực trong 15 phút)' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await db.query(
      'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2',
      [passwordHash, user.id]
    );

    res.json({ message: 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay với mật khẩu mới.' });
  } catch (error) {
    console.error('resetPassword error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi đổi mật khẩu' });
  }
};

// Google Login / OAuth verification
const googleLogin = async (req, res) => {
  try {
    const { credential, accessToken, userInfo } = req.body;
    let email, name, sub, picture;

    // 1. If Google ID token (credential from GIS) is sent
    if (credential) {
      try {
        const resp = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
        if (resp.ok) {
          const payload = await resp.json();
          email = payload.email;
          name = payload.name;
          sub = payload.sub;
          picture = payload.picture;
        }
      } catch (err) {
        console.error('Error verifying Google token with Google endpoint:', err);
      }
    }

    // 2. If access token is provided
    if (!email && accessToken) {
      try {
        const resp = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (resp.ok) {
          const payload = await resp.json();
          email = payload.email;
          name = payload.name;
          sub = payload.sub;
          picture = payload.picture;
        }
      } catch (err) {
        console.error('Error fetching Google userinfo:', err);
      }
    }

    // 3. Fallback / direct profile from client
    if (!email && userInfo && userInfo.email) {
      email = userInfo.email;
      name = userInfo.name || userInfo.email.split('@')[0];
      sub = userInfo.sub || userInfo.id;
      picture = userInfo.picture;
    }

    if (!email) {
      return res.status(400).json({ message: 'Không thể xác thực thông tin tài khoản Google' });
    }

    const existing = await db.query(
      'SELECT * FROM users WHERE LOWER(email) = $1 OR (auth_provider = $2 AND provider_id = $3)',
      [email.trim().toLowerCase(), 'google', sub || '']
    );

    let user;
    if (existing.rows.length > 0) {
      user = existing.rows[0];
      await db.query(
        'UPDATE users SET auth_provider = COALESCE(auth_provider, $1), provider_id = COALESCE(provider_id, $2), avatar_url = COALESCE(avatar_url, $3) WHERE id = $4',
        ['google', sub, picture, user.id]
      );
    } else {
      const baseUsername = (name || email.split('@')[0]).replace(/[^a-zA-Z0-9_]/g, '') || 'user';
      let finalUsername = baseUsername;
      const countCheck = await db.query('SELECT COUNT(*) FROM users WHERE username = $1', [finalUsername]);
      if (parseInt(countCheck.rows[0].count) > 0) {
        finalUsername = `${baseUsername}_${Math.floor(1000 + Math.random() * 9000)}`;
      }

      const insertRes = await db.query(
        'INSERT INTO users (username, email, auth_provider, provider_id, avatar_url) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, avatar_url, created_at',
        [finalUsername, email.trim().toLowerCase(), 'google', sub, picture]
      );
      user = insertRes.rows[0];
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET || 'super_secret_jlpt_n5_key_2026',
      { expiresIn: '30d' }
    );

    res.json({
      message: 'Đăng nhập Google thành công!',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar_url: user.avatar_url || picture,
        created_at: user.created_at
      },
      token
    });
  } catch (error) {
    console.error('googleLogin error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi đăng nhập bằng Google' });
  }
};

// Facebook Login / OAuth verification
const facebookLogin = async (req, res) => {
  try {
    const { accessToken, userID, userInfo } = req.body;
    let email, name, id, picture;

    if (accessToken) {
      try {
        const resp = await fetch(`https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${accessToken}`);
        if (resp.ok) {
          const payload = await resp.json();
          id = payload.id;
          name = payload.name;
          email = payload.email;
          picture = payload.picture?.data?.url;
        }
      } catch (err) {
        console.error('Error verifying Facebook token:', err);
      }
    }

    if (!id && !email && userInfo) {
      id = userInfo.id || userID;
      name = userInfo.name;
      email = userInfo.email;
      picture = userInfo.picture;
    }

    if (!id && !email) {
      return res.status(400).json({ message: 'Không thể xác thực thông tin tài khoản Facebook' });
    }

    const finalEmail = (email || `${id}@facebook.user`).toLowerCase();

    const existing = await db.query(
      'SELECT * FROM users WHERE LOWER(email) = $1 OR (auth_provider = $2 AND provider_id = $3)',
      [finalEmail, 'facebook', id || '']
    );

    let user;
    if (existing.rows.length > 0) {
      user = existing.rows[0];
      await db.query(
        'UPDATE users SET auth_provider = COALESCE(auth_provider, $1), provider_id = COALESCE(provider_id, $2), avatar_url = COALESCE(avatar_url, $3) WHERE id = $4',
        ['facebook', id, picture, user.id]
      );
    } else {
      const baseUsername = (name || 'fb_user').replace(/[^a-zA-Z0-9_]/g, '') || 'fb_user';
      let finalUsername = baseUsername;
      const countCheck = await db.query('SELECT COUNT(*) FROM users WHERE username = $1', [finalUsername]);
      if (parseInt(countCheck.rows[0].count) > 0) {
        finalUsername = `${baseUsername}_${Math.floor(1000 + Math.random() * 9000)}`;
      }

      const insertRes = await db.query(
        'INSERT INTO users (username, email, auth_provider, provider_id, avatar_url) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, avatar_url, created_at',
        [finalUsername, finalEmail, 'facebook', id, picture]
      );
      user = insertRes.rows[0];
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET || 'super_secret_jlpt_n5_key_2026',
      { expiresIn: '30d' }
    );

    res.json({
      message: 'Đăng nhập Facebook thành công!',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar_url: user.avatar_url || picture,
        created_at: user.created_at
      },
      token
    });
  } catch (error) {
    console.error('facebookLogin error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi đăng nhập bằng Facebook' });
  }
};

module.exports = { register, login, getMe, forgotPassword, resetPassword, googleLogin, facebookLogin };
