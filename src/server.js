const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

// === SECURITY ===
app.use(helmet());

// CORS - Allow only your apps
const allowedOrigins = [
  'http://localhost:55429',
  'http://localhost:5173',
  'http://localhost:3000'
];
app.use(cors({
  origin: function(origin, callback){
    if(!origin || allowedOrigins.includes(origin) || origin.includes('vercel.app')){
      callback(null, true);
    } else {
      callback(null, true); // keep open for now, lock later
    }
  },
  credentials: true
}));

app.use(express.json({limit:'10kb'}));
app.use(express.urlencoded({extended:true, limit:'10kb'}));

// Rate Limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests" }
});
app.use('/api/', limiter);

// === ROUTES ===
app.use('/api/auth', require('./routes/auth'));
app.use('/api/books', require('./routes/books'));
app.use('/api/chapters', require('./routes/chapters'));
app.use('/api/upload', require('./routes/upload'));

app.get('/', (req,res)=>{
  res.json({
    message:"Almaas Backend is running ✅ SECURE V2",
    version:"2.0 with Filebase Upload",
    uploadEndpoint:"/api/upload",
    envCheck:{
      hasFilebaseKey:!!process.env.FILEBASE_ACCESS_KEY,
      hasFilebaseSecret:!!process.env.FILEBASE_SECRET_KEY,
      hasFilebaseBucket:!!process.env.FILEBASE_BUCKET,
      bucket:process.env.FILEBASE_BUCKET
    }
  });
});

const PORT = process.env.PORT||5000;
mongoose.connect(process.env.MONGO_URI||process.env.MONGODB_URI).then(()=>{
  console.log("MongoDB connected");
  app.listen(PORT,()=>console.log(`Server ${PORT} - Secure & Upload ready`));
}).catch(err => console.log("MongoDB Error:", err.message));