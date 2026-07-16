// middleware/sanitize.js
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss');

/** Strips Mongo operator injection attempts ($gt, $where, etc.) from req.body/query/params. */
const mongoSanitizeMiddleware = mongoSanitize({
  replaceWith: '_',
  onSanitize: () => {}, // no-op; avoids leaking details, still sanitizes
});

/** Recursively runs xss() over all string values in req.body to neutralize script injection. */
function xssSanitizeBody(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = deepSanitize(req.body);
  }
  next();
}

function deepSanitize(value) {
  if (typeof value === 'string') {
    return xss(value.trim());
  }
  if (Array.isArray(value)) {
    return value.map(deepSanitize);
  }
  if (value && typeof value === 'object') {
    const out = {};
    for (const key of Object.keys(value)) {
      out[key] = deepSanitize(value[key]);
    }
    return out;
  }
  return value;
}

module.exports = { mongoSanitizeMiddleware, xssSanitizeBody };
