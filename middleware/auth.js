// middleware/auth.js

function requireAuth(req, res, next) {
  if (req.session && req.session.adminId) {
    return next();
  }
  req.session.returnTo = req.originalUrl;
  return res.redirect('/admin/login');
}

/** Blocks access to /admin/login etc. if already authenticated. */
function redirectIfAuthenticated(req, res, next) {
  if (req.session && req.session.adminId) {
    return res.redirect('/admin/dashboard');
  }
  return next();
}

module.exports = { requireAuth, redirectIfAuthenticated };
