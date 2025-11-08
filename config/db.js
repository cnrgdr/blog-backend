const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // .env dosyasındaki MONGODB_URI adresini kullanarak bağlanmayı dene
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`MongoDB Bağlantısı Başarılı: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Bağlantı Hatası: ${error.message}`);
    // Hata olursa uygulamayı durdur
    process.exit(1); 
  }
};

module.exports = connectDB;