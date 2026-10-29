const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const db = require('../config/db');

// Load fallback local curriculum
let localGrammarFallback = [];
try {
  const jsonPath = path.join(__dirname, '../data/n5_grammar_data.json');
  if (fs.existsSync(jsonPath)) {
    localGrammarFallback = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  }
} catch (e) {
  console.warn('[Grammar Route] Failed to load local grammar fallback:', e.message);
}

// GET /api/grammar - List grammar points, optionally filtered by lesson or level
router.get('/', async (req, res) => {
  try {
    const { lesson, level = 'N5' } = req.query;

    let queryText = 'SELECT * FROM grammar_points WHERE level = $1';
    const params = [level.toUpperCase()];

    if (lesson) {
      queryText += ' AND lesson_number = $2 ORDER BY order_num ASC';
      params.push(parseInt(lesson));
    } else {
      queryText += ' ORDER BY lesson_number ASC, order_num ASC';
    }

    try {
      const result = await db.query(queryText, params);
      if (result.rows.length > 0) {
        return res.json({ success: true, count: result.rows.length, data: result.rows });
      }
    } catch (dbErr) {
      console.warn('[Grammar DB Error - Using Fallback]', dbErr.message);
    }

    // Fallback to local JSON if DB is empty or table pending
    let filtered = localGrammarFallback;
    if (lesson) {
      filtered = filtered.filter(g => g.lesson_number === parseInt(lesson));
    }
    return res.json({ success: true, count: filtered.length, data: filtered, is_fallback: true });
  } catch (err) {
    console.error('Error fetching grammar:', err);
    res.status(500).json({ success: false, message: 'Server error fetching grammar points' });
  }
});

// GET /api/grammar/lesson/:lessonNumber
router.get('/lesson/:lessonNumber', async (req, res) => {
  try {
    const lessonNum = parseInt(req.params.lessonNumber);
    try {
      const result = await db.query(
        'SELECT * FROM grammar_points WHERE lesson_number = $1 ORDER BY order_num ASC',
        [lessonNum]
      );
      if (result.rows.length > 0) {
        return res.json({ success: true, count: result.rows.length, data: result.rows });
      }
    } catch (dbErr) {
      console.warn('[Grammar DB Error - Using Fallback]', dbErr.message);
    }

    const filtered = localGrammarFallback.filter(g => g.lesson_number === lessonNum);
    return res.json({ success: true, count: filtered.length, data: filtered, is_fallback: true });
  } catch (err) {
    console.error('Error fetching lesson grammar:', err);
    res.status(500).json({ success: false, message: 'Server error fetching lesson grammar' });
  }
});

module.exports = router;
