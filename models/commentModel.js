const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    // Yorumun içeriği
    text: {
      type: String,
      required: [true, 'Yorum içeriği boş olamaz'],
      trim: true,
    },
    
    // İlişki 1: Yorumu kim yaptı?
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // 'User' modeline referans
      required: true,
    },

    // İlişki 2: Yorum hangi yazıya yapıldı?
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post', // 'Post' modeline referans
      required: true,
    },
  },
  {
    // 'createdAt' ve 'updatedAt' alanlarını otomatik ekle
    timestamps: true,
  }
);

module.exports = mongoose.model('Comment', commentSchema);