const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { 
  registerUser, 
  loginUser, 
  getMe, 
  getAllUsers, 
  updateUserProfile, 
  forgotPassword, 
  resetPassword, 
  updatePassword, 
  toggleBlockUser 
} = require('../controllers/userController');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const { validate, registerRules, loginRules, resetPasswordRules } = require('../middleware/validationMiddleware');
const upload = require('../config/cloudinaryConfig');
const { 
  // ...
  getUserById // <-- 1. İMPORT ET
} = require('../controllers/userController');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
});

// --- ROTALAR ---
router.get('/', protect, isAdmin, getAllUsers);
router.put('/:id/block', protect, isAdmin, toggleBlockUser);

router.post('/register', authLimiter, registerRules(), validate, registerUser);
router.post('/login', authLimiter, loginRules(), validate, loginUser);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPasswordRules(), validate, resetPassword);
router.get('/:id', getUserById);
router.put('/update-password', protect, updatePassword);
router.route('/profile')
  .get(protect, getMe)
  .put(protect, upload.single('profileImage'), updateUserProfile);

module.exports = router;