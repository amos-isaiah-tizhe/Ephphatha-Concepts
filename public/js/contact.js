// public/js/contact.js
(function () {
  'use strict';

  const form = document.getElementById('quoteForm');
  if (!form) return;

  const errorEl = document.getElementById('quoteFormError');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.style.display = 'none';

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    const csrfToken = payload._csrf;

    try {
      const res = await fetch('/quote-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'CSRF-Token': csrfToken,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        errorEl.textContent = (data && data.error) || 'Something went wrong. Please try again.';
        errorEl.style.display = 'block';
        return;
      }

      window.open(data.whatsappUrl, '_blank', 'noopener,noreferrer');
      form.reset();
    } catch (err) {
      errorEl.textContent = 'Network error — please check your connection and try again.';
      errorEl.style.display = 'block';
    }
  });
})();
