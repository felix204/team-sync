const jwt = require('jsonwebtoken');
const User = require('../model/userModel');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Token'ı al
      token = req.headers.authorization.split(' ')[1];

      // Token'ı doğrula
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // User'ı bul ve req.user'a ekle (şifre hariç)
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Yetkisiz erişim, token geçersiz');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Yetkisiz erişim, token bulunamadı');
  }
};

module.exports = { protect };