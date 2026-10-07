const express = require('express');
const router = express.Router();
const { getKanjiList, getKanjiById } = require('../controllers/kanjiController');

router.get('/', getKanjiList);
router.get('/:id', getKanjiById);

module.exports = router;
