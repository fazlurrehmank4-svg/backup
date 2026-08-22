const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  coverImage: {
    type: String
  },
  category: {
    type: String,
    enum: ['Quran', 'Hadith', 'Fiqh', 'Seerah', 'Dua', 'Other'],
    default: 'Other'
  },
  language: {
    type: String,
    default: 'Arabic'
  },
  isPublished: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);