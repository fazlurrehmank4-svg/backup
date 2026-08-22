const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));

const bookRoutes = require('./routes/bookRoutes');
const chapterRoutes = require('./routes/chapterRoutes');
const authRoutes = require('./routes/authRoutes');

app.use('/api/books', bookRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Almaas Backend API is Running ✅', version: '100% Complete' });
});

const PORT = process.env.PORT || 10000;
const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB Connected ✅');
    app.listen(PORT, () => console.log(`Server running on port ${PORT} ✅`));
  })
  .catch(err => {
    console.error('DB Error:', err.message);
  });