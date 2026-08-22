const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
// If your Book model path is different, change line above to:
// const Book = require('../models/bookModel');

// =========== GET ALL BOOKS ===========
router.get('/', async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.json(books);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// =========== GET ONE BOOK WITH CHAPTERS ===========
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ error: "Book not found" });
    res.json(book);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// =========== ADD BOOK - ONE PDF + MANY CHAPTERS (Page Numbers) ===========
/*
  Expected Body:
  {
    "title": "Sahih Al-Bukhari",
    "author": "Imam Bukhari",
    "pdfUrl": "https://almaas-books.s3.filebase.com/xyz.pdf",
    "coverUrl": "https://...",
    "totalPages": 800,
    "chapters": [
      { "title": "Kitab Al-Wahy", "startPage": 1, "endPage": 20 },
      { "title": "Kitab Al-Iman", "startPage": 21, "endPage": 55 }
    ]
  }
*/
router.post('/', async (req, res) => {
  try {
    const { 
      title, 
      titleArabic, 
      author, 
      description, 
      coverUrl, 
      pdfUrl, 
      filebaseKey, 
      totalPages, 
      chapters, 
      category 
    } = req.body;

    if (!title || !author) {
      return res.status(400).json({ error: "title and author required" });
    }
    if (!pdfUrl) {
      return res.status(400).json({ error: "pdfUrl required! Upload PDF to /api/upload first" });
    }

    // Validate chapters page numbers
    if (chapters && chapters.length > 0) {
      for (let ch of chapters) {
        if (!ch.title || !ch.startPage || !ch.endPage) {
          return res.status(400).json({ error: "Each chapter needs title, startPage, endPage" });
        }
        if (ch.startPage > ch.endPage) {
          return res.status(400).json({ error: `Chapter ${ch.title}: startPage cannot be > endPage` });
        }
      }
    }

    const newBook = new Book({
      title,
      titleArabic,
      author,
      description,
      coverUrl,
      pdfUrl,          // ONE PDF ONLY
      filebaseKey,
      totalPages,
      chapters: chapters || [], // Just page ranges!
      category: category || "Islamic"
    });

    const savedBook = await newBook.save();
    
    res.status(201).json({ 
      message: "Book created successfully ✅ Option 1",
      book: savedBook 
    });

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// =========== UPDATE BOOK CHAPTERS ===========
router.put('/:id', async (req, res) => {
  try {
    const updated = await Book.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    );
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// =========== DELETE BOOK ===========
router.delete('/:id', async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: "Book deleted" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
