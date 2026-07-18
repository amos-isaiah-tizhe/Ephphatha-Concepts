// public/js/admin.js
(function () {
  'use strict';

  // ---- Mobile sidebar drawer (hamburger + overlay + close button + Escape key) ----
  const sidebarToggle = document.getElementById('adminSidebarToggle');
  const sidebar = document.getElementById('adminSidebar');
  const sidebarOverlay = document.getElementById('adminSidebarOverlay');
  const sidebarClose = document.getElementById('adminSidebarClose');

  if (sidebarToggle && sidebar) {
    function openSidebar() {
      sidebar.classList.add('is-open');
      if (sidebarOverlay) sidebarOverlay.classList.add('is-open');
      sidebarToggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
      sidebar.classList.remove('is-open');
      if (sidebarOverlay) sidebarOverlay.classList.remove('is-open');
      sidebarToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    sidebarToggle.addEventListener('click', () => {
      const isOpen = sidebar.classList.contains('is-open');
      if (isOpen) {
        closeSidebar();
      } else {
        openSidebar();
      }
    });

    if (sidebarClose) {
      sidebarClose.addEventListener('click', closeSidebar);
    }

    // Tapping the dimmed backdrop (empty space outside the drawer) closes it.
    if (sidebarOverlay) {
      sidebarOverlay.addEventListener('click', closeSidebar);
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && sidebar.classList.contains('is-open')) {
        closeSidebar();
      }
    });

    // Close the drawer when a sidebar link is clicked (mobile).
    sidebar.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeSidebar);
    });
  }

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
