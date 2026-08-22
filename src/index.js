const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// ===== CORS FIRST FOR FLUTTER WEB =====
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ===== 50MB LIMIT FOR 7MB PDF =====
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Timeout fix for Render Free
app.use((req, res, next) => {
  req.setTimeout(120000);
  res.setTimeout(120000);
  next();
});

// MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ MongoDB Error:", err));

// Routes
const bookRoutes = require('./routes/bookRoutes');
const uploadRoutes = require('./routes/upload');
const authRoutes = require('./routes/authRoutes');

app.use('/api/books', bookRoutes);
app.use('/api', uploadRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send("Almaas Backend Running - 50MB Upload Enabled");
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} - 50MB ready`);
});
