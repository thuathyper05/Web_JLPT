const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { adminMiddleware } = require('../middleware/auth');

// Public admin authentication endpoint
router.post('/login', adminController.adminLogin);

// Protected Admin Routes
router.use(adminMiddleware);

// Profile & Stats
router.get('/me', adminController.getAdminMe);
router.get('/stats', adminController.getSystemStats);

// Vocabularies Management
router.get('/vocabularies', adminController.getVocabularies);
router.post('/vocabularies', adminController.createVocabulary);
router.put('/vocabularies/:id', adminController.updateVocabulary);
router.delete('/vocabularies/:id', adminController.deleteVocabulary);

// Lessons Management
router.get('/lessons', adminController.getLessons);
router.put('/lessons/:id', adminController.updateLesson);

// Kanji Management
router.get('/kanji', adminController.getKanji);
router.post('/kanji', adminController.createKanji);
router.put('/kanji/:id', adminController.updateKanji);
router.delete('/kanji/:id', adminController.deleteKanji);

// Users Management
router.get('/users', adminController.getUsers);
router.put('/users/:id/role', adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);

// Maintenance & Duplication Cleanup
router.post('/clean-duplicates', adminController.triggerDeduplication);

module.exports = router;
