const Category = require('../models/categoryModel');

// @desc    Yeni bir kategori oluşturur
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      res.status(400);
      throw new Error('Kategori adı zorunludur');
    }

    // Kategoriyi küçük harfe çevir (tutarlılık için)
    const normalizedName = name.toLowerCase().trim();
    
    const categoryExists = await Category.findOne({ name: normalizedName });
    if (categoryExists) {
      res.status(400);
      throw new Error('Bu kategori zaten mevcut');
    }

    const category = await Category.create({
      name: normalizedName,
    });

    res.status(201).json(category);

  } catch (error) {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({ message: error.message });
  }
};

// @desc    Tüm kategorileri listeler
// @route   GET /api/categories
// @access  Public
const getAllCategories = async (req, res) => {
  try {
    // Tüm kategorileri bul ve isme göre (alfabetik) sırala
    const categories = await Category.find({}).sort({ name: 1 });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu Hatası' });
  }
};
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      res.status(404);
      throw new Error('Kategori bulunamadı');
    }

    await category.deleteOne();
    res.status(200).json({ message: 'Kategori silindi', id: req.params.id });

  } catch (error) {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({ message: error.message });
  }
};
// (Silme ve Güncelleme fonksiyonları daha sonra eklenebilir)

module.exports = {
  createCategory,
  getAllCategories,
  deleteCategory,
};