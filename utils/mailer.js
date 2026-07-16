// utils/mailer.js
const resend = require('../config/resend');
const logger = require('./logger');

/**
 * Sends the internal notification email to the company when a contact
 * form / quote request is submitted.
 */
async function sendContactNotification({ name, email, phone, service, message }) {
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL || 'no-reply@ephphathaconcepts.com';

  try {
    await resend.emails.send({
      from: `Ephphatha Concepts Website <${from}>`,
      to,
      replyTo: email,
      subject: `New enquiry: ${service || 'General'} — ${name}`,
      html: `
        <h2>New website enquiry</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(phone || 'Not provided')}</p>
        <p><strong>Service of interest:</strong> ${escapeHtml(service || 'Not specified')}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
      `,
    });
    return true;
  } catch (err) {
    logger.error(`Resend notification failed: ${err.message}`);
    return false;
  }
}

/** Sends a short auto-reply confirmation to the person who submitted the form. */
async function sendContactAutoReply({ name, email }) {
  const from = process.env.CONTACT_FROM_EMAIL || 'no-reply@ephphathaconcepts.com';

  try {
    await resend.emails.send({
      from: `Ephphatha Concepts <${from}>`,
      to: email,
      subject: 'We received your message — Ephphatha Concepts',
      html: `
        <p>Hi ${escapeHtml(name)},</p>
        <p>Thank you for reaching out to Ephphatha Concepts Limited. We've received your message
        and a member of our team will get back to you shortly.</p>
        <p>If your enquiry is urgent, you can also reach us directly on WhatsApp.</p>
        <p>— Ephphatha Concepts Team</p>
      `,
    });
    return true;
  } catch (err) {
    logger.error(`Resend auto-reply failed: ${err.message}`);
    return false;
  }
}

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

module.exports = { sendContactNotification, sendContactAutoReply };
