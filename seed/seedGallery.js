// seed/seedGallery.js
require('dotenv').config();
const mongoose = require('mongoose');
const GalleryItem = require('../models/GalleryItem');
const logger = require('../utils/logger');

/**
 * NOTE: This seed uses placeholder Cloudinary-style image objects so the site
 * has content to render immediately after setup. Replace these with real
 * uploads via the admin dashboard (/admin/gallery/new) — real uploads go
 * through Cloudinary and get a real publicId, enabling proper deletion.
 */
const sampleItems = [
  {
    title: 'Modern Bungalow — Full Construction',
    slug: 'modern-bungalow-full-construction',
    serviceCategory: 'construction',
    subCategory: 'General Construction',
    description:
      'Complete residential build from foundation to finishing, including structural works, roofing, and interior finishing.',
    images: [
      { publicId: 'seed/construction-1', url: '/images/seed/construction-1.svg', altText: 'Modern bungalow construction' },
    ],
    priceRange: 'Request Quote',
    tags: ['residential', 'new build'],
    isPublished: true,
    displayOrder: 1,
  },
  {
    title: 'Office Roofing Replacement',
    slug: 'office-roofing-replacement',
    serviceCategory: 'construction',
    subCategory: 'Roofing Services',
    description: 'Full roof replacement for a commercial office block, including waterproofing and surface finishing.',
    images: [
      { publicId: 'seed/construction-2', url: '/images/seed/construction-2.svg', altText: 'Roofing installation' },
    ],
    priceRange: 'From ₦850,000',
    tags: ['roofing', 'commercial'],
    isPublished: true,
    displayOrder: 2,
  },
  {
    title: 'Corporate Wear — Staff Uniform Set',
    slug: 'corporate-wear-staff-uniform-set',
    serviceCategory: 'fashion',
    subCategory: 'Uniform Production',
    description: 'Bulk-produced corporate uniforms for a 40-person office team, tailored and delivered on schedule.',
    images: [
      { publicId: 'seed/fashion-1', url: '/images/seed/fashion-1.svg', altText: 'Corporate wear uniforms' },
    ],
    priceRange: 'From ₦15,000 / set',
    tags: ['corporate', 'uniform'],
    isPublished: true,
    displayOrder: 1,
  },
  {
    title: 'Native Attire — Custom Agbada',
    slug: 'native-attire-custom-agbada',
    serviceCategory: 'fashion',
    subCategory: 'Native/Traditional Attire',
    description: 'Custom-tailored native agbada with precision embroidery and fitting for a client event.',
    images: [
      { publicId: 'seed/fashion-2', url: '/images/seed/fashion-2.svg', altText: 'Native attire tailoring' },
    ],
    priceRange: 'Request Quote',
    tags: ['native wear', 'tailoring'],
    isPublished: true,
    displayOrder: 2,
  },
  {
    title: 'Bulk Building Materials Supply',
    slug: 'bulk-building-materials-supply',
    serviceCategory: 'supply',
    subCategory: 'Building Materials',
    description: 'Procurement and delivery of cement, blocks, and reinforcement materials for a mid-size construction project.',
    images: [
      { publicId: 'seed/supply-1', url: '/images/seed/supply-1.svg', altText: 'Building materials supply' },
    ],
    priceRange: 'Request Quote',
    tags: ['materials', 'bulk supply'],
    isPublished: true,
    displayOrder: 1,
  },
  {
    title: 'Electrical & Plumbing Materials Package',
    slug: 'electrical-plumbing-materials-package',
    serviceCategory: 'supply',
    subCategory: 'Electrical Materials',
    description: 'Full electrical and plumbing materials package sourced and supplied for a commercial fit-out.',
    images: [
      { publicId: 'seed/supply-2', url: '/images/seed/supply-2.svg', altText: 'Electrical and plumbing materials' },
    ],
    priceRange: 'Request Quote',
    tags: ['electrical', 'plumbing'],
    isPublished: true,
    displayOrder: 2,
  },
];

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    for (const data of sampleItems) {
      const exists = await GalleryItem.findOne({ slug: data.slug });
      if (exists) {
        logger.info(`Skipping existing item: ${data.slug}`);
        continue;
      }
      await GalleryItem.create(data);
      logger.info(`Created sample item: ${data.slug}`);
    }

    logger.info('Gallery seed complete.');
    process.exit(0);
  } catch (err) {
    logger.error(`Gallery seed failed: ${err.message}`);
    process.exit(1);
  }
})();
