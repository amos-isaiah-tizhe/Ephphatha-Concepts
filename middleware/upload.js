// middleware/upload.js
const multer = require('multer');
const cloudinary = require('../config/cloudinary');

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB
const MAX_FILES = 8;
const CLOUDINARY_FOLDER = 'ephphatha-concepts/gallery';

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new Error('Only JPEG, PNG, WEBP, or AVIF images are allowed.'));
  }
  return cb(null, true);
}

// Buffer files in memory (never written to disk) — small, transient, and
// forwarded straight to Cloudinary below.
const multerUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE, files: MAX_FILES },
});

/** Uploads a single in-memory buffer to Cloudinary via a stream. */
function uploadBufferToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: CLOUDINARY_FOLDER,
        resource_type: 'image',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      },
      (err, result) => {
        if (err) return reject(err);
        return resolve(result);
      }
    );
    stream.end(buffer);
  });
}

/**
 * Express middleware factory: parses multipart file(s) with multer, then
 * uploads each buffered file to Cloudinary and normalizes req.files so the
 * rest of the app can keep reading file.filename (Cloudinary public_id) and
 * file.path (Cloudinary secure_url) exactly as before — no other controller
 * or view code needs to change.
 */
function uploadImages(fieldName, maxCount = MAX_FILES) {
  const multerMiddleware = multerUpload.array(fieldName, maxCount);

  return function handleUpload(req, res, next) {
    multerMiddleware(req, res, async (err) => {
      if (err) return next(err);

      if (!req.files || req.files.length === 0) {
        req.files = [];
        return next();
      }

      try {
        const uploaded = await Promise.all(
          req.files.map((file) => uploadBufferToCloudinary(file.buffer))
        );

        req.files = uploaded.map((result) => ({
          filename: result.public_id,
          path: result.secure_url,
        }));

        return next();
      } catch (uploadErr) {
        return next(uploadErr);
      }
    });
  };
}

module.exports = { array: uploadImages };
