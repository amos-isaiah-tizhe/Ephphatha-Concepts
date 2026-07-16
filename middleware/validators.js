// middleware/validators.js
const { body, validationResult } = require('express-validator');

const contactValidators = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 120 }),
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Enter a valid email').normalizeEmail(),
  body('phone').optional({ checkFalsy: true }).trim().isLength({ max: 30 }),
  body('service').optional({ checkFalsy: true }).trim().isIn(['construction', 'fashion', 'supply', 'general']),
  body('message').trim().notEmpty().withMessage('Message is required').isLength({ max: 3000 }),
  // Honeypot field — must stay empty. Bots that fill every field will trip this.
  body('company_website').custom((value) => {
    if (value) throw new Error('Spam detected');
    return true;
  }),
];

const quoteValidators = [
  body('name').trim().notEmpty().isLength({ max: 120 }),
  body('email').trim().notEmpty().isEmail().normalizeEmail(),
  body('phone').trim().notEmpty().isLength({ max: 30 }),
  body('service').trim().notEmpty().isIn(['construction', 'fashion', 'supply']),
  body('scope').trim().notEmpty().isLength({ max: 1000 }),
  body('budget').optional({ checkFalsy: true }).trim().isLength({ max: 60 }),
  body('company_website').custom((value) => {
    if (value) throw new Error('Spam detected');
    return true;
  }),
];

const loginValidators = [
  body('email').trim().notEmpty().isEmail().normalizeEmail(),
  body('password').notEmpty().isLength({ min: 6 }),
];

const galleryItemValidators = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 120 }),
  body('serviceCategory').trim().notEmpty().isIn(['construction', 'fashion', 'supply']),
  body('subCategory').optional({ checkFalsy: true }).trim().isLength({ max: 120 }),
  body('description').trim().notEmpty().withMessage('Description is required').isLength({ max: 2000 }),
  body('priceRange').optional({ checkFalsy: true }).trim().isLength({ max: 60 }),
];

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.validationErrors = errors.array();
    return next({ status: 400, validation: errors.array() });
  }
  next();
}

module.exports = {
  contactValidators,
  quoteValidators,
  loginValidators,
  galleryItemValidators,
  handleValidation,
};
