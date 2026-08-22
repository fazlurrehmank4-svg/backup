const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const app = express();
app.use(cors({origin:'*'}));
app.use(express.json({limit:'10mb'}));
app.use(express.urlencoded({extended:true}));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/books', require('./routes/books'));
app.use('/api/chapters', require('./routes/chapters'));
app.use('/api/upload', require('./routes/upload'));
app.get('/', (req,res)=>{
  res.json({
    message:"Almaas Backend is running ✅ NEW V2",
    version:"2.0 with Filebase Upload",
    uploadEndpoint:"/api/upload",
    envCheck:{
      hasFilebaseKey:!!process.env.FILEBASE_ACCESS_KEY,
      hasFilebaseSecret:!!process.env.FILEBASE_SECRET_KEY,
      hasFilebaseBucket:!!process.env.FILEBASE_BUCKET
    }
  });
});
const PORT = process.env.PORT||5000;
mongoose.connect(process.env.MONGO_URI||process.env.MONGODB_URI).then(()=>{
  app.listen(PORT,()=>console.log(`Server ${PORT}`));
});
