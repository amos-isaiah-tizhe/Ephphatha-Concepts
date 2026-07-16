// controllers/serviceController.js
const GalleryItem = require('../models/GalleryItem');
const { SERVICE_META } = require('../utils/serviceMeta');

async function renderServicePage(req, res, next) {
  try {
    const { category } = req.params;
    const meta = SERVICE_META[category];

    if (!meta) {
      return next({ status: 404, message: 'Service not found' });
    }

    const items = await GalleryItem.find({ serviceCategory: category, isPublished: true })
      .sort({ displayOrder: 1, createdAt: -1 })
      .lean();

    res.render('pages/service', {
      title: `${meta.label} — Ephphatha Concepts Limited`,
      description: meta.heroDescription,
      meta,
      items,
    });
  } catch (err) {
    next(err);
  }
}

async function renderPortfolio(req, res, next) {
  try {
    const filter = req.query.category && SERVICE_META[req.query.category] ? req.query.category : null;
    const query = { isPublished: true };
    if (filter) query.serviceCategory = filter;

    const items = await GalleryItem.find(query).sort({ displayOrder: 1, createdAt: -1 }).lean();

    res.render('pages/portfolio', {
      title: 'Our Portfolio — Ephphatha Concepts Limited',
      description: 'Browse completed and ongoing construction, fashion, and supply projects by Ephphatha Concepts Limited.',
      items,
      activeFilter: filter,
      SERVICE_META,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { renderServicePage, renderPortfolio };
