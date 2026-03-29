const express = require('express');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

const app = express();

// 1. ALLOW LIVE SERVER TO TALK TO NODE
app.use(cors({ origin: '*' }));
app.use(express.json());

// 2. CLOUDINARY CONFIG
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: { folder: 'vibe_uploads', allowed_formats: ['jpg', 'png', 'jpeg', 'webp'] },
});
const upload = multer({ storage: storage });

// 3. THE UPLOAD ROUTE
app.post('/api/upload', upload.single('image'), (req, res) => {
    console.log("✅ NODE JS CAUGHT THE IMAGE!");
    if (!req.file) {
        return res.status(400).json({ error: "No file found" });
    }
    res.json({ imageUrl: req.file.path });
});

// 4. RUN ON PORT 5000 (Background API)
app.listen(5000, () => {
    console.log("-----------------------------------------");
    console.log("🟢 NODE.JS BACKGROUND API IS RUNNING");
    console.log("🟢 LISTENING ON: http://127.0.0.1:5000");
    console.log("-----------------------------------------");
});