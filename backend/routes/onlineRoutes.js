const express = require('express');
const router = express.Router();

// Real-time active physical machines and IP tracking (In-memory storage)
// Key: clientKey (ip::clientId) : Value: timestamp of last ping (ms)
const activeClients = new Map();
const CLIENT_TIMEOUT_MS = 25000; // 25 seconds timeout window

const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.headers['x-real-ip'] || req.socket?.remoteAddress || req.ip || 'anonymous';
};

const resolveClientKey = (req) => {
  const ip = getClientIp(req);
  const clientId = req.query?.clientId || req.body?.clientId || req.headers['x-client-id'] || 'machine';
  return `${ip}::${clientId}`;
};

// Helper to remove expired clients
const cleanupExpiredClients = () => {
  const now = Date.now();
  for (const [key, lastSeen] of activeClients.entries()) {
    if (now - lastSeen > CLIENT_TIMEOUT_MS) {
      activeClients.delete(key);
    }
  }
};

// Periodic auto-cleanup every 10 seconds
setInterval(cleanupExpiredClients, 10000);

/**
 * POST /api/online/ping
 * Heartbeat ping from an active physical machine / IP
 */
router.post('/ping', (req, res) => {
  const clientKey = resolveClientKey(req);
  const now = Date.now();

  activeClients.set(clientKey, now);
  cleanupExpiredClients();

  const count = Math.max(1, activeClients.size);
  res.json({
    success: true,
    onlineCount: count,
    timestamp: now
  });
});

/**
 * GET /api/online/count
 * Retrieve current count of online users across all IP addresses
 */
router.get('/count', (req, res) => {
  cleanupExpiredClients();
  const count = Math.max(1, activeClients.size);
  res.json({
    onlineCount: count,
    timestamp: Date.now()
  });
});

/**
 * ALL /api/online/leave
 * Explicit departure notification on tab/window close (supports sendBeacon, GET, and POST)
 */
router.all('/leave', (req, res) => {
  const clientKey = resolveClientKey(req);
  if (activeClients.has(clientKey)) {
    activeClients.delete(clientKey);
  }
  cleanupExpiredClients();
  const count = Math.max(1, activeClients.size);
  res.json({
    success: true,
    onlineCount: count
  });
});

module.exports = router;
