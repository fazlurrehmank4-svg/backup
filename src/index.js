const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// ================= ROUTES =================
// Auth
app.use('/api/auth', require('./src/routes/authRoutes'));

// Books - ONE PDF + Chapters as page numbers (Option 1)
app.use('/api/books', require('./src/routes/bookRoutes'));

// Upload - Filebase S3
app.use('/api/upload', require('./src/routes/upload'));

// Note: For Option 1, chapters are embedded inside Book model
// So we DON'T need separate /api/chapters route
// app.use('/api/chapters', require('./src/routes/chapterRoutes'));

// ================= ROOT CHECK =================
app.get('/', (req, res) => {
  res.json({
    message: "Almaas Backend is running ✅ NEW V2 - FILEBASE READY",
    version: "2.0 - Option 1: One PDF + Chapters as Pages",
    status: "100% Complete",
    mainFile: "index.js",
    endpoints: {
      books: "/api/books",
      upload: "/api/upload (POST with file)",
      auth: "/api/auth"
    },
    howItWorks: "Upload 1 PDF -> Add chapters with startPage/endPage -> Reader jumps to page",
    envCheck: {
      hasFilebaseKey: !!process.env.FILEBASE_ACCESS_KEY,
      hasFilebaseSecret: !!process.env.FILEBASE_SECRET_KEY,
      hasFilebaseBucket: !!process.env.FILEBASE_BUCKET,
      bucketName: process.env.FILEBASE_BUCKET || "Not Set",
      hasMongoUri: !!process.env.MONGO_URI || !!process.env.MONGODB_URI
    }
  });
});

app.get('/api/upload', (req, res) => {
  res.json({ 
    message: "Upload endpoint ready ✅", 
    method: "Use POST with multipart/form-data key: file",
    example: "curl -X POST https://almaas-backend.onrender.com/api/upload -F file=@book.pdf"
  });
});

// ================= START SERVER =================
const PORT = process.env.PORT || 10000;
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI not found in .env");
} else {
  mongoose.connect(MONGO_URI)
    .then(() => {
      console.log("✅ MongoDB Connected");
      app.listen(PORT, () => {
        console.log(`🚀 Server running on ${PORT} - index.js - Filebase + Option 1 ready`);
      });
    })
    .catch(err => {
      console.error("❌ MongoDB Error:", err.message);
    });
}

module.exports = app;
