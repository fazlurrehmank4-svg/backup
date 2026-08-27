const express = require('express');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const Book = require('../models/Book');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

router.post('/upload', upload.single('pdf'), async (req, res) => {
  try {
    const fileName = `books/${Date.now()}-${req.file.originalname}`;
    console.log('Uploading to Supabase:', fileName);

    const { error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET || 'almaas-pdfs')
      .upload(fileName, req.file.buffer, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (error) throw error;

    const { data } = supabase.storage
      .from(process.env.SUPABASE_BUCKET || 'almaas-pdfs')
      .getPublicUrl(fileName);

    const publicUrl = data.publicUrl;
    console.log('SUCCESS:', publicUrl);

    const book = await Book.create({
      title: req.body.title || req.file.originalname.replace('.pdf',''),
      pdfUrl: publicUrl,
      fileUrl: publicUrl,
      url: publicUrl,
      author: req.body.author || 'Almaas'
    });

    console.log('Saved to MongoDB:', book.title);
    res.json({ success: true, url: publicUrl, book });

  } catch (err) {
    console.error('Upload error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
