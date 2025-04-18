const express = require('express');
const { authUser, registerUser, getUserProfile, getMessageCount } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/login', authUser);
router.post('/register', registerUser);
router.get('/profile', protect, getUserProfile);
router.get('/message-count', protect, getMessageCount);

module.exports = router;