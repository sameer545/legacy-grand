const mongoose = require("mongoose");

const GallerySchema = new mongoose.Schema({
  roomType: { type: String, required: true }, // stored as slug
  images: [{ type: String }],
});

module.exports = mongoose.model("Gallery", GallerySchema);
