const nodemailer = require('nodemailer');

// Bu fonksiyon, Ethereal üzerinde BİZE ÖZEL bir
// test hesabı oluşturur ve bir 'transporter' nesnesi döndürür.
const createTestTransporter = async () => {
  try {
    // Yeni bir test hesabı oluştur
    const testAccount = await nodemailer.createTestAccount();

    // Ethereal'in sağladığı SMTP bilgileriyle bir transporter oluştur
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // Ethereal'den gelen sahte kullanıcı adı
        pass: testAccount.pass, // Ethereal'den gelen sahte şifre
      },
    });

    console.log("Ethereal test hesabı oluşturuldu. Kullanıcı: " + testAccount.user);
    return transporter;

  } catch (error) {
    console.error("Ethereal hesabı oluşturulamadı: ", error);
  }
};

module.exports = createTestTransporter;