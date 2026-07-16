// utils/whatsappLink.js

/**
 * Builds a wa.me deep link pre-filled with context about a specific
 * gallery/project item so a visitor's WhatsApp message arrives ready-made.
 *
 * @param {string} phone - digits-only phone number with country code (from env)
 * @param {object} item - { title, category, description, id }
 * @returns {string} full https://wa.me/... URL
 */
function buildWhatsAppLink(phone, item = {}) {
  const { title = '', category = '', description = '', id = '' } = item;

  const lines = [
    `Hello Ephphatha Concepts, I'm interested in: "${title}"${category ? ` (${category})` : ''}.`,
  ];

  if (description) {
    const trimmed = description.length > 160 ? `${description.slice(0, 160)}…` : description;
    lines.push(`Details: ${trimmed}`);
  }

  lines.push('Please share pricing/availability.');

  if (id) {
    lines.push(`[Item ID: ${id}]`);
  }

  const message = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/${phone}?text=${message}`;
}

/** Generic (non-item-specific) WhatsApp link used by the header/floating button. */
function buildGenericWhatsAppLink(phone) {
  const message = encodeURIComponent(
    'Hello Ephphatha Concepts, I would like to know more about your services.'
  );
  return `https://wa.me/${phone}?text=${message}`;
}

module.exports = { buildWhatsAppLink, buildGenericWhatsAppLink };
