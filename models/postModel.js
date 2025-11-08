const mongoose = require('mongoose');

// Yazı veritabanı şemasını (kalıbını) oluştur
const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Başlık zorunludur'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'İçerik zorunludur'],
    },
    // Bu alan, yazının kapak fotoğrafının URL'sini tutacak (Cloudinary)
    coverImage: {
      type: String,
      default: null, // Varsayılan olarak kapak fotoğrafı yok
    },
    
    // --- EN ÖNEMLİ ALAN ---
    // Bu yazı hangi kullanıcıya ait?
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', 
      required: true,
    },
    categories: [ // Bir dizi (array) olarak tanımlıyoruz
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category', // 'Category' modeline referans veriyoruz
      }
    ],
    // Planladığımız 'kategoriler' ve 'yorumlar' buraya daha sonra eklenecek.
  },
  {
    timestamps: true,
  }
);

// Şemayı kullanarak 'Post' adında bir model oluştur ve dışa aktar
module.exports = mongoose.model('Post', postSchema);