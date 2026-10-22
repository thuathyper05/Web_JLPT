const express = require('express');
const router = express.Router();

// Real-time active clients tracking (In-memory storage)
// Key: connectionKey (user_X__dev_Y or guest_IP__dev_Z)
// Value: { userId, devId, lastSeen: timestamp (ms) }
const activeClients = new Map();
const CLIENT_TIMEOUT_MS = 25000; // 25 seconds timeout window

const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.headers['x-real-ip'] || req.socket?.remoteAddress || req.ip || 'anonymous';
};

// Calculate total online according to business rule:
// 1 logged in account = 1 online user (even across multiple devices / IPs)
// 1 guest device / IP = 1 online user
const calculateTotalOnline = () => {
  const now = Date.now();
  const users = new Set();
  const guests = new Set();

  for (const [key, client] of activeClients.entries()) {
    if (now - client.lastSeen > CLIENT_TIMEOUT_MS) {
      activeClients.delete(key);
    } else {
      if (client.userId) {
        users.add(String(client.userId));
      } else {
        guests.add(String(client.devId || key));
      }
    }
  }

  return Math.max(1, users.size + guests.size);
};

// Helper to remove expired clients
const cleanupExpiredClients = () => {
  calculateTotalOnline();
};

// Periodic auto-cleanup every 10 seconds
setInterval(cleanupExpiredClients, 10000);

/**
 * POST /api/online/ping
 * Heartbeat ping from an active user or guest
 */
router.post('/ping', (req, res) => {
  const ip = getClientIp(req);
  const userId = req.body?.userId || req.query?.userId || null;
  const devId = req.body?.clientId || req.query?.clientId || req.headers['x-client-id'] || 'device';
  const now = Date.now();

  const connectionKey = userId ? `user_${userId}__${devId}` : `guest_${ip}__${devId}`;

  activeClients.set(connectionKey, {
    userId: userId ? String(userId) : null,
    devId: `${ip}::${devId}`,
    lastSeen: now
  });

  const count = calculateTotalOnline();
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
  const count = calculateTotalOnline();
  res.json({
    onlineCount: count,
    timestamp: Date.now()
  });
});

/**
 * ALL /api/online/leave
 * Explicit departure notification on tab/window close
 */
router.all('/leave', (req, res) => {
  const ip = getClientIp(req);
  const userId = req.body?.userId || req.query?.userId || null;
  const devId = req.body?.clientId || req.query?.clientId || req.headers['x-client-id'] || 'device';

  const connectionKey = userId ? `user_${userId}__${devId}` : `guest_${ip}__${devId}`;

  if (activeClients.has(connectionKey)) {
    activeClients.delete(connectionKey);
  }

  const count = calculateTotalOnline();
  res.json({
    success: true,
    onlineCount: count
  });
});

module.exports = router;
