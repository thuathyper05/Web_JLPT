const express = require('express');
const router = express.Router();
const { getVocabularies, getVocabularyById, searchVocabulary } = require('../controllers/vocabController');
const { optionalAuth } = require('../middleware/auth');

router.get('/search', searchVocabulary);
router.get('/', optionalAuth, getVocabularies);
router.get('/:id', optionalAuth, getVocabularyById);

module.exports = router;
