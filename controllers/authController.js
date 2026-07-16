// controllers/authController.js
const AdminUser = require('../models/AdminUser');
const logger = require('../utils/logger');

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000; // 15 minutes

function renderLogin(req, res) {
  res.render('admin/login', {
    title: 'Admin Login',
    error: null,
    csrfToken: req.csrfToken(),
  });
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const admin = await AdminUser.findOne({ email: email.toLowerCase() });

    if (!admin) {
      return res.status(401).render('admin/login', {
        title: 'Admin Login',
        error: 'Invalid email or password.',
        csrfToken: req.csrfToken(),
      });
    }

    if (admin.isLocked()) {
      return res.status(423).render('admin/login', {
        title: 'Admin Login',
        error: 'Account temporarily locked due to repeated failed attempts. Try again later.',
        csrfToken: req.csrfToken(),
      });
    }

    const valid = await admin.comparePassword(password);

    if (!valid) {
      admin.failedLoginAttempts += 1;
      if (admin.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
        admin.lockUntil = Date.now() + LOCK_TIME_MS;
        admin.failedLoginAttempts = 0;
      }
      await admin.save();

      return res.status(401).render('admin/login', {
        title: 'Admin Login',
        error: 'Invalid email or password.',
        csrfToken: req.csrfToken(),
      });
    }

    admin.failedLoginAttempts = 0;
    admin.lockUntil = undefined;
    admin.lastLoginAt = new Date();
    await admin.save();

    req.session.regenerate((err) => {
      if (err) return next(err);

      req.session.adminId = admin._id.toString();
      req.session.adminEmail = admin.email;
      req.session.mustChangePassword = admin.mustChangePassword;

      const redirectTo = req.session.returnTo || '/admin/dashboard';
      delete req.session.returnTo;
      res.redirect(redirectTo);
    });
  } catch (err) {
    logger.error(`Admin login error: ${err.message}`);
    next(err);
  }
}

function logout(req, res) {
  req.session.destroy(() => {
    res.clearCookie('ec.sid');
    res.redirect('/admin/login');
  });
}

module.exports = { renderLogin, login, logout };
