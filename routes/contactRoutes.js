// routes/contactRoutes.js
const express = require('express');
const router = express.Router();

const { submitContactForm, submitQuoteRequest } = require('../controllers/contactController');
const { contactValidators, quoteValidators, handleValidation } = require('../middleware/validators');
const { contactFormLimiter } = require('../middleware/rateLimiter');

router.get('/contact', (req, res) => {
  const success = req.session.contactSuccess || false;
  req.session.contactSuccess = false;
  res.render('pages/contact', {
    title: 'Contact Us — Ephphatha Concepts Limited',
    description: 'Get in touch with Ephphatha Concepts Limited for construction, fashion, or general supply enquiries.',
    success,
    csrfToken: req.csrfToken(),
  });
});

router.post('/contact', contactFormLimiter, contactValidators, handleValidation, submitContactForm);

router.post('/quote-request', contactFormLimiter, quoteValidators, handleValidation, submitQuoteRequest);

module.exports = router;
