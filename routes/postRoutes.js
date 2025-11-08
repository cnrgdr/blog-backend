const express = require('express');
const router = express.Router();
const { 
  createPost, 
  getPosts, 
  getPostById,
  updatePost,
  deletePost,
  searchPosts // <--- 1. searchPosts'u import et
} = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../config/cloudinaryConfig');
const commentRouter = require('./commentRoutes');

// --- /api/posts için rotalar ---
router.route('/')
  .get(getPosts)
  .post(protect, upload.single('coverImage'), createPost); 

// --- 2. YENİ ARAMA ROTASI (/:id'den ÖNCE!) ---
// GET /api/posts/search?q=terim
router.get('/search', searchPosts);
router.use('/:postId/comments', commentRouter);

// --- /api/posts/:id için rotalar ---
router.route('/:id')
  .get(getPostById)
  .put(protect, updatePost) // TODO: Buna da resim yükleme eklenecek
  .delete(protect, deletePost);

module.exports = router;