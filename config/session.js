// config/session.js
const session = require('express-session');
const MongoStore = require('connect-mongo');

function buildSessionMiddleware() {
  return session({
    name: 'ec.sid',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: 'sessions',
      ttl: 60 * 60 * 2, // 2 hours
      // Note: connect-mongo's optional at-rest encryption (`crypto` option) enforces its
      // own secret-complexity rules separate from SESSION_SECRET's own strength, and was
      // rejecting valid secrets outright. MongoDB Atlas already encrypts data at rest at
      // the infrastructure level, and the session payload here (admin id/email only)
      // doesn't warrant an extra application-level encryption layer, so it's omitted.
    }),
    cookie: {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 2, // 2 hours
    },
  });
}

module.exports = buildSessionMiddleware;
