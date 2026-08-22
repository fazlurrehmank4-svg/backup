const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const Book = require('../models/Book');

router.post('/upload', upload.single('pdf'), async (req, res) => {
  try {
    const fileName = `books/${Date.now()}-${req.file.originalname}`;
    console.log('Uploading to Supabase:', fileName, (req.file.size/1024/1024).toFixed(2)+'MB');

    const { error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .upload(fileName, req.file.buffer, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (error) throw error;

    const { data } = supabase.storage.from(process.env.SUPABASE_BUCKET).getPublicUrl(fileName);
    const publicUrl = data.publicUrl;
    console.log('SUCCESS:', publicUrl);

    // SAVE TO MONGODB
    const book = await Book.create({
      title: req.body.title || req.file.originalname.replace('.pdf',''),
      pdfUrl: publicUrl,
      fileUrl: publicUrl,
      url: publicUrl,
      author: req.body.author || 'Almaas'
    });

    console.log('Found 1 books in MongoDB - Saved:', book.title);
    res.json({ success: true, url: publicUrl, book });

  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message });
  }
});
