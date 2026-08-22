const Book = require('../models/Book');
const Chapter = require('../models/Chapter');

exports.getAllBooks = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 10 } = req.query;
    let query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) query.category = category;

    const books = await Book.find(query)
     .sort({ createdAt: -1 })
     .skip((page - 1) * limit)
     .limit(parseInt(limit));

    const total = await Book.countDocuments(query);
    res.json({ total, page: parseInt(page), books });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createBook = async (req, res) => {
  try {
    const book = new Book(req.body);
    await book.save();
    res.status(201).json({ message: 'Book created ✅', book });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    const chapters = await Chapter.find({ bookId: req.params.id }).sort({ chapterNumber: 1 });
    res.json({ book, chapters });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!book) return res.status(404).json({ error: 'Book not found' });
    res.json({ message: 'Book updated ✅', book });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    await Chapter.deleteMany({ bookId: req.params.id });
    res.json({ message: 'Book and its chapters deleted ✅' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};