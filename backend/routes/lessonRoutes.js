const express = require('express');
const router = express.Router();
const { getLessons, getLessonById } = require('../controllers/lessonController');
const { getVocabularies } = require('../controllers/vocabController');
const { optionalAuth } = require('../middleware/auth');

router.get('/', getLessons);
router.get('/:id', getLessonById);
router.get('/:id/vocabulary', optionalAuth, (req, res, next) => {
  req.query.lesson = req.params.id;
  getVocabularies(req, res, next);
});

module.exports = router;
