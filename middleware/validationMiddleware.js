const { body, validationResult } = require('express-validator');

// Tüm doğrulama kurallarından sonra çalışacak hata yakalayıcı
const validate = (req, res, next) => {
  // validationResult, istekte herhangi bir hata olup olmadığını kontrol eder
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    // Hata yoksa, devam et (controller'a git)
    return next();
  }

  // Hata varsa, hataları daha okunabilir bir formatta topla
  const extractedErrors = [];
  errors.array().map(err => extractedErrors.push({ [err.path]: err.msg }));

  // 400 (Bad Request) hatası ile hataları JSON olarak döndür
  return res.status(400).json({
    errors: extractedErrors,
  });
};

// --- Kural Setleri ---

// Kayıt (Register) için kurallar
const registerRules = () => {
  return [
    // username boş olamaz
    body('username')
      .trim()
      .notEmpty()
      .withMessage('Kullanıcı adı zorunludur'),
    
    // email geçerli bir formatta olmalı
    body('email')
      .isEmail()
      .withMessage('Geçerli bir e-posta adresi girin')
      .normalizeEmail(), // (örn: Test@gmail.com -> test@gmail.com yapar)
    
    // password en az 6 karakter olmalı
    body('password')
      .isLength({ min: 6 })
      .withMessage('Şifre en az 6 karakter olmalıdır'),
  ];
};

// Giriş (Login) için kurallar
const loginRules = () => {
  return [
    body('email')
      .isEmail()
      .withMessage('Geçerli bir e-posta adresi girin')
      .normalizeEmail(),
      
    body('password')
      .notEmpty()
      .withMessage('Şifre zorunludur'),
  ];
};

const resetPasswordRules = () => {
  return [
    body('password')
      .isLength({ min: 6 })
      .withMessage('Yeni şifre en az 6 karakter olmalıdır'),
  ];
};

// module.exports'ü GÜNCELLE
module.exports = {
  validate,
  registerRules,
  loginRules,
  resetPasswordRules, // <--- BURAYA EKLE
};