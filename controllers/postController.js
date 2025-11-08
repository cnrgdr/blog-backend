const Post = require('../models/postModel');
const User = require('../models/userModel');

// --- YENİ YAZI OLUŞTURMA ---
// (Bu fonksiyon zaten vardı, aynen kalıyor)
const createPost = async (req, res) => {
  try {
    // 1. 'title', 'content' VE 'categories'i req.body'den al
    // (Resim 'multipart-form' ile geldiği için kategoriler de string olarak gelebilir)
    const { title, content, categories } = req.body;

    if (!title || !content) {
      res.status(400);
      throw new Error('Lütfen başlık ve içerik alanlarını doldurun');
    }

    // 2. Resim URL'sini al
    // Eğer 'upload' middleware'i bir dosya yüklediyse, 'req.file' mevcut olacak
   const coverImageUrl = req.file ? req.file.path : null;
   let categoryIds = [];
    if (categories) {
      // Kategoriler 'form-data' ile '["id1","id2"]' veya 'id1,id2'
      // şeklinde bir string olarak gelebilir. JSON'a çevirelim.
      try {
        // Eğer string gelirse [id1, id2] formatına çevir
        // Apidog/Postman 'form-data'da dizileri böyle gönderebilir:
        if (typeof categories === 'string') {
            // "id1,id2" şeklinde gelirse
            if(categories.includes(',')) {
                categoryIds = categories.split(',');
            } else {
                // Sadece bir ID string olarak geldiyse
                categoryIds = [categories];
            }
        } else if (Array.isArray(categories)) {
            // Zaten bir dizi olarak geldiyse
            categoryIds = categories;
        }
      } catch (e) {
        console.warn("Kategori formatı işlenemedi:", categories);
        // Hata olursa boş dizi olarak devam et
      }
    }
    // 3. Yazıyı oluştur
   const post = await Post.create({
      title,
      content,
      author: req.user.id,
      coverImage: coverImageUrl, 
      categories: categoryIds, 
    });
    const populatedPost = await Post.findById(post._id)
                                    .populate('author', 'username')
                                    .populate('categories', 'name');
    res.status(201).json(populatedPost);
  
  } catch (error) {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({ message: error.message });
  }
};

// --- TÜM YAZILARI ALMA (GÜNCELLENMİŞ) ---
const getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    // URL'den hem 'author' hem de 'category' parametrelerini al
    const { author, category } = req.query;

    const skip = (page - 1) * limit;

    // Dinamik filtre oluştur
    const filter = {};
    if (author) filter.author = author;
    if (category) filter.categories = category; // 'categories' dizisinde bu ID var mı diye bakar

    const totalPosts = await Post.countDocuments(filter);
    
    // Sorguya filtreyi uygula
    const posts = await Post.find(filter)
      // --- KRİTİK GÜNCELLEME BURADA ---
      // Sadece 'username' değil, 'profileImage'ı da istiyoruz!
      .populate('author', 'username profileImage') 
      .populate('categories', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
      totalPosts: totalPosts,
      posts: posts,
    });

  } catch (error) {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({ message: error.message });
  }
};

// --- YENİ FONKSİYON: TEK BİR YAZIYI ID İLE ALMA ---
// @desc    ID ile tek bir yazı alır
// @route   GET /api/posts/:id
// @access  Public
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
                          // --- KRİTİK GÜNCELLEME ---
                          .populate('author', 'username profileImage')
                          .populate('categories', 'name');

    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404); // 404 = Not Found (Bulunamadı)
      throw new Error('Yazı bulunamadı');
    }
  } catch (error) {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({ message: error.message });
  }
};

// --- YENİ FONKSİYON: YAZI GÜNCELLEME ---
// @desc    ID ile bir yazıyı günceller
// @route   PUT /api/posts/:id
// @access  Private (Sadece yazar)
const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      res.status(404);
      throw new Error('Yazı bulunamadı');
    }

    // --- YETKİLENDİRME KONTROLÜ ---
    // Giriş yapan kullanıcı (req.user) bu yazının yazarı mı?
    // Not: post.author bir Mongoose ObjectId'sidir, req.user.id ise string.
    // Bu yüzden .toString() ile karşılaştırma yaparız.
 if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      res.status(401); // 401 = Unauthorized (Yetkisiz)
      throw new Error('Yetkiniz yok. Bu işlemi sadece yazının sahibi veya adminler yapabilir.');
    }
    // Kullanıcı yazarsa, yazıyı güncelle
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id, // Hangi yazı
      req.body,      // Yeni veri (örn: { title, content })
      { new: true }   // Ayar: Bize güncellenmiş (yeni) halini döndür
    );

    res.status(200).json(updatedPost);

  } catch (error) {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({ message: error.message });
  }
};

// --- YENİ FONKSİYON: YAZI SİLME ---
// @desc    ID ile bir yazıyı siler
// @route   DELETE /api/posts/:id
// @access  Private (Sadece yazar)
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      res.status(404);
      throw new Error('Yazı bulunamadı');
    }

    // --- YETKİLENDİRME KONTROLÜ ---
   if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      res.status(401); 
      throw new Error('Yetkiniz yok. Bu işlemi sadece yazının sahibi veya adminler yapabilir.');
    }
    // Kullanıcı yazarsa, yazıyı sil
    await post.deleteOne(); // veya Post.findByIdAndDelete(req.params.id)

    res.status(200).json({ id: req.params.id, message: 'Yazı başarıyla silindi' });

  } catch (error) {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({ message: error.message });
  }
};
const searchPosts = async (req, res) => {
  try {
    // 1. URL'den 'q' (query - sorgu) parametresini al
    const query = req.query.q;

    if (!query) {
      res.status(400);
      throw new Error("Lütfen bir arama terimi ('q') girin");
    }

    // 2. MongoDB Aggregation Pipeline ve $search kullan
    const posts = await Post.aggregate([
      {
        $search: {
          // Atlas Search'te oluşturduğunuz indeksin adı
          // (Eğer farklı bir isim verdiyseniz bunu değiştirin)
          index: 'default', 
          text: {
            query: query,
            // 'title' ve 'content' alanlarında ara
            path: ['title', 'content'], 
            // (Opsiyonel: Yazım hatalarını da tolere et)
            fuzzy: {
              maxEdits: 2, 
            },
          },
        },
      },
      // (Opsiyonel: Aramadan sonra 20 sonuçla sınırla)
      { $limit: 20 },
    ]);
    
    // 3. Aggregation, populate'i bozduğu için, sonuçları MANUEL populate edelim
    // Bu, arama sonuçlarına yazar adlarını eklememizi sağlar.
    const populatedPosts = await Post.populate(posts, {
      path: 'author',
      select: 'username', // Sadece username'i al
    });

    res.status(200).json(populatedPosts);

  } catch (error) {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({ message: error.message });
  }
};


// module.exports'ü GÜNCELLE (yeni fonksiyonları ekle)
module.exports = {
  createPost,
  getPosts,
  getPostById, // <--- EKLE
  updatePost,  // <--- EKLE
  deletePost,
  searchPosts,  // <--- EKLE
};