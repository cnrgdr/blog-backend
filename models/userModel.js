const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Kullanıcı adı zorunludur'],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'E-posta zorunludur'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Şifre zorunludur'],
      select: false, // Şifreyi varsayılan olarak getirme (güvenlik için)
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    // --- YENİ ALAN: ENGEL DURUMU ---
    isBlocked: {
      type: Boolean,
      default: false,
    },
    // ------------------------------
    bio: {
      type: String,
      default: '',
      maxLength: 250
    },
    profileImage: {
      type: String,
      default: null,
    },
    passwordResetToken: {
      type: String,
      default: null,
    },
    passwordResetExpires: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);