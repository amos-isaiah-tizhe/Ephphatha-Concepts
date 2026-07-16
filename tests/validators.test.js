// tests/validators.test.js
const { test } = require('node:test');
const assert = require('node:assert');

const { buildWhatsAppLink, buildGenericWhatsAppLink } = require('../utils/whatsappLink');

test('buildWhatsAppLink includes phone, encoded title, and item id', () => {
  const url = buildWhatsAppLink('2348032157437', {
    title: 'Custom Agbada',
    category: 'fashion',
    description: 'Native attire tailoring',
    id: 'abc123',
  });

  assert.ok(url.startsWith('https://wa.me/2348032157437?text='));
  assert.ok(url.includes(encodeURIComponent('Custom Agbada')));
  assert.ok(url.includes('abc123'));
});

test('buildGenericWhatsAppLink returns a valid wa.me URL', () => {
  const url = buildGenericWhatsAppLink('2348032157437');
  assert.ok(url.startsWith('https://wa.me/2348032157437?text='));
});
