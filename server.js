// server.js
const { validateEnv } = require('./config/env');
validateEnv();

const express = require('express');
const path = require('path');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const csurf = require('csurf');
const hpp = require('hpp');

const connectDB = require('./config/db');
const buildSessionMiddleware = require('./config/session');
const buildHelmetMiddleware = require('./middleware/security');
const { globalLimiter } = require('./middleware/rateLimiter');
const { xssSanitizeBody } = require('./middleware/sanitize');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const { getSiteConfig } = require('./utils/siteConfig');
const logger = require('./utils/logger');
const routes = require('./routes');

const app = express();

// Trust proxy (needed for correct req.ip / secure cookies behind Render/Railway/Heroku/Nginx)
app.set('trust proxy', 1);

// ---- View engine ----
// Note: this project does NOT use express-ejs-layouts. Each page template
// includes ../partials/page-start and ../partials/page-end directly (plain
// EJS include(), same mechanism proven reliable everywhere in this app).
// express-ejs-layouts' internal layout-wrapping was found to unreliably
// resolve include() paths inside layout files on some Windows setups, even
// with fully-qualified absolute paths, so it has been removed entirely.
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ---- Global view locals ----
// Deliberately mounted FIRST, before any middleware that can fail/throw
// (body parsing, CSRF, etc.). If something later in the chain errors, Express
// skips straight to errorHandler — but skips only the remaining *regular*
// middleware, not ones already run. Registering this here guarantees
// res.locals.site / currentPath are always set before rendering any error
// page (pages/404.ejs, pages/500.ejs), even when the failure happens before
// routes are ever reached (e.g. a CSRF failure).
app.use((req, res, next) => {
  res.locals.site = getSiteConfig();
  res.locals.currentPath = req.path;
  next();
});

// ---- Core security middleware ----
app.use(buildHelmetMiddleware.nonceMiddleware);
app.use(buildHelmetMiddleware());
app.use(compression());
app.use(globalLimiter);

// ---- Body & cookie parsing ----
app.use(express.urlencoded({ extended: true, limit: '200kb' }));
app.use(express.json({ limit: '200kb' }));
app.use(cookieParser());

// ---- Sanitization (order matters: after body parsing, before routes) ----
app.use(xssSanitizeBody);
app.use(hpp());

// ---- Sessions (required before CSRF) ----
app.use(buildSessionMiddleware());

// ---- CSRF protection (cookie-independent, session-based) ----
// Exempt /track/whatsapp-click: it's a fire-and-forget analytics beacon sent
// via navigator.sendBeacon() (see public/js/whatsapp.js), which has no way to
// attach a CSRF token. Its controller is a no-op (res.status(204).end()) —
// it doesn't mutate any meaningful state, so CSRF protection isn't needed
// here in the first place.
const csrfProtection = csurf();
app.use((req, res, next) => {
  if (req.path === '/track/whatsapp-click') {
    return next();
  }
  return csrfProtection(req, res, next);
});

// ---- Static assets ----
app.use(
  express.static(path.join(__dirname, 'public'), {
    maxAge: process.env.NODE_ENV === 'production' ? '7d' : 0,
  })
);

// ---- Routes ----
app.use('/', routes);

// ---- 404 + error handling (always last) ----
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    logger.info(`Ephphatha Concepts server running on port ${PORT} [${process.env.NODE_ENV}]`);
  });
}

start();

module.exports = app;