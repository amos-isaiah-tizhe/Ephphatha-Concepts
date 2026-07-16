// config/env.js
require('dotenv').config();

const required = [
  'MONGODB_URI',
  'SESSION_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'RESEND_API_KEY',
  'CONTACT_TO_EMAIL',
  'WHATSAPP_NUMBER',
  'DEVELOPER_NAME',
  'DEVELOPER_URL',
  'DEVELOPER_BRAND',
  'BRAND_URL',
];

function validateEnv() {
  const missing = required.filter((key) => !process.env[key] || process.env[key].trim() === '');

  if (missing.length > 0) {
    // eslint-disable-next-line no-console
    console.error(
      `\n[FATAL] Missing required environment variable(s): ${missing.join(', ')}\n` +
        'Copy .env.example to .env and fill in real values before starting the server.\n'
    );
    process.exit(1);
  }
}

module.exports = { validateEnv };
