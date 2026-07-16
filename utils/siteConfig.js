// utils/siteConfig.js

/**
 * Central, env-driven site configuration exposed to every EJS view via
 * res.locals.site (see middleware wiring in server.js).
 *
 * Nothing here is hardcoded — the developer/brand attribution in the footer
 * partial reads directly from these values, which come from .env.
 */
function getSiteConfig() {
  return {
    name: 'Ephphatha Concepts Limited',
    developer: {
      name: process.env.DEVELOPER_NAME,
      url: process.env.DEVELOPER_URL,
      brand: process.env.DEVELOPER_BRAND,
      brandUrl: process.env.BRAND_URL,
    },
    contact: {
      phone: process.env.WHATSAPP_NUMBER, // digits only, e.g. 2348032157437
      email: process.env.CONTACT_TO_EMAIL,
      address: {
        line1: 'No 7, Before Dunamis Church, Igbanomeji Otukpo',
        line2: 'Major Sam Olokpo Close, Otukpo Town, Benue State, Nigeria',
      },
      cac: {
        regNo: '9437252',
        tin: '2620746298275',
      },
    },
    meta: {
      year: new Date().getFullYear(),
      baseUrl: process.env.BASE_URL || 'http://localhost:3000',
    },
  };
}

module.exports = { getSiteConfig };
