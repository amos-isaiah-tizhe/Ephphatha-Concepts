// controllers/galleryController.js
const GalleryItem = require('../models/GalleryItem');
const { buildWhatsAppLink } = require('../utils/whatsappLink');

/** JSON endpoint used by the frontend modal to fetch full item detail. */
async function getGalleryItemJson(req, res, next) {
  try {
    const item = await GalleryItem.findOne({ slug: req.params.slug, isPublished: true }).lean();

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const whatsappUrl = buildWhatsAppLink(process.env.WHATSAPP_NUMBER, {
      title: item.title,
      category: item.serviceCategory,
      description: item.description,
      id: item._id,
    });

    res.json({ ...item, whatsappUrl });
  } catch (err) {
    next(err);
  }
}

/** Lightweight click-tracking beacon for WhatsApp CTA analytics (admin dashboard). */
async function trackWhatsAppClick(req, res) {
  // Fire-and-forget style endpoint; always responds fast, never blocks the redirect.
  res.status(204).end();
}

module.exports = { getGalleryItemJson, trackWhatsAppClick };
