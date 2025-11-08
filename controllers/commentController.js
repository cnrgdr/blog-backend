const Comment = require('../models/commentModel');
const Post = require('../models/postModel');

const getCommentsForPost = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate('author', 'username profileImage').sort({ createdAt: -1 });
    res.status(200).json(comments);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const createComment = async (req, res) => {
  try {
    if (!req.body.text) { res.status(400); throw new Error('İçerik boş olamaz'); }
    const comment = await Comment.create({ text: req.body.text, author: req.user.id, post: req.params.postId });
    const populatedComment = await Comment.findById(comment._id).populate('author', 'username profileImage');
    res.status(201).json(populatedComment);
  } catch (error) {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode); res.json({ message: error.message });
  }
};

// --- YENİ: YORUM SİLME ---
const deleteComment = async (req, res) => {
    try {
      const comment = await Comment.findById(req.params.id);
      if (!comment) { res.status(404); throw new Error('Yorum bulunamadı'); }
      // Yorum sahibi veya Admin silebilir
      if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
        res.status(403); throw new Error('Yetkiniz yok');
      }
      await comment.deleteOne();
      res.status(200).json({ message: 'Yorum silindi' });
    } catch (error) {
      const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
      res.status(statusCode); res.json({ message: error.message });
    }
  };

module.exports = { getCommentsForPost, createComment, deleteComment };