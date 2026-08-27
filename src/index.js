const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// ===== SECURITY HEADERS =====
app.use(helmet());

// ===== CORS FOR FLUTTER WEB - Secure =====
app.use(cors({
  origin: '*', // TODO: Change to your Flutter web URL after deploy: ['https://your-app.vercel.app']
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));

// ===== 50MB ONLY for upload, 10kb for others =====
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ limit: '10kb', extended: true }));

// Special 50MB parser ONLY for upload routes
app.use('/api/upload', express.json({ limit: '50mb' }));
app.use('/api/books', express.json({ limit: '50mb' }));

// Timeout fix for Render Free
app.use((req, res, next) => {
  req.setTimeout(120000);
  res.setTimeout(120000);
  next();
});

// Rate Limit - Prevent abuse
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200, // 200 requests per 15 min (increased for Flutter)
  message: { error: "Too many requests, try later" }
});
app.use('/api/', apiLimiter);

// MongoDB
mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ MongoDB Error:", err.message));

// Routes
const bookRoutes = require('./routes/bookRoutes');
const uploadRoutes = require('./routes/upload');
const authRoutes = require('./routes/authRoutes');

app.use('/api/books', bookRoutes);
app.use('/api', uploadRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.json({
    message: "Almaas Backend Running ✅ SECURE - 50MB Upload Enabled",
    version: "2.0 Secure",
    flutter: "CORS enabled"
  });
});

// Multer error handler
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: "PDF too large! Max 50MB" });
  }
  if (err.message) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} - SECURE 50MB ready`);
});