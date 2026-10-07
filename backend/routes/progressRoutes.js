const express = require('express');
const router = express.Router();
const { getProgress, updateVocabularyProgress } = require('../controllers/progressController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, getProgress);
router.post('/update', authMiddleware, updateVocabularyProgress);

module.exports = router;
