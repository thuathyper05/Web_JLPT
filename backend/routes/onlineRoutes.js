const express = require('express');
const router = express.Router();

// Real-time active clients tracking (In-memory storage)
// Key: clientId (string) : Value: timestamp of last ping (ms)
const activeClients = new Map();
const CLIENT_TIMEOUT_MS = 45000; // 45 seconds timeout window

// Helper to remove expired clients
const cleanupExpiredClients = () => {
  const now = Date.now();
  for (const [clientId, lastSeen] of activeClients.entries()) {
    if (now - lastSeen > CLIENT_TIMEOUT_MS) {
      activeClients.delete(clientId);
    }
  }
};

// Periodic auto-cleanup every 30 seconds
setInterval(cleanupExpiredClients, 30000);

/**
 * POST /api/online/ping
 * Heartbeat ping from an active browser session
 */
router.post('/ping', (req, res) => {
  const clientId = req.body?.clientId || req.headers['x-client-id'] || req.ip || 'anonymous';
  const now = Date.now();

  activeClients.set(String(clientId), now);
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
 * Retrieve current count of online users
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
 * POST /api/online/leave
 * Explicit departure notification on tab/window close
 */
router.post('/leave', (req, res) => {
  const clientId = req.body?.clientId || req.headers['x-client-id'];
  if (clientId && activeClients.has(String(clientId))) {
    activeClients.delete(String(clientId));
  }
  cleanupExpiredClients();
  const count = Math.max(1, activeClients.size);
  res.json({
    success: true,
    onlineCount: count
  });
});

module.exports = router;
