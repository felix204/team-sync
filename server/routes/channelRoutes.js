const express = require('express');
const { 
  createChannel, 
  getChannels,
  joinChannel,
  getChannelMessages,
  deleteChannelMessages
} = require('../controllers/channelController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();


router.use(protect);


router.route('/')
  .get(getChannels)
  .post(createChannel);

router.post('/:id/join', joinChannel);
router.get('/:id/messages', getChannelMessages);
router.delete('/:id/messages', deleteChannelMessages);

module.exports = router;