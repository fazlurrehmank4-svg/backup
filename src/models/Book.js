const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: String,
  startPage: { type: Number, required: true },
  endPage: { type: Number, required: true },
});

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  titleArabic: String,
  author: { type: String, required: true },
  description: String,
  coverUrl: String,
  pdfUrl: { type: String, required: true }, // Filebase URL
  filebaseKey: String,
  totalPages: Number,
  chapters: [chapterSchema],
  category: { type: String, default: "Islamic" }
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);
