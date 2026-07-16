// routes/adminRoutes.js
const express = require('express');
const router = express.Router();

const { requireAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { galleryItemValidators, handleValidation } = require('../middleware/validators');
const { mongoSanitizeMiddleware, xssSanitizeBody } = require('../middleware/sanitize');

const {
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
} = require('../controllers/adminController');

router.use(requireAuth);

// Inject CSRF token into every admin view automatically.
router.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});

router.get('/dashboard', renderDashboard);

router.get('/gallery', listGalleryItems);
router.get('/gallery/new', renderNewItemForm);

// Note: the global body sanitizers in server.js run BEFORE multer (which is
// mounted per-route here), so multipart form fields bypass them upstream.
// Re-run sanitization here, after multer has populated req.body, for
// defense in depth (EJS output-escaping is the other layer of protection).
router.post(
  '/gallery',
  upload.array('images', 8),
  mongoSanitizeMiddleware,
  xssSanitizeBody,
  galleryItemValidators,
  handleValidation,
  createGalleryItem
);

router.get('/gallery/:id/edit', renderEditItemForm);

router.post(
  '/gallery/:id',
  upload.array('images', 8),
  mongoSanitizeMiddleware,
  xssSanitizeBody,
  galleryItemValidators,
  handleValidation,
  updateGalleryItem
);

router.post('/gallery/:id/delete', deleteGalleryItem);
router.post('/gallery/:id/images/:publicId/delete', removeGalleryImage);

router.get('/submissions', listSubmissions);
router.post('/submissions/:id/status', updateSubmissionStatus);

module.exports = router;
