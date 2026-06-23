const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Default categories
const DEFAULT_CATEGORIES = {
  income: ['Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Other Income'],
  expense: ['Food', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Education', 'Rent', 'Utilities', 'Other'],
};

// @route  GET /api/categories
router.get('/', protect, (req, res) => {
  res.json({ success: true, data: DEFAULT_CATEGORIES });
});

module.exports = router;
