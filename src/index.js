const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// ===== FIX FOR 7MB PDF - INCREASE LIMIT TO 50MB =====
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// CORS - Allow Flutter Web (localhost:xxx)
app.use(cors({
  origin: '*', // For production, change to your Flutter web URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Timeout fix for 7MB upload on Render Free (needs 60-90 sec)
app.use((req, res, next) => {
  req.setTimeout(120000); // 2 min
  res.setTimeout(120000);
  next();
});

// MongoDB Connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ MongoDB Error:", err));

// Routes
const bookRoutes = require('./routes/bookRoutes');
const uploadRoutes = require('./routes/upload'); // Make sure this file exists
const authRoutes = require('./routes/authRoutes');

app.use('/api/books', bookRoutes);
app.use('/api', uploadRoutes); // This gives you /api/upload
app.use('/api/auth', authRoutes);

// Health check
app.get('/', (req, res) => {
  res.send("Almaas Backend Running - 50MB Upload Enabled");
});

// Error handler for multer file too large
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: "PDF too large! Max 50MB. Your file is bigger." });
  }
  if (err.message) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} - 50MB upload ready for 7MB PDF`);
});
