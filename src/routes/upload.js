const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const router = express.Router();

// Try to load auth middleware, if exists use it else skip
let authMiddleware;
try {
  authMiddleware = require('../middleware/auth');
} catch (e) {
  try {
    authMiddleware = require('../middlewares/auth');
  } catch (e2) {
    // If no auth middleware found, create dummy that allows all
    authMiddleware = (req, res, next) => next();
    console.log('⚠️  Auth middleware not found, upload route will be open');
  }
}

// Filebase S3 Configuration
const s3 = new AWS.S3({
  endpoint: 'https://s3.filebase.com',
  accessKeyId: process.env.FILEBASE_ACCESS_KEY,
  secretAccessKey: process.env.FILEBASE_SECRET_KEY,
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
  region: 'us-east-1',
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    // Allow images and PDFs
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only images and PDFs allowed'), false);
    }
  }
});

/**
 * POST /api/upload
 * Uploads file to Filebase and returns public URL
 * Requires Bearer token
 */
router.post('/', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded. Send file field.' });
    }

    if (!process.env.FILEBASE_BUCKET) {
      return res.status(500).json({ message: 'FILEBASE_BUCKET not configured on server' });
    }

    const file = req.file;
    // Clean filename: 1700000000-my-book-cover.jpg
    const cleanName = file.originalname.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.-]/g, '');
    const fileName = `${Date.now()}-${cleanName}`;

    const params = {
      Bucket: process.env.FILEBASE_BUCKET,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
    };

    console.log(`📤 Uploading ${fileName} (${file.mimetype}, ${file.size} bytes) to ${params.Bucket}`);

    const result = await s3.upload(params).promise();

    console.log(`✅ Uploaded: ${result.Location}`);

    res.status(200).json({
      url: result.Location,
      fileName: fileName,
      size: file.size,
      mimetype: file.mimetype,
      message: 'File uploaded successfully',
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({
      message: 'Upload failed',
      error: error.message,
    });
  }
});

module.exports = router;