const Chapter = require('../models/Chapter');

exports.createChapter = async (req, res) => {
  try {
    const exists = await Chapter.findOne({ bookId: req.body.bookId, chapterNumber: req.body.chapterNumber });
    if (exists) return res.status(400).json({ error: `Chapter ${req.body.chapterNumber} already exists` });
    const chapter = new Chapter(req.body);
    await chapter.save();
    res.status(201).json({ message: 'Chapter added ✅', chapter });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getChaptersByBook = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const chapters = await Chapter.find({ bookId: req.params.bookId }).sort({ chapterNumber: 1 }).skip((page - 1) * limit).limit(parseInt(limit));
    const total = await Chapter.countDocuments({ bookId: req.params.bookId });
    res.json({ total, chapters });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getChapterById = async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id);
    if (!chapter) return res.status(404).json({ error: 'Chapter not found' });
    res.json(chapter);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateChapter = async (req, res) => {
  try {
    const chapter = await Chapter.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: 'Chapter updated ✅', chapter });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteChapter = async (req, res) => {
  try {
    await Chapter.findByIdAndDelete(req.params.id);
    res.json({ message: 'Chapter deleted ✅' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};