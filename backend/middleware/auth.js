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

module.exports = { authMiddleware, optionalAuth };
