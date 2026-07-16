// middleware/errorHandler.js
const logger = require('../utils/logger');

function notFoundHandler(req, res) {
  res.status(404);
  if (req.originalUrl.startsWith('/admin')) {
    return res.render('admin/login', { error: 'Page not found.', csrfToken: req.csrfToken ? req.csrfToken() : '' });
  }
  return res.render('pages/404', { title: 'Page Not Found' });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const isProd = process.env.NODE_ENV === 'production';

  if (err.code === 'EBADCSRFTOKEN') {
    logger.warn(`CSRF token validation failed on ${req.originalUrl}`);
    return res.status(403).render('pages/500', {
      title: 'Request Blocked',
      message: 'Your session expired or the form was tampered with. Please go back and try again.',
    });
  }

  logger.error(`${status} — ${err.message}${!isProd && err.stack ? `\n${err.stack}` : ''}`);

  if (req.originalUrl.startsWith('/api') || req.xhr) {
    return res.status(status).json({
      error: isProd && status === 500 ? 'Something went wrong. Please try again.' : err.message,
      validation: err.validation || undefined,
    });
  }

  return res.status(status).render('pages/500', {
    title: 'Something Went Wrong',
    message: isProd
      ? 'Something went wrong on our end. Please try again shortly.'
      : err.message,
  });
}

module.exports = { notFoundHandler, errorHandler };
