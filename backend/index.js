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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'JLPT N5 Vocabulary API', time: new Date() });
});

// Start Server
app.listen(PORT, () => {
  console.log(`JLPT N5 Backend Server is running on http://localhost:${PORT}`);
});
