// seed/seedAdmin.js
require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const AdminUser = require('../models/AdminUser');
const logger = require('../utils/logger');

(async () => {
  try {
    if (!process.env.ADMIN_DEFAULT_EMAIL || !process.env.ADMIN_DEFAULT_PASSWORD) {
      logger.error('ADMIN_DEFAULT_EMAIL and ADMIN_DEFAULT_PASSWORD must be set in .env to run this seed script.');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);

    const email = process.env.ADMIN_DEFAULT_EMAIL.toLowerCase();
    const existing = await AdminUser.findOne({ email });

    if (existing) {
      logger.info(`Admin user "${email}" already exists — skipping seed.`);
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(process.env.ADMIN_DEFAULT_PASSWORD, 12);

    await AdminUser.create({
      email,
      passwordHash,
      mustChangePassword: true,
      role: 'superadmin',
    });

    logger.info(`Admin user "${email}" created successfully.`);
    logger.warn('Log in immediately and rotate/remove ADMIN_DEFAULT_PASSWORD from your .env file.');
    process.exit(0);
  } catch (err) {
    logger.error(`Admin seed failed: ${err.message}`);
    process.exit(1);
  }
})();
