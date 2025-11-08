// Gerekli paketleri içe aktar
const express = require('express');
const dotenv = require('dotenv');
const helmet = require('helmet');
const cors = require('cors');
const connectDB = require('./config/db');
const rateLimit = require('express-rate-limit'); // <-- YENİ İMPORT
// .env dosyasındaki değişkenleri yükle
dotenv.config();

// Express uygulamasını başlat
const app = express();
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, 
  message: 'Çok fazla istekte bulundunuz. Lütfen daha sonra tekrar deneyin.',
  standardHeaders: true, 
  legacyHeaders: false,
});
// --- Güvenlik Middleware (Ara Katmanları) ---
app.use(helmet()); 
app.use(express.json()); // Gelen JSON verilerini parse etmek için
app.use('/api', generalLimiter);
// PORT DEĞİŞKENİNİ TANIMLA (Muhtemelen eksik olan satır bu)
const PORT = process.env.PORT || 5000;
const whitelist = [
  'http://localhost:3000', // React geliştirme sunucusu
  'http://localhost:5173',
  'https://blog-frontend-g5atsqsqx-cnrgdrs-projects.vercel.app'
];const corsOptions = {
  origin: function (origin, callback) {
    // 'origin' yoksa (Postman/Insomnia gibi araçlar) veya beyaz listedeyse izin ver
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Bu site tarafından CORS erişimine izin verilmiyor'));
    }
  },
};
app.use(cors(corsOptions));
app.use(express.json());
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));
app.get('/', (req, res) => {
  res.send('Full-Stack Blog Platformu API Çalışıyor!');
});

// --- API ROTALARI ---
// /api/users ile başlayan tüm istekleri 'userRoutes' dosyasına yönlendir.
app.use('/api/users', require('./routes/userRoutes')); 
app.use('/api/posts', require('./routes/postRoutes'));
// --- Sunucuyu Başlatma ---
const startServer = async () => {
  try {
    await connectDB(); // Önce veritabanına bağlan
    app.listen(PORT, () => {
      console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor...`);
    });
  } catch (error) {
    console.log(error);
  }
};

startServer(); // Sunucuyu ve veritabanı bağlantısını başlatan fonksiyonu çağır