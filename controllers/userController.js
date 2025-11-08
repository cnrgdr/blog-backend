const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const createTestTransporter = require('../config/emailConfig');
const nodemailer = require('nodemailer');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) { res.status(400); throw new Error('Kullanıcı zaten var'); }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({ username, email, password: hashedPassword });
    if (user) {
      res.status(201).json({ _id: user.id, username: user.username, email: user.email, role: user.role, token: generateToken(user._id) });
    } else { res.status(400); throw new Error('Geçersiz veri'); }
  } catch (error) { res.status(res.statusCode === 200 ? 500 : res.statusCode).json({ message: error.message }); }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (user && (await bcrypt.compare(password, user.password))) {
      if (user.isBlocked) { res.status(403); throw new Error('Hesabınız engellendi.'); }
      res.status(200).json({ _id: user.id, username: user.username, email: user.email, role: user.role, token: generateToken(user._id) });
    } else { res.status(401); throw new Error('Geçersiz e-posta veya şifre'); }
  } catch (error) { res.status(res.statusCode === 200 ? 500 : res.statusCode).json({ message: error.message }); }
};

const getMe = async (req, res) => { res.status(200).json(req.user); };

const getAllUsers = async (req, res) => {
  try {
    const keyword = req.query.search ? { $or: [{ username: { $regex: req.query.search, $options: 'i' } }, { email: { $regex: req.query.search, $options: 'i' } }] } : {};
    const users = await User.find(keyword).select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) { res.status(404); throw new Error('Kullanıcı bulunamadı'); }
    user.username = req.body.username || user.username;
    user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
    user.profileImage = req.file ? req.file.path : user.profileImage;
    if (req.body.username) {
        const exists = await User.findOne({username: req.body.username});
        if(exists && exists._id.toString() !== user._id.toString()) { res.status(400); throw new Error("Kullanıcı adı alınmış"); }
    }
    const updatedUser = await user.save();
    res.status(200).json({ _id: updatedUser.id, username: updatedUser.username, email: updatedUser.email, role: updatedUser.role, bio: updatedUser.bio, profileImage: updatedUser.profileImage });
  } catch (error) { res.status(res.statusCode === 200 ? 500 : res.statusCode).json({ message: error.message }); }
};

const forgotPassword = async (req, res) => {
    try {
      const user = await User.findOne({ email: req.body.email });
      if (!user) return res.status(200).json({ message: 'E-posta gönderildi.' });
      const resetToken = crypto.randomBytes(32).toString('hex');
      user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
      await user.save();
      const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
      const transporter = await createTestTransporter();
      const info = await transporter.sendMail({ from: '"Blog Admin" <no-reply@blog.com>', to: user.email, subject: 'Şifre Sıfırlama', html: `<a href="${resetUrl}">Şifremi Sıfırla</a>` });
      console.log('E-posta URL:', nodemailer.getTestMessageUrl(info));
      res.status(200).json({ message: 'E-posta gönderildi.' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const resetPassword = async (req, res) => {
    try {
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
        const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } });
        if (!user) { res.status(400); throw new Error('Geçersiz token'); }
        user.password = await bcrypt.hash(req.body.password, await bcrypt.genSalt(10));
        user.passwordResetToken = undefined; user.passwordResetExpires = undefined;
        await user.save();
        res.status(200).json({ message: 'Şifre sıfırlandı.' });
    } catch (error) { res.status(res.statusCode === 200 ? 500 : res.statusCode).json({ message: error.message }); }
}

const updatePassword = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('+password');
        if (!user || !(await bcrypt.compare(req.body.currentPassword, user.password))) { res.status(400); throw new Error('Mevcut şifre yanlış'); }
        user.password = await bcrypt.hash(req.body.newPassword, await bcrypt.genSalt(10));
        await user.save();
        res.status(200).json({ message: 'Şifre güncellendi' });
    } catch (error) { res.status(res.statusCode === 200 ? 500 : res.statusCode).json({ message: error.message }); }
}

const toggleBlockUser = async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) { res.status(404); throw new Error('Kullanıcı bulunamadı'); }
      if (user._id.toString() === req.user.id) { res.status(400); throw new Error('Kendinizi engelleyemezsiniz'); }
      user.isBlocked = !user.isBlocked;
      await user.save();
      res.status(200).json({ message: `Engel ${user.isBlocked ? 'getirildi' : 'kaldırıldı'}` });
    } catch (error) { res.status(res.statusCode === 200 ? 500 : res.statusCode).json({ message: error.message }); }
};
const getUserById = async (req, res) => {
  try {
    // Sadece güvenli alanları seçelim (şifre, email, rol GİZLİ kalsın)
    const user = await User.findById(req.params.id).select('username bio profileImage createdAt');

    if (!user) {
      res.status(404);
      throw new Error('Kullanıcı bulunamadı');
    }

    res.status(200).json(user);
  } catch (error) {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({ message: error.message });
  }
};

// --- DIŞA AKTARMA (En Önemli Kısım) ---
module.exports = {
  registerUser,
  loginUser,
  getMe,
  getAllUsers,     // <-- BUNUN BURADA OLDUĞUNDAN EMİN OLUN
  updateUserProfile,
  forgotPassword,
  resetPassword,
  updatePassword,
  toggleBlockUser,
  getUserById,
};