const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Không có token xác thực hoặc không hợp lệ' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jlpt_n5_key_2026');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token hết hạn hoặc không hợp lệ' });
  }
};

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jlpt_n5_key_2026');
      req.user = decoded;
    } catch (e) {
      // Ignore token failure for optional endpoints
    }
  }
  next();
};

const adminMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Vui lòng đăng nhập với quyền Quản trị viên' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jlpt_n5_key_2026');
    req.user = decoded;

    // Check role in token or database
    if (decoded.role === 'admin') {
      return next();
    }

    const db = require('../config/db');
    const userRes = await db.query('SELECT role FROM users WHERE id = $1', [decoded.id]);
    if (userRes.rows.length > 0 && userRes.rows[0].role === 'admin') {
      req.user.role = 'admin';
      return next();
    }

    return res.status(403).json({ message: 'Quyền truy cập bị từ chối: Yêu cầu quyền Quản trị viên (Admin)' });
  } catch (error) {
    return res.status(401).json({ message: 'Phiên đăng nhập quản trị viên đã hết hạn hoặc không hợp lệ' });
  }
};

module.exports = { authMiddleware, optionalAuth, adminMiddleware };
