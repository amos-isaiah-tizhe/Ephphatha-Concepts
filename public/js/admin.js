// public/js/admin.js
(function () {
  'use strict';

  // ---- Auto-submit forms on select change (e.g. enquiry status dropdown) ----
  document.querySelectorAll('[data-auto-submit] select').forEach((select) => {
    select.addEventListener('change', () => {
      select.closest('form').submit();
    });
  });

  // ---- Confirm destructive actions ----
  document.querySelectorAll('[data-confirm]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      const message = form.dataset.confirm || 'Are you sure?';
      if (!window.confirm(message)) {
        e.preventDefault();
      }
    });
  });

  // ---- Live preview of selected image files before upload ----
  const fileInput = document.querySelector('[data-image-input]');
  const previewBox = document.querySelector('[data-image-preview]');

  if (fileInput && previewBox) {
    fileInput.addEventListener('change', () => {
      previewBox.innerHTML = '';
      Array.from(fileInput.files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = document.createElement('img');
          img.src = e.target.result;
          img.alt = file.name;
          previewBox.appendChild(img);
        };
        reader.readAsDataURL(file);
      });
    });
  }
})();
