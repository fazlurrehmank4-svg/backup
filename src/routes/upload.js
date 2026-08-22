const express = require('express');
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
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

const s3Client = new S3Client({
  endpoint: 'https://s3.filebase.io',
  region: 'auto',
  credentials: {
    accessKeyId: process.env.FILEBASE_ACCESS_KEY,
    secretAccessKey: process.env.FILEBASE_SECRET_KEY,
  },
  forcePathStyle: true,
});

router.post('/upload', upload.single('pdf'), async (req, res) => {
  try {
    console.log('📥 PDF:', req.file?.originalname, (req.file.size/1024/1024).toFixed(2)+'MB');
    console.log('Bucket:', process.env.FILEBASE_BUCKET);

    if (!req.file) return res.status(400).json({ error: "No file, field must be 'pdf'" });

    const key = `books/${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
    
    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.FILEBASE_BUCKET,
      Key: key,
      Body: req.file.buffer,
      ContentType: 'application/pdf',
    }));

    const url = `https://${process.env.FILEBASE_BUCKET}.s3.filebase.io/${key}`;
    console.log('✅ SUCCESS', url);
    return res.json({ success: true, url, pdfUrl: url });
  } catch (e) {
    console.error('❌ ERROR', e.name, e.message);
    return res.status(500).json({ error: e.message, code: e.name });
  }
});

module.exports = router;
