const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk'); // OLD SDK - already in your package.json
require('dotenv').config();

const router = express.Router();

// ===== MULTER FOR 7MB - 50MB LIMIT =====
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB safe for 7MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF allowed'), false);
  }
});

// ===== FILEBASE S3 CLIENT - OLD SDK =====
const s3 = new AWS.S3({
  endpoint: process.env.FILEBASE_ENDPOINT || "https://s3.filebase.com",
  accessKeyId: process.env.FILEBASE_ACCESS_KEY,
  secretAccessKey: process.env.FILEBASE_SECRET_KEY,
  region: "us-east-1",
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
});

router.post('/upload', upload.single('pdf'), async (req, res) => {
  try {
    console.log("📥 File:", req.file?.originalname, req.file?.size);
    if (!req.file) return res.status(400).json({ error: "No PDF! Field must be 'pdf'" });

    const fileName = `books/${Date.now()}-${req.file.originalname.replace(/\s+/g, '-')}`;

    const params = {
      Bucket: process.env.FILEBASE_BUCKET,
      Key: fileName,
      Body: req.file.buffer,
      ContentType: 'application/pdf',
    };

    console.log("☁️ Uploading to Filebase:", fileName);
    const result = await s3.upload(params).promise();

    console.log("✅ Uploaded:", result.Location);

    res.json({
      url: result.Location,
      pdfUrl: result.Location,
      fileUrl: result.Location,
      size: req.file.size,
      message: "PDF uploaded!"
    });

  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
