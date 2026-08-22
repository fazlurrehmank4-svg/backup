const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// ===== FIXED PATHS - Based on your screenshot =====
// Your files are in ./routes or ./src/routes - trying both
let authRoutes, bookRoutes, uploadRoute;

try {
  // Try src/routes first
  authRoutes = require('./src/routes/authRoutes');
  console.log("✅ Loaded auth from src/routes");
} catch (e) {
  try {
    authRoutes = require('./routes/authRoutes');
    console.log("✅ Loaded auth from routes");
  } catch (e2) {
    console.log("❌ authRoutes not found:", e2.message);
  }
}

try {
  bookRoutes = require('./src/routes/bookRoutes');
  console.log("✅ Loaded books from src/routes");
} catch (e) {
  try {
    bookRoutes = require('./routes/bookRoutes');
    console.log("✅ Loaded books from routes");
  } catch (e2) {
    console.log("❌ bookRoutes not found:", e2.message);
  }
}

try {
  uploadRoute = require('./src/routes/upload');
  console.log("✅ Loaded upload from src/routes");
} catch (e) {
  try {
    uploadRoute = require('./routes/upload');
    console.log("✅ Loaded upload from routes");
  } catch (e2) {
    console.log("❌ upload not found:", e2.message);
  }
}

if (authRoutes) app.use('/api/auth', authRoutes);
if (bookRoutes) app.use('/api/books', bookRoutes);
if (uploadRoute) app.use('/api/upload', uploadRoute);

app.get('/', (req, res) => {
  res.json({
    message: "Almaas Backend is running ✅ NEW V2 - FILEBASE READY",
    version: "2.0 - Option 1 - Fixed Paths",
    routesLoaded: {
      auth: !!authRoutes,
      books: !!bookRoutes,
      upload: !!uploadRoute
    },
    envCheck: {
      hasFilebaseKey: !!process.env.FILEBASE_ACCESS_KEY,
      hasFilebaseSecret: !!process.env.FILEBASE_SECRET_KEY,
      hasFilebaseBucket: !!process.env.FILEBASE_BUCKET
    }
  });
});

const PORT = process.env.PORT || 10000;
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

mongoose.connect(MONGO_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`🚀 Server ${PORT} - All routes fixed!`));
  })
  .catch(err => console.error(err));
