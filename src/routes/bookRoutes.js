const express = require('express');
const router = express.Router();
const Book = require('../models/Book');

// =========== GET ALL BOOKS - USER APP USES THIS ===========
router.get('/', async (req, res) => {
  try {
    console.log("📚 GET /api/books - Fetching from MongoDB");
    const books = await Book.find().sort({ createdAt: -1 });
    console.log(`✅ Found ${books.length} books in MongoDB`);
    res.json(books); // Must be array for user app
  } catch (e) {
    console.error("❌ GET books error:", e);
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

// =========== ADD BOOK - ONE PDF + MANY CHAPTERS ===========
router.post('/', async (req, res) => {
  try {
    console.log("📥 POST /api/books - Body:", JSON.stringify(req.body).substring(0, 500));

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

    if (!title ||!author) {
      return res.status(400).json({ error: "title and author required" });
    }
    if (!pdfUrl) {
      console.log("❌ pdfUrl missing! Did you call /api/upload first?");
      return res.status(400).json({ error: "pdfUrl required! Upload PDF to /api/upload first" });
    }

    // Validate chapters
    if (chapters && chapters.length > 0) {
      for (let ch of chapters) {
        if (!ch.title || ch.startPage == null || ch.endPage == null) {
          return res.status(400).json({ error: `Chapter ${ch.title || 'unknown'}: needs title, startPage, endPage` });
        }
        if (ch.startPage > ch.endPage) {
          return res.status(400).json({ error: `Chapter ${ch.title}: startPage > endPage` });
        }
      }
    }

    const newBook = new Book({
      title: title.trim(),
      titleArabic: titleArabic || "",
      author: author.trim(),
      description: description || "",
      coverUrl: coverUrl || "",
      pdfUrl, // ONE PDF from Filebase
      filebaseKey: filebaseKey || "",
      totalPages: totalPages || 0,
      chapters: chapters || [],
      category: category || "Islamic"
    });

    const savedBook = await newBook.save();

    console.log(`✅ Book SAVED to MongoDB: ${savedBook._id} - ${savedBook.title}`);

    // IMPORTANT: Return direct book for Flutter compatibility
    res.status(201).json(savedBook);

  } catch (e) {
    console.error("❌ POST /api/books error:", e);
    // If MongoDB not connected, you will see error here!
    if (e.message.includes('buffering timed out') || e.message.includes('not connected')) {
      return res.status(500).json({ error: "MongoDB not connected! Check MONGODB_URI env" });
    }
    res.status(500).json({ error: e.message });
  }
});

// =========== UPDATE BOOK CHAPTERS ===========
router.put('/:id', async (req, res) => {
  try {
    const updated = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
