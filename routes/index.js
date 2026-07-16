// routes/index.js
const express = require('express');
const router = express.Router();

const publicRoutes = require('./publicRoutes');
const contactRoutes = require('./contactRoutes');
const authRoutes = require('./authRoutes');
const adminRoutes = require('./adminRoutes');

router.use('/', publicRoutes);
router.use('/', contactRoutes);
router.use('/admin', authRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
