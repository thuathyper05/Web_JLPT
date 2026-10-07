const express = require('express');
const router = express.Router();
const { getFavorites, toggleFavorite } = require('../controllers/favoriteController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, getFavorites);
router.post('/toggle', authMiddleware, toggleFavorite);

module.exports = router;
