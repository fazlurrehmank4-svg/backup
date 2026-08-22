const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema({
  title: { type: String, required: true },
  titleArabic: { type: String },
  startPage: { type: Number, required: true },
  endPage: { type: Number, required: true },
  description: { type: String }
});

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  titleArabic: { type: String },
  author: { type: String, required: true },
  description: { type: String },
  coverUrl: { type: String },
  pdfUrl: { type: String, required: true }, // ONE PDF ONLY
  filebaseKey: { type: String }, // filebase file name
  totalPages: { type: Number },
  category: { type: String, default: "Islamic" },
  chapters: [chapterSchema], // Chapters are just page ranges!
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Book', bookSchema);
