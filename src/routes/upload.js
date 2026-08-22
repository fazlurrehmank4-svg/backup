const express = require('express');
const router = express.Router();
const multer = require('multer');
const AWS = require('aws-sdk');

const upload = multer({ storage: multer.memoryStorage() });

const s3 = new AWS.S3({
  endpoint: 'https://s3.filebase.com',
  accessKeyId: process.env.FILEBASE_ACCESS_KEY,
  secretAccessKey: process.env.FILEBASE_SECRET_KEY,
  signatureVersion: 'v4',
  region: 'us-east-1'
});

router.post('/', upload.single('file'), async (req,res)=>{
  try{
    if(!req.file) return res.status(400).json({error:"No file"});
    const fileName = `${Date.now()}-${req.file.originalname}`;
    const params = {
      Bucket: process.env.FILEBASE_BUCKET,
      Key: fileName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype
    };
    const result = await s3.upload(params).promise();
    res.json({
      url: `https://${process.env.FILEBASE_BUCKET}.s3.filebase.com/${fileName}`,
      key: fileName,
      fileName: req.file.originalname,
      location: result.Location
    });
  }catch(e){
    res.status(500).json({error:e.message});
  }
});

module.exports = router;
