const cloudinary = require('cloudinary').v2; // Cloudinary'nin 2. versiyonunu import et
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// .env dosyasındaki anahtarları kullanarak Cloudinary'yi yapılandır
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer için depolama ayarlarını yapılandır
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    // Cloudinary'de resimlerin yükleneceği klasör
    folder: 'blog_platform', 
    // İzin verilen formatlar (güvenlik için önemli)
    allowedFormats: ['jpeg', 'png', 'jpg'],
    // (Opsiyonel: Yüklerken resme dönüşüm uygulayabilirsiniz)
    // transformation: [{ width: 500, height: 500, crop: 'limit' }]
  },
});

// Yapılandırılmış 'storage'ı kullanarak multer'ı oluştur
const upload = multer({ storage: storage });

module.exports = upload; // Bu 'upload' middleware'ini dışa aktar