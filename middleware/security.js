// middleware/security.js
const crypto = require('crypto');
const helmet = require('helmet');

/**
 * Per-request CSP nonce generator. Must run BEFORE the helmet middleware so
 * the nonce can be read inside the CSP directive callback below, and must be
 * exposed on res.locals so EJS views can attach it to the one legitimate
 * inline script we ship (JSON-LD structured data in seo-meta.ejs).
 */
function nonceMiddleware(req, res, next) {
  res.locals.cspNonce = crypto.randomBytes(16).toString('base64');
  next();
}

/**
 * Strict, explicit Content Security Policy.
 * No 'unsafe-inline' scripts — the single inline JSON-LD block is allowed
 * only via a fresh per-request nonce. Cloudinary is the only external image host.
 */
function buildHelmetMiddleware() {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        objectSrc: ["'none'"],
        imgSrc: ["'self'", 'data:', 'res.cloudinary.com'],
        scriptSrc: ["'self'", (req, res) => `'nonce-${res.locals.cspNonce}'`],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
fontSrc: ["'self'", 'data:', 'https://fonts.gstatic.com'],
        connectSrc: ["'self'"],
        frameAncestors: ["'none'"],
        formAction: ["'self'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false, // Cloudinary images don't send CORP headers
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  });
}

module.exports = buildHelmetMiddleware;
module.exports.nonceMiddleware = nonceMiddleware;
