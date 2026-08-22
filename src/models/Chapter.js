const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema({
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  chapterNumber: {
    type: Number,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  arabicText: {
    type: String
  },
  translation: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Chapter', chapterSchema);