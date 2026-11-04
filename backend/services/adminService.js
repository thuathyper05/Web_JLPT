const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'hyper_nihongohub_secret_2026';
const ADMIN_EMAIL = 'thuathyperig05@gmail.com';
const ADMIN_PASS = 'Thuatnguyen1204@@@';

/**
 * Parses user agent string into device type, OS, and browser
 */
function parseUserAgent(ua = '') {
  let deviceType = 'Desktop';
  let osName = 'Windows';
  let browserName = 'Chrome';

  // Device & OS detection
  if (/iPhone/i.test(ua)) {
    deviceType = 'Mobile';
    osName = 'iOS';
    const match = ua.match(/OS (\d+[_\.]\d+)/i);
    if (match) osName += ' ' + match[1].replace('_', '.');
  } else if (/iPad/i.test(ua)) {
    deviceType = 'Tablet';
    osName = 'iPadOS';
  } else if (/Android/i.test(ua)) {
    deviceType = /Tablet/i.test(ua) ? 'Tablet' : 'Mobile';
    osName = 'Android';
    const match = ua.match(/Android (\d+(\.\d+)?)/i);
    if (match) osName += ' ' + match[1];
  } else if (/Macintosh|Mac OS X/i.test(ua)) {
    deviceType = 'Desktop / Mac';
    osName = 'macOS';
  } else if (/Windows NT/i.test(ua)) {
    deviceType = 'Laptop / PC';
    osName = 'Windows';
    if (ua.includes('Windows NT 10.0')) osName = 'Windows 10/11';
  } else if (/Linux/i.test(ua)) {
    deviceType = 'Desktop / Linux';
    osName = 'Linux';
  }

  // Browser detection
  if (/Zalo/i.test(ua)) {
    browserName = 'Zalo App';
  } else if (/FBAN|FBAV/i.test(ua)) {
    browserName = 'Facebook App';
  } else if (/Edg\//i.test(ua)) {
    browserName = 'Microsoft Edge';
  } else if (/Chrome\//i.test(ua) && !/Chromium|Edg/i.test(ua)) {
    browserName = 'Google Chrome';
  } else if (/Safari\//i.test(ua) && !/Chrome|Chromium/i.test(ua)) {
    browserName = 'Apple Safari';
  } else if (/Firefox\//i.test(ua)) {
    browserName = 'Mozilla Firefox';
  }

  return { deviceType, osName, browserName };
}

/**
 * Universal Activity Logging Engine
 * Records user agent, IP address, exact time, device, action, and meta parameters
 */
async function logActivity(req, action, details = {}, userId = null, userEmail = null, userName = null) {
  try {
    const rawIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || req.ip || '127.0.0.1';
    const ip = rawIp.split(',')[0].trim();
    const ua = req.headers['user-agent'] || 'Unknown Device';
    const { deviceType, osName, browserName } = parseUserAgent(ua);

    const finalEmail = userEmail || req.user?.email || 'guest@webapp';
    const finalName = userName || req.user?.username || req.user?.name || 'Khách vãng lai';
    const finalUserId = userId || req.user?.id || null;

    if (db.pool && db.isDbConnected()) {
      await db.pool.query(
        `INSERT INTO user_activity_logs (user_id, user_email, user_name, action, device_type, os_name, browser_name, ip_address, user_agent, details, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())`,
        [finalUserId, finalEmail, finalName, action, deviceType, osName, browserName, ip, ua, JSON.stringify(details)]
      );

      // Update user table last device and IP if authenticated user
      if (finalUserId) {
        await db.pool.query(
          `UPDATE users SET last_login_at = NOW(), last_ip = $1, last_device = $2 WHERE id = $3`,
          [ip, `${deviceType} · ${osName} (${browserName})`, finalUserId]
        );
      }
    }
  } catch (err) {
    console.warn('[Activity Logger] Warning:', err.message);
  }
}

/**
 * Admin Middleware: Enforces Strict Authentication for Sole Admin Account
 */
function requireAdmin(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Yêu cầu token xác thực quyền quản trị.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err || !decoded) {
      return res.status(403).json({ success: false, message: 'Phiên làm việc quản trị đã hết hạn hoặc không hợp lệ.' });
    }
    if (decoded.email !== ADMIN_EMAIL || decoded.role !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Từ chối truy cập! Chỉ duy nhất Quản Trị Viên Tối Cao mới được phép thao tác.' });
    }
    req.admin = decoded;
    next();
  });
}

/**
 * Registers all Admin Routes to Express App
 */
function registerAdminRoutes(app) {
  // 1. Admin Authentication Login
  app.post('/api/admin/login', async (req, res) => {
    const { email, password } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();

    if (cleanEmail !== ADMIN_EMAIL.toLowerCase() || password !== ADMIN_PASS) {
      await logActivity(req, 'Đăng nhập Quản Trị thất bại', { attemptEmail: cleanEmail }, null, cleanEmail, 'Xâm nhập trái phép');
      return res.status(401).json({
        success: false,
        message: 'Tài khoản hoặc mật khẩu quản trị không chính xác.'
      });
    }

    const adminUser = {
      id: 32,
      email: ADMIN_EMAIL,
      username: 'Quản Trị Viên Tối Cao',
      role: 'superadmin',
      isAdmin: true
    };

    const adminToken = jwt.sign(adminUser, JWT_SECRET, { expiresIn: '7d' });
    await logActivity(req, 'Đăng nhập Quản Trị thành công', { role: 'superadmin' }, adminUser.id, adminUser.email, adminUser.username);

    return res.json({
      success: true,
      message: 'Xác thực Quản trị viên thành công! Chào mừng Quản Trị Viên Tối Cao.',
      token: adminToken,
      user: adminUser
    });
  });

  // 2. Admin Check Token / Profile
  app.get('/api/admin/me', requireAdmin, (req, res) => {
    res.json({
      success: true,
      user: req.admin
    });
  });

  // 3. System Statistics Overview
  app.get('/api/admin/stats', requireAdmin, async (req, res) => {
    try {
      let totalUsers = 0;
      let activeToday = 0;
      let totalVocabs = 9584;
      let totalKanji = 607;
      let totalGrammar = 276;
      let totalLessons = 130;
      let totalFeedbacks = 0;
      let pendingFeedbacks = 0;
      let totalActivities = 0;

      if (db.pool && db.isDbConnected()) {
        const uRes = await db.pool.query('SELECT COUNT(*)::int as count FROM users');
        totalUsers = uRes.rows[0].count;

        const aRes = await db.pool.query(
          "SELECT COUNT(DISTINCT user_email)::int as count FROM user_activity_logs WHERE created_at >= CURRENT_DATE"
        );
        activeToday = aRes.rows[0].count;

        const fRes = await db.pool.query(`
          SELECT 
            COUNT(*)::int as total,
            COUNT(*) FILTER (WHERE status = 'pending')::int as pending
          FROM support_feedbacks
        `);
        totalFeedbacks = fRes.rows[0].total;
        pendingFeedbacks = fRes.rows[0].pending;

        const actRes = await db.pool.query('SELECT COUNT(*)::int as count FROM user_activity_logs');
        totalActivities = actRes.rows[0].count;
      }

      res.json({
        success: true,
        stats: {
          totalUsers,
          activeToday,
          totalVocabs,
          totalKanji,
          totalGrammar,
          totalLessons,
          totalFeedbacks,
          pendingFeedbacks,
          totalActivities,
          serverVersion: '1.2',
          dbMode: 'PostgreSQL Cloud Production',
          uptimeHours: Math.floor(process.uptime() / 3600),
          memoryUsageMb: Math.round(process.memoryUsage().rss / 1024 / 1024)
        }
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // 4. User Accounts Management (List with activity & status)
  app.get('/api/admin/users', requireAdmin, async (req, res) => {
    try {
      const q = (req.query.q || '').trim().toLowerCase();
      let queryText = `
        SELECT 
          u.id, u.username, u.email, u.role, u.auth_provider, u.avatar_url, 
          COALESCE(u.status, 'active') as status,
          u.last_login_at, u.last_ip, u.last_device, u.created_at,
          COALESCE(g.total_xp, 0) as total_xp,
          COALESCE(g.current_streak, 0) as current_streak,
          COALESCE(g.level_tier, 'Tân Thủ N5') as level_tier
        FROM users u
        LEFT JOIN user_gamification g ON u.id = g.user_id
        WHERE 1=1
      `;
      const params = [];

      if (q) {
        params.push(`%${q}%`);
        queryText += ` AND (LOWER(u.username) LIKE $${params.length} OR LOWER(u.email) LIKE $${params.length})`;
      }

      queryText += ' ORDER BY u.id DESC LIMIT 100';

      const result = await db.pool.query(queryText, params);
      res.json({
        success: true,
        users: result.rows
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // 5. Ban / Unban User Account
  app.post('/api/admin/users/:id/ban', requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id, 10);
      const userRes = await db.pool.query('SELECT id, email, status FROM users WHERE id = $1', [userId]);
      if (userRes.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng này.' });
      }

      const target = userRes.rows[0];
      if (target.email === ADMIN_EMAIL) {
        return res.status(400).json({ success: false, message: 'Không thể khóa tài khoản Quản Trị Viên Tối Cao.' });
      }

      const newStatus = target.status === 'banned' ? 'active' : 'banned';
      await db.pool.query('UPDATE users SET status = $1 WHERE id = $2', [newStatus, userId]);

      await logActivity(req, newStatus === 'banned' ? 'Khóa tài khoản khách hàng' : 'Mở khóa tài khoản khách hàng', { targetUserId: userId, targetEmail: target.email });

      res.json({
        success: true,
        message: newStatus === 'banned' ? 'Đã khóa tài khoản người dùng thành công.' : 'Đã mở khóa tài khoản thành công.',
        status: newStatus
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // 6. Delete Test/Spam User Account
  app.delete('/api/admin/users/:id', requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id, 10);
      const userRes = await db.pool.query('SELECT id, email FROM users WHERE id = $1', [userId]);
      if (userRes.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Người dùng không tồn tại.' });
      }

      const target = userRes.rows[0];
      if (target.email === ADMIN_EMAIL) {
        return res.status(400).json({ success: false, message: 'Không được phép xóa tài khoản Admin.' });
      }

      await db.pool.query('DELETE FROM user_progress WHERE user_id = $1', [userId]);
      await db.pool.query('DELETE FROM user_gamification WHERE user_id = $1', [userId]);
      await db.pool.query('DELETE FROM users WHERE id = $1', [userId]);

      await logActivity(req, 'Xóa tài khoản người dùng', { deletedUserId: userId, deletedEmail: target.email });

      res.json({
        success: true,
        message: 'Đã xóa tài khoản học viên khỏi cơ sở dữ liệu.'
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // 7. Activity Logs with Device & IP Details
  app.get('/api/admin/activity-logs', requireAdmin, async (req, res) => {
    try {
      const { q, action, limit = 100 } = req.query;
      let queryText = 'SELECT * FROM user_activity_logs WHERE 1=1';
      const params = [];

      if (q) {
        params.push(`%${q.toLowerCase()}%`);
        queryText += ` AND (LOWER(user_email) LIKE $${params.length} OR LOWER(user_name) LIKE $${params.length} OR LOWER(ip_address) LIKE $${params.length} OR LOWER(device_type) LIKE $${params.length})`;
      }

      if (action && action !== 'all') {
        params.push(action);
        queryText += ` AND action = $${params.length}`;
      }

      params.push(Math.min(200, Math.max(1, parseInt(limit, 10) || 100)));
      queryText += ` ORDER BY created_at DESC LIMIT $${params.length}`;

      const result = await db.pool.query(queryText, params);
      res.json({
        success: true,
        logs: result.rows
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // 8. Support Feedbacks Management
  app.get('/api/admin/feedbacks', requireAdmin, async (req, res) => {
    try {
      const result = await db.pool.query(`
        SELECT 
          id, 
          COALESCE(user_name, name, 'Ẩn danh') as name, 
          COALESCE(user_email, email, 'Chưa có email') as email, 
          phone, category, message, 
          COALESCE(status, 'pending') as status,
          admin_reply,
          created_at
        FROM support_feedbacks
        ORDER BY created_at DESC
        LIMIT 100
      `);

      res.json({
        success: true,
        feedbacks: result.rows
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // 9. Update Support Feedback Status & Admin Reply
  app.put('/api/admin/feedbacks/:id/status', requireAdmin, async (req, res) => {
    try {
      const feedbackId = parseInt(req.params.id, 10);
      const { status, reply } = req.body;

      await db.pool.query(
        'UPDATE support_feedbacks SET status = $1, admin_reply = $2 WHERE id = $3',
        [status || 'resolved', reply || null, feedbackId]
      );

      await logActivity(req, 'Xử lý phản hồi hỗ trợ khách hàng', { feedbackId, status });

      res.json({
        success: true,
        message: 'Đã cập nhật trạng thái xử lý phản hồi thành công.'
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // 10. Broadcast System Notifications (Admin Create / List / Delete)
  app.get('/api/admin/notifications', requireAdmin, async (req, res) => {
    try {
      const result = await db.pool.query('SELECT * FROM system_notifications ORDER BY created_at DESC');
      res.json({
        success: true,
        notifications: result.rows
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.post('/api/admin/notifications', requireAdmin, async (req, res) => {
    try {
      const { title, content, type = 'info', target_level = 'all' } = req.body;
      if (!title || !content) {
        return res.status(400).json({ success: false, message: 'Tiêu đề và nội dung thông báo không được để trống.' });
      }

      const insertRes = await db.pool.query(
        `INSERT INTO system_notifications (title, content, type, target_level, author, is_active, created_at)
         VALUES ($1, $2, $3, $4, 'Quản Trị Viên Tối Cao', true, NOW()) RETURNING *`,
        [title.trim(), content.trim(), type, target_level]
      );

      await logActivity(req, 'Phát thông báo toàn hệ thống', { title, type, target_level });

      res.json({
        success: true,
        message: 'Đã phát thông báo mới đến toàn thể học viên!',
        notification: insertRes.rows[0]
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.delete('/api/admin/notifications/:id', requireAdmin, async (req, res) => {
    try {
      const notifId = parseInt(req.params.id, 10);
      await db.pool.query('DELETE FROM system_notifications WHERE id = $1', [notifId]);
      await logActivity(req, 'Xóa thông báo hệ thống', { notifId });

      res.json({
        success: true,
        message: 'Đã gỡ bỏ thông báo.'
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Public endpoint for normal WebApp clients to get active notifications from Admin
  app.get('/api/notifications/system', async (req, res) => {
    try {
      if (db.pool && db.isDbConnected()) {
        const result = await db.pool.query(
          'SELECT id, title, content, type, target_level, created_at FROM system_notifications WHERE is_active = true ORDER BY created_at DESC LIMIT 10'
        );
        return res.json({ success: true, notifications: result.rows });
      }
      res.json({ success: true, notifications: [] });
    } catch (err) {
      res.json({ success: true, notifications: [] });
    }
  });
}

module.exports = {
  logActivity,
  registerAdminRoutes,
  parseUserAgent
};
