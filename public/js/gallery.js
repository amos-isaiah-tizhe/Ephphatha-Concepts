// public/js/gallery.js
(function () {
  'use strict';

  const grid = document.querySelector('[data-gallery-grid]');
  const filterButtons = document.querySelectorAll('[data-gallery-filter]');
  const modal = document.getElementById('galleryModal');

  if (!modal) return;

  const modalMediaImg = modal.querySelector('[data-modal-image]');
  const modalThumbs = modal.querySelector('[data-modal-thumbs]');
  const modalTitle = modal.querySelector('[data-modal-title]');
  const modalCategory = modal.querySelector('[data-modal-category]');
  const modalDesc = modal.querySelector('[data-modal-description]');
  const modalPrice = modal.querySelector('[data-modal-price]');
  const modalWhatsapp = modal.querySelector('[data-modal-whatsapp]');
  const closeBtn = modal.querySelector('[data-modal-close]');

  let lastFocusedEl = null;

  // ---- Category filtering (client-side, on portfolio page) ----
  if (filterButtons.length && grid) {
    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const category = btn.dataset.galleryFilter;
        const cards = grid.querySelectorAll('[data-card-category]');

        cards.forEach((card) => {
          const match =
            category === 'all' ||
            card.dataset.cardCategory === category ||
            card.dataset.cardSubcategory === category;
          card.style.display = match ? '' : 'none';
        });
      });
    });
  }

  // ---- Modal open/close ----
  function openModal(data) {
    modalTitle.textContent = data.title;
    modalCategory.textContent = data.serviceCategory;
    modalDesc.textContent = data.description;
    modalPrice.textContent = data.priceRange || 'Request Quote';
    modalWhatsapp.href = data.whatsappUrl;

    const images = data.images || [];
    if (images.length > 0) {
      modalMediaImg.src = images[0].url;
      modalMediaImg.alt = images[0].altText || data.title;
    }

    modalThumbs.innerHTML = '';
    images.forEach((img, i) => {
      const thumb = document.createElement('img');
      thumb.src = img.url;
      thumb.alt = img.altText || data.title;
      thumb.className = i === 0 ? 'active' : '';
      thumb.addEventListener('click', () => {
        modalMediaImg.src = img.url;
        modalMediaImg.alt = img.altText || data.title;
        modalThumbs.querySelectorAll('img').forEach((t) => t.classList.remove('active'));
        thumb.classList.add('active');
      });
      modalThumbs.appendChild(thumb);
    });

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocusedEl) lastFocusedEl.focus();
  }

  if (grid) {
    grid.addEventListener('click', async (e) => {
      const card = e.target.closest('[data-gallery-card]');
      if (!card) return;

      lastFocusedEl = card;
      const slug = card.dataset.slug;

      try {
        const res = await fetch(`/api/gallery/${encodeURIComponent(slug)}`);
        if (!res.ok) return;
        const data = await res.json();
        openModal(data);
      } catch (err) {
        // Fail silently in UI; the card link already offers direct navigation fallback.
        console.error('Failed to load gallery item', err);
      }
    });
  }

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });
})();
