const express = require('express');
const router = express.Router({ mergeParams: true });
const { protect, isAdmin } = require('../middleware/authMiddleware');
const { getCommentsForPost, createComment, deleteComment } = require('../controllers/commentController');

router.route('/')
  .get(getCommentsForPost)
  .post(protect, createComment);

// --- YENİ SİLME ROTASI ---
// Bu rota '/api/comments/:id' adresinde çalışacak (index.js sayesinde)
router.delete('/:id', protect, deleteComment);

module.exports = router;