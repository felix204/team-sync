const express = require('express');
const { 
  createChannel, 
  getChannels,
  joinChannel,
  getChannelMessages
} = require('../controllers/channelController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Tüm rotalarda auth gerekli
router.use(protect);

router.route('/')
  .post(createChannel)
  .get(getChannels);

router.post('/:id/join', joinChannel);
router.get('/:id/messages', getChannelMessages);

module.exports = router;