const express = require("express");
const verifyToken = require("../middleware/authMiddleware");
const cloudinary = require("../config/cloudinary");
const multer = require("multer");
const Gallery = require("../models/Gallery");

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Helper: slugify roomType
const slugify = (str) => str.toLowerCase().replace(/\s+/g, "-");

router.post("/upload", verifyToken, upload.single("image"), async (req, res) => {
  try {
    if (req.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { roomType } = req.body;
    if (!roomType) {
      return res.status(400).json({ message: "Room type is required" });
    }

    const roomSlug = slugify(roomType);

    // Upload to Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: `legacygrand/${roomSlug}` }, 
      async (error, result) => {
        if (error) return res.status(500).json({ message: "Upload failed" });

        // Save to MongoDB
        let gallery = await Gallery.findOne({ roomType: roomSlug });
        if (!gallery) {
          gallery = new Gallery({ roomType: roomSlug, images: [] });
        }
        gallery.images.push(result.secure_url);
        await gallery.save();

        res.json({ message: "Image uploaded successfully", url: result.secure_url });
      }
    );

    uploadStream.end(req.file.buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Fetch images for a room
router.get("/:roomType", async (req, res) => {
  try {
    const roomSlug = slugify(req.params.roomType);
    const gallery = await Gallery.findOne({ roomType: roomSlug });
    res.json(gallery ? gallery.images : []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
