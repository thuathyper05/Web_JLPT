const express = require('express');
const router = express.Router();
const { getGarden, getDue, recordReview, addToGarden, addLessonToGarden, getStats } = require('../controllers/srsController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/garden', getGarden);
router.get('/due', getDue);
router.get('/stats', getStats);
router.post('/review', recordReview);
router.post('/add', addToGarden);
router.post('/add-lesson', addLessonToGarden);

module.exports = router;
