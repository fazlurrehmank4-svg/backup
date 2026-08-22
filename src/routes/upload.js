const express = require('express');
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();
const router = express.Router();

// ============================================================
// MULTER
// ============================================================

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,

  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB
  },

  fileFilter: (req, file, cb) => {
    const isPdf =
      file.mimetype === 'application/pdf' ||
      file.originalname.toLowerCase().endsWith('.pdf');

    if (isPdf) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed.'));
    }
  },
});

// ============================================================
// FILEBASE S3
// ============================================================

const s3 = new AWS.S3({
  endpoint:
    process.env.FILEBASE_ENDPOINT ||
    'https://s3.filebase.io',

  accessKeyId: process.env.FILEBASE_ACCESS_KEY,
  secretAccessKey: process.env.FILEBASE_SECRET_KEY,

  region: 'auto',

  s3ForcePathStyle: true,

  signatureVersion: 'v4',

  // Important for S3-compatible services.
  // Don't use an unnecessarily large multipart chunk.
  httpOptions: {
    timeout: 120000,
    connectTimeout: 30000,
  },
});

// ============================================================
// PDF UPLOAD
// ============================================================

router.post(
  '/upload',
  (req, res, next) => {
    console.log('========================================');
    console.log('📥 PDF UPLOAD REQUEST');
    console.log('========================================');

    next();
  },

  upload.single('pdf'),

  async (req, res) => {
    try {
      console.log('📄 Multer received file:');
      console.log('   Name:', req.file?.originalname);
      console.log('   MIME:', req.file?.mimetype);
      console.log('   Size:', req.file?.size);
      console.log(
        '   Size MB:',
        req.file
          ? (req.file.size / 1024 / 1024).toFixed(2)
          : 'N/A'
      );

      // --------------------------------------------------------
      // Check file
      // --------------------------------------------------------

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "No PDF received. Multipart field must be 'pdf'.",
        });
      }

      if (!req.file.buffer || req.file.buffer.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'PDF buffer is empty.',
        });
      }

      // --------------------------------------------------------
      // File name
      // --------------------------------------------------------

      const safeName = req.file.originalname
        .replace(/[^a-zA-Z0-9._-]/g, '-')
        .replace(/-+/g, '-');

      const fileName =
        `books/${Date.now()}-${safeName}`;

      console.log('☁️ Uploading to Filebase...');
      console.log('   Bucket:', process.env.FILEBASE_BUCKET);
      console.log('   Key:', fileName);
      console.log(
        '   Bytes:',
        req.file.buffer.length
      );

      // --------------------------------------------------------
      // Filebase parameters
      // --------------------------------------------------------

      const params = {
        Bucket: process.env.FILEBASE_BUCKET,
        Key: fileName,

        Body: req.file.buffer,

        ContentLength: req.file.buffer.length,

        ContentType: 'application/pdf',
      };

      // --------------------------------------------------------
      // Upload
      // --------------------------------------------------------

      const startTime = Date.now();

      const result = await s3
        .upload(params)
        .promise();

      const elapsed =
        ((Date.now() - startTime) / 1000).toFixed(2);

      console.log('========================================');
      console.log('✅ FILEBASE UPLOAD SUCCESS');
      console.log('Location:', result.Location);
      console.log('ETag:', result.ETag);
      console.log('Time:', elapsed, 'seconds');
      console.log('========================================');

      // --------------------------------------------------------
      // Response
      // --------------------------------------------------------

      return res.status(200).json({
        success: true,

        url: result.Location,
        pdfUrl: result.Location,
        fileUrl: result.Location,

        key: fileName,

        size: req.file.size,

        message: 'PDF uploaded successfully.',
      });
    } catch (error) {
      console.error('========================================');
      console.error('❌ PDF UPLOAD ERROR');
      console.error('========================================');

      console.error('Name:', error.name);
      console.error('Message:', error.message);
      console.error('Code:', error.code);
      console.error('Status:', error.statusCode);
      console.error('Request ID:', error.requestId);

      if (error.stack) {
        console.error(error.stack);
      }

      console.error('========================================');

      return res.status(
        error.statusCode || 500
      ).json({
        success: false,

        error:
          error.message ||
          'PDF upload failed.',

        code: error.code || null,

        statusCode:
          error.statusCode || 500,
      });
    }
  }
);

// ============================================================
// MULTER ERROR HANDLER
// ============================================================

router.use((error, req, res, next) => {
  console.error('========================================');
  console.error('❌ MULTER ERROR');
  console.error('========================================');
  console.error(error);

  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        error: 'PDF is larger than the 50 MB limit.',
        code: error.code,
      });
    }

    return res.status(400).json({
      success: false,
      error: error.message,
      code: error.code,
    });
  }

  if (error) {
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }

  next();
});

module.exports = router;
