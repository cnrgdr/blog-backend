const express = require('express');
const router = express.Router();
const { 
  createCategory, 
  getAllCategories 
} = require('../controllers/categoryController');
const { protect, isAdmin } = require('../middleware/authMiddleware');
// (Validation middleware'i de eklenebilir)

// GET /api/categories (Herkesten açık)
// POST /api/categories (Sadece admin)
router.route('/')
  .get(getAllCategories)
  .post(protect, isAdmin, createCategory);

module.exports = router;