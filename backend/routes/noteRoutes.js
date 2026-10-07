const express = require('express');
const router = express.Router();
const { getNotes, saveNote, deleteNote } = require('../controllers/noteController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, getNotes);
router.post('/', authMiddleware, saveNote);
router.delete('/:id', authMiddleware, deleteNote);

module.exports = router;
