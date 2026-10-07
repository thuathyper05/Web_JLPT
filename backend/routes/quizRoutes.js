const express = require('express');
const router = express.Router();
const { getQuiz, submitQuiz } = require('../controllers/quizController');
const { optionalAuth } = require('../middleware/auth');

router.get('/', getQuiz);
router.post('/submit', optionalAuth, submitQuiz);

module.exports = router;
