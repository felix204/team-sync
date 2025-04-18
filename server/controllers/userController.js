const User = require('../model/userModel');
const generateToken = require('../utils/generateToken');
const Message = require('../model/messageModel');

// @desc    Kullanıcı authenticate et ve token döndür
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Geçersiz e-posta veya şifre');
  }
};

// @desc    Yeni kullanıcı kaydı
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('Kullanıcı zaten mevcut');
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Geçersiz kullanıcı verisi');
  }
};

// @desc    Kullanıcı profili getir
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } else {
    res.status(404);
    throw new Error('Kullanıcı bulunamadı');
  }
};

// @desc    Kullanıcının günlük mesaj sayısını döndür
// @route   GET /api/users/message-count
// @access  Private
const getMessageCount = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const count = await Message.countDocuments({
      user: req.user._id,
      createdAt: { $gte: today }
    });
    
    res.json({ count });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

module.exports = { authUser, registerUser, getUserProfile, getMessageCount };