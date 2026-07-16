// controllers/homeController.js
const GalleryItem = require('../models/GalleryItem');

async function renderHome(req, res, next) {
  try {
    const featured = await GalleryItem.find({ isPublished: true })
      .sort({ displayOrder: 1, createdAt: -1 })
      .limit(6)
      .lean();

    res.render('pages/home', {
      title: 'Ephphatha Concepts Limited — Construction, Fashion & General Supply',
      description:
        'CAC-registered Nigerian company delivering construction, fashion, and general supply services with integrity, quality, and professionalism.',
      featured,
    });
  } catch (err) {
    next(err);
  }
}

function renderAbout(req, res) {
  res.render('pages/about', {
    title: 'About Us — Ephphatha Concepts Limited',
    description: 'Learn about Ephphatha Concepts Limited — our vision, mission, core values, and leadership team.',
  });
}

module.exports = { renderHome, renderAbout };
