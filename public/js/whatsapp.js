// public/js/whatsapp.js
(function () {
  'use strict';

  document.querySelectorAll('[data-whatsapp-track]').forEach((link) => {
    link.addEventListener('click', () => {
      try {
        navigator.sendBeacon('/track/whatsapp-click', JSON.stringify({ href: link.href }));
      } catch (err) {
        // Non-critical — never block the WhatsApp redirect on analytics failure.
      }
    });
  });
})();
