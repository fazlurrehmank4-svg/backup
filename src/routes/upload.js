const express = require('express');
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();

const router = express.Router();

// ===== MULTER CONFIG FOR 7MB - 50MB LIMIT =====
const storage = multer.memoryStorage(); // Use memory, not disk (Render disk is ephemeral)

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB - Safe for your 7MB
    fieldSize: 50 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    // Only allow PDF
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files allowed!'), false);
    }
  }
});

// ===== FILEBASE S3 CLIENT =====
const s3Client = new S3Client({
  endpoint: process.env.FILEBASE_ENDPOINT || "https://s3.filebase.com",
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.FILEBASE_ACCESS_KEY,
    secretAccessKey: process.env.FILEBASE_SECRET_KEY,
  },
  forcePathStyle: true,
});

// ===== UPLOAD ENDPOINT - FIELD MUST BE 'pdf' =====
router.post('/upload', upload.single('pdf'), async (req, res) => {
  try {
    console.log("📥 Upload request received");
    console.log("File:", req.file ? `${req.file.originalname} - ${req.file.size} bytes` : "NO FILE");

    if (!req.file) {
      return res.status(400).json({ 
        error: "No PDF file received! Flutter must send field name 'pdf'. Check upload_service.dart" 
      });
    }

    // Check size - 7MB should be fine
    const fileSizeMB = (req.file.size / 1024 / 1024).toFixed(2);
    console.log(`📄 File size: ${fileSizeMB} MB`);

    if (req.file.size > 50 * 1024 * 1024) {
      return res.status(400).json({ error: `File too large: ${fileSizeMB} MB. Max 50MB` });
    }

    // Upload to Filebase
    const fileName = `books/${Date.now()}-${req.file.originalname.replace(/\s+/g, '-')}`;
    
    const command = new PutObjectCommand({
      Bucket: process.env.FILEBASE_BUCKET,
      Key: fileName,
      Body: req.file.buffer,
      ContentType: 'application/pdf',
    });

    console.log("☁️ Uploading to Filebase:", fileName);
    await s3Client.send(command);

    // Construct URL
    const fileUrl = `https://${process.env.FILEBASE_BUCKET}.s3.filebase.com/${fileName}`;
    
    // Also try gateway URL format
    const gatewayUrl = `https://gateway.filebase.io/ipfs/${process.env.FILEBASE_BUCKET}/${fileName}`;

    console.log("✅ Uploaded successfully:", fileUrl);

    res.json({
      url: fileUrl,
      pdfUrl: fileUrl, // For compatibility
      fileUrl: fileUrl,
      gatewayUrl: gatewayUrl,
      size: req.file.size,
      message: "PDF uploaded successfully!"
    });

  } catch (error) {
    console.error("❌ Upload error:", error);
    res.status(500).json({ 
      error: "Upload failed: " + error.message,
      details: error.toString()
    });
  }
});

module.exports = router;
