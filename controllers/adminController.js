// controllers/adminController.js
const slugify = (str) =>
  String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

const GalleryItem = require('../models/GalleryItem');
const ContactSubmission = require('../models/ContactSubmission');
const cloudinary = require('../config/cloudinary');
const logger = require('../utils/logger');
const { SERVICE_META } = require('../utils/serviceMeta');

async function renderDashboard(req, res, next) {
  try {
    const [totalItems, totalSubmissions, newSubmissions, byCategory] = await Promise.all([
      GalleryItem.countDocuments(),
      ContactSubmission.countDocuments(),
      ContactSubmission.countDocuments({ status: 'new' }),
      GalleryItem.aggregate([{ $group: { _id: '$serviceCategory', count: { $sum: 1 } } }]),
    ]);

    const recentSubmissions = await ContactSubmission.find().sort({ createdAt: -1 }).limit(5).lean();

    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      stats: { totalItems, totalSubmissions, newSubmissions, byCategory },
      recentSubmissions,
    });
  } catch (err) {
    next(err);
  }
}

async function listGalleryItems(req, res, next) {
  try {
    const items = await GalleryItem.find().sort({ serviceCategory: 1, displayOrder: 1, createdAt: -1 }).lean();
    res.render('admin/gallery-list', { title: 'Manage Gallery', items, SERVICE_META });
  } catch (err) {
    next(err);
  }
}

function renderNewItemForm(req, res) {
  res.render('admin/gallery-form', {
    title: 'Add Gallery Item',
    item: null,
    SERVICE_META,
    csrfToken: req.csrfToken(),
  });
}

async function renderEditItemForm(req, res, next) {
  try {
    const item = await GalleryItem.findById(req.params.id).lean();
    if (!item) return next({ status: 404, message: 'Item not found' });

    res.render('admin/gallery-form', {
      title: 'Edit Gallery Item',
      item,
      SERVICE_META,
      csrfToken: req.csrfToken(),
      error: req.query.error || null,
    });
  } catch (err) {
    next(err);
  }
}

async function createGalleryItem(req, res, next) {
  try {
    const { title, serviceCategory, subCategory, description, priceRange, tags } = req.body;

    const images = (req.files || []).map((file) => ({
      publicId: file.filename,
      url: file.path,
      altText: title,
    }));

    if (images.length === 0) {
      return res.status(400).render('admin/gallery-form', {
        title: 'Add Gallery Item',
        item: req.body,
        SERVICE_META,
        csrfToken: req.csrfToken(),
        error: 'At least one image is required.',
      });
    }

    let slug = slugify(title);
    const existing = await GalleryItem.findOne({ slug });
    if (existing) slug = `${slug}-${Date.now().toString(36)}`;

    await GalleryItem.create({
      title,
      slug,
      serviceCategory,
      subCategory,
      description,
      priceRange,
      images,
      tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    });

    res.redirect('/admin/gallery');
  } catch (err) {
    logger.error(`Create gallery item failed: ${err.message}`);
    next(err);
  }
}

async function updateGalleryItem(req, res, next) {
  try {
    const item = await GalleryItem.findById(req.params.id);
    if (!item) return next({ status: 404, message: 'Item not found' });

    const { title, serviceCategory, subCategory, description, priceRange, tags, isPublished } = req.body;

    item.title = title;
    item.serviceCategory = serviceCategory;
    item.subCategory = subCategory;
    item.description = description;
    item.priceRange = priceRange;
    item.tags = tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
    item.isPublished = isPublished === 'on' || isPublished === 'true';

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => ({
        publicId: file.filename,
        url: file.path,
        altText: title,
      }));
      item.images.push(...newImages);
    }

    await item.save();
    res.redirect('/admin/gallery');
  } catch (err) {
    logger.error(`Update gallery item failed: ${err.message}`);
    next(err);
  }
}

async function deleteGalleryItem(req, res, next) {
  try {
    const item = await GalleryItem.findById(req.params.id);
    if (!item) return next({ status: 404, message: 'Item not found' });

    // Clean up Cloudinary assets before removing the DB record.
    await Promise.allSettled(item.images.map((img) => cloudinary.uploader.destroy(img.publicId)));
    await item.deleteOne();

    res.redirect('/admin/gallery');
  } catch (err) {
    logger.error(`Delete gallery item failed: ${err.message}`);
    next(err);
  }
}

async function removeGalleryImage(req, res, next) {
  try {
    const item = await GalleryItem.findById(req.params.id);
    if (!item) return next({ status: 404, message: 'Item not found' });

    if (item.images.length <= 1) {
      return res.redirect(`/admin/gallery/${item._id}/edit?error=Cannot+remove+the+last+image.+Upload+a+replacement+first.`);
    }

    const image = item.images.find((img) => img.publicId === req.params.publicId);
    if (image) {
      await cloudinary.uploader.destroy(image.publicId);
      item.images = item.images.filter((img) => img.publicId !== req.params.publicId);
      await item.save();
    }

    res.redirect(`/admin/gallery/${item._id}/edit`);
  } catch (err) {
    next(err);
  }
}

async function listSubmissions(req, res, next) {
  try {
    const submissions = await ContactSubmission.find().sort({ createdAt: -1 }).lean();
    res.render('admin/submissions', { title: 'Enquiries', submissions });
  } catch (err) {
    next(err);
  }
}

async function updateSubmissionStatus(req, res, next) {
  try {
    await ContactSubmission.findByIdAndUpdate(req.params.id, { status: req.body.status });
    res.redirect('/admin/submissions');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  renderDashboard,
  listGalleryItems,
  renderNewItemForm,
  renderEditItemForm,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  removeGalleryImage,
  listSubmissions,
  updateSubmissionStatus,
};
