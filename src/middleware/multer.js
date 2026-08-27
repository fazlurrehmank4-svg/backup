const multer = require('multer');

// 7MB needs memoryStorage + bigger limit
const storage = multer.memoryStorage(); // Don't save to disk on Render (disk is temp)

const upload = multer({ 
  storage: storage,
  limits: { 
    fileSize: 50 * 1024 * 1024, // 50MB max - allows your 7MB easily
    fieldSize: 50 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF allowed'), false);
  }
});

module.exports = upload;
