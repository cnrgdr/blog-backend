const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Kategori adı zorunludur'],
    unique: true, // Her kategori adı benzersiz olmalı
    trim: true,
  },
  // (Opsiyonel: kategoriye bir açıklama da ekleyebiliriz)
  // description: {
  //   type: String,
  //   trim: true,
  // },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Category', categorySchema);