const express = require('express');
const dotenv = require('dotenv');
const helmet = require('helmet');
const cors = require('cors');
const connectDB = require('./config/db');
const rateLimit = require('express-rate-limit');

dotenv.config();
const app = express();

// --- 1. GÜVENLİK ve TEMEL AYARLAR (EN BAŞTA OLMALI) ---
app.use(helmet());

// CORS Ayarları (HEMEN BURADA OLMALI)
const whitelist = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://blog-frontend-g5atsqsqx-cnrgdrs-projects.vercel.app',
  'https://blog-frontend-8fpq.vercel.app'
];
const corsOptions = {
  origin: function (origin, callback) {
    // (!origin kontrolü Insomnia/Postman için gereklidir)
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log("CORS Engellendi:", origin); // Debug için log eklemek iyidir
      callback(new Error('Bu site tarafından CORS erişimine izin verilmiyor'));
    }
  },
  credentials: true, // (Opsiyonel ama genellikle iyi bir fikirdir)
};
app.use(cors(corsOptions)); // <-- CORS'U BURAYA TAŞIDIK!

// JSON Parser (CORS'tan sonra olabilir)
app.use(express.json());

// --- 2. RATE LIMITER ---
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Çok fazla istekte bulundunuz.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', generalLimiter);

// --- 3. ROTALAR ---
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));

app.get('/', (req, res) => {
  res.send('Full-Stack Blog Platformu API Çalışıyor!');
});

// --- 4. SUNUCUYU BAŞLATMA ---
const PORT = process.env.PORT || 5000;
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor...`);
    });
  } catch (error) {
    console.log(error);
  }
};
startServer();