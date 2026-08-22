const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(cors({origin:'*'}));
app.use(express.json({limit:'50mb'}));
app.use(express.urlencoded({extended:true, limit:'50mb'}));

// ROUTES
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/books', require('./src/routes/bookRoutes'));
app.use('/api/chapters', require('./src/routes/chapterRoutes'));

// NEW UPLOAD ROUTE - FILEBASE
app.use('/api/upload', require('./src/routes/upload'));

app.get('/', (req,res)=>{
  res.json({
    message:"Almaas Backend is running ✅ NEW V2 - FILEBASE READY",
    version:"2.0 with Filebase Upload",
    uploadEndpoint:"/api/upload",
    mainFile:"index.js",
    envCheck:{
      hasFilebaseKey:!!process.env.FILEBASE_ACCESS_KEY,
      hasFilebaseSecret:!!process.env.FILEBASE_SECRET_KEY,
      hasFilebaseBucket:!!process.env.FILEBASE_BUCKET,
      bucketName:process.env.FILEBASE_BUCKET
    }
  });
});

app.get('/api/upload', (req,res)=>{
  res.json({message:"Upload endpoint ready, use POST /api/upload with file"});
});

const PORT = process.env.PORT||10000;
mongoose.connect(process.env.MONGO_URI||process.env.MONGODB_URI)
.then(()=>{
  console.log("MongoDB Connected");
  app.listen(PORT,()=>console.log(`Server running on ${PORT} - index.js - Filebase ready`));
})
.catch(err=>console.error(err));
