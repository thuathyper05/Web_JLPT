const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const lessonRoutes = require('./routes/lessonRoutes');
const vocabRoutes = require('./routes/vocabRoutes');
const quizRoutes = require('./routes/quizRoutes');
const progressRoutes = require('./routes/progressRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const noteRoutes = require('./routes/noteRoutes');
const kanjiRoutes = require('./routes/kanjiRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/vocabulary', vocabRoutes);
app.use('/api/kanji', kanjiRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/notes', noteRoutes);

// Health check endpoints (for Render & Uptime Monitors)
app.get(['/', '/health', '/api/health'], (req, res) => {
  res.json({
    status: 'ok',
    service: 'HYPER JAPAN JLPT API',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`JLPT N5 Backend Server is running on port ${PORT}`);

  // ── Render Free Tier Keep-Alive Service ──
  // Pings itself every 14 minutes to prevent Render from going to sleep after 15m of inactivity
  const keepAliveUrl = process.env.RENDER_EXTERNAL_URL || process.env.KEEP_AWAKE_URL;
  if (keepAliveUrl) {
    const INTERVAL_MS = 14 * 60 * 1000; // 14 minutes
    console.log(`[Keep-Alive] Activated for ${keepAliveUrl} (Every 14m)`);

    setInterval(async () => {
      try {
        const pingUrl = `${keepAliveUrl.replace(/\/$/, '')}/api/health`;
        const resp = await fetch(pingUrl);
        if (resp.ok) {
          console.log(`[Keep-Alive Ping] Successful at ${new Date().toLocaleTimeString('vi-VN')}`);
        }
      } catch (err) {
        console.warn(`[Keep-Alive Ping Warning] ${err.message}`);
      }
    }, INTERVAL_MS);
  }
});
