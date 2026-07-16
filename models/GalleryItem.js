// models/GalleryItem.js
const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema(
  {
    publicId: { type: String, required: true },
    url: { type: String, required: true },
    altText: { type: String, default: '' },
  },
  { _id: false }
);

const galleryItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    serviceCategory: {
      type: String,
      required: true,
      enum: ['construction', 'fashion', 'supply'],
      index: true,
    },
    subCategory: { type: String, trim: true, maxlength: 120 },
    description: { type: String, required: true, maxlength: 2000 },
    images: {
      type: [imageSchema],
      validate: (arr) => Array.isArray(arr) && arr.length > 0,
    },
    tags: [{ type: String, trim: true, maxlength: 40 }],
    priceRange: { type: String, trim: true, maxlength: 60 }, // e.g. "Request Quote", "From ₦150,000"
    isPublished: { type: Boolean, default: true, index: true },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

galleryItemSchema.index({ serviceCategory: 1, isPublished: 1, displayOrder: 1 });

module.exports = mongoose.model('GalleryItem', galleryItemSchema);
