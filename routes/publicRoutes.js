// routes/publicRoutes.js
const express = require('express');
const router = express.Router();

const { renderHome, renderAbout } = require('../controllers/homeController');
const { renderServicePage, renderPortfolio } = require('../controllers/serviceController');
const { getGalleryItemJson, trackWhatsAppClick } = require('../controllers/galleryController');
const GalleryItem = require('../models/GalleryItem');

router.get('/', renderHome);
router.get('/about', renderAbout);
router.get('/services/:category', renderServicePage);
router.get('/portfolio', renderPortfolio);

router.get('/privacy', (req, res) => {
  res.render('pages/privacy', { title: 'Privacy Policy — Ephphatha Concepts', description: 'Privacy Policy for Ephphatha Concepts Limited.' });
});

router.get('/terms', (req, res) => {
  res.render('pages/terms', { title: 'Terms of Service — Ephphatha Concepts', description: 'Terms of Service for Ephphatha Concepts Limited.' });
});

router.get('/sitemap.xml', async (req, res, next) => {
  try {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const staticPaths = ['/', '/about', '/services/construction', '/services/fashion', '/services/supply', '/portfolio', '/contact', '/privacy', '/terms'];
    const items = await GalleryItem.find({ isPublished: true }).select('slug updatedAt').lean();

    const urls = [
      ...staticPaths.map((p) => `<url><loc>${baseUrl}${p}</loc></url>`),
      ...items.map((i) => `<url><loc>${baseUrl}/portfolio#${i.slug}</loc><lastmod>${new Date(i.updatedAt).toISOString()}</lastmod></url>`),
    ];

    res.header('Content-Type', 'application/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>`);
  } catch (err) {
    next(err);
  }
});

router.get('/api/gallery/:slug', getGalleryItemJson);
router.post('/track/whatsapp-click', trackWhatsAppClick);

module.exports = router;
