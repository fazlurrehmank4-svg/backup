const express = require('express');
const router = express.Router();
const chapterController = require('../controllers/chapterController');
const { protect } = require('../middleware/auth');

router.post('/', protect, chapterController.createChapter);
router.get('/book/:bookId', chapterController.getChaptersByBook);
router.get('/:id', chapterController.getChapterById);
router.put('/:id', protect, chapterController.updateChapter);
router.delete('/:id', protect, chapterController.deleteChapter);

module.exports = router;