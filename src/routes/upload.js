const express = require('express');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) cb(null, true);
    else cb(new Error('Only PDF allowed'));
  },
});

// Supabase client - Use service_role for upload
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

router.post('/upload', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: "No PDF, field must be 'pdf'" });

    const safeName = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '-');
    const fileName = `books/${Date.now()}-${safeName}`;

    console.log('📥 Uploading to Supabase:', fileName, (req.file.size/1024/1024).toFixed(2)+'MB');

    const { data, error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET || 'almaas-pdfs')
      .upload(fileName, req.file.buffer, {
        contentType: 'application/pdf',
        upsert: false,
      });

    if (error) {
      console.error('❌ Supabase error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(process.env.SUPABASE_BUCKET || 'almaas-pdfs')
      .getPublicUrl(fileName);

    const publicUrl = publicUrlData.publicUrl;

    console.log('✅ SUCCESS:', publicUrl);
    return res.json({
      success: true,
      url: publicUrl,
      pdfUrl: publicUrl,
      fileUrl: publicUrl,
      key: fileName,
    });

  } catch (e) {
    console.error('❌ ERROR', e.message);
    return res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;
