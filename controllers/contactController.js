// controllers/contactController.js
const ContactSubmission = require('../models/ContactSubmission');
const { sendContactNotification, sendContactAutoReply } = require('../utils/mailer');
const { buildGenericWhatsAppLink } = require('../utils/whatsappLink');
const logger = require('../utils/logger');

function renderContactPage(req, res) {
  res.render('pages/contact', {
    title: 'Contact Us — Ephphatha Concepts Limited',
    description: 'Get in touch with Ephphatha Concepts Limited for construction, fashion, or general supply enquiries.',
    success: req.session.contactSuccess || false,
  });
  req.session.contactSuccess = false;
}

async function submitContactForm(req, res, next) {
  try {
    const { name, email, phone, service, message } = req.body;

    const submission = await ContactSubmission.create({
      name,
      email,
      phone,
      service: service || 'general',
      message,
      ip: req.ip,
    });

    const sent = await sendContactNotification({ name, email, phone, service, message });
    if (sent) {
      submission.notificationSent = true;
      await submission.save();
      await sendContactAutoReply({ name, email });
    }

    req.session.contactSuccess = true;
    return res.redirect('/contact#thank-you');
  } catch (err) {
    logger.error(`Contact form submission failed: ${err.message}`);
    return next(err);
  }
}

/** Multi-step quote request — stores submission and hands off to WhatsApp with prefilled context. */
async function submitQuoteRequest(req, res, next) {
  try {
    const { name, email, phone, service, scope, budget } = req.body;

    const compiledMessage = `Project scope: ${scope}${budget ? `\nBudget range: ${budget}` : ''}`;

    await ContactSubmission.create({
      name,
      email,
      phone,
      service,
      message: compiledMessage,
      ip: req.ip,
    });

    await sendContactNotification({ name, email, phone, service, message: compiledMessage });

    const whatsappMessage = encodeURIComponent(
      `Hello Ephphatha Concepts, I'm ${name}. I'd like a quote for ${service}.\nScope: ${scope}${
        budget ? `\nBudget: ${budget}` : ''
      }`
    );
    const whatsappUrl = `https://wa.me/${process.env.WHATSAPP_NUMBER}?text=${whatsappMessage}`;

    return res.json({ success: true, whatsappUrl });
  } catch (err) {
    next(err);
  }
}

module.exports = { renderContactPage, submitContactForm, submitQuoteRequest };
