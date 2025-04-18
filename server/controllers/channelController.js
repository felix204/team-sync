const Channel = require('../model/channelModel');
const Message = require('../model/messageModel');

// @desc    Yeni kanal oluştur
// @route   POST /api/channels
// @access  Private
const createChannel = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Kanal adı kontrolü
    const channelExists = await Channel.findOne({ name });
    if (channelExists) {
      res.status(400);
      throw new Error('Bu isimde bir kanal zaten var');
    }
    
    // Yeni kanal oluştur
    const channel = await Channel.create({
      name,
      description,
      creator: req.user._id,
      members: [req.user._id] // Oluşturan kişiyi üye olarak ekle
    });
    
    res.status(201).json(channel);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

// @desc    Tüm kanalları getir
// @route   GET /api/channels
// @access  Private
const getChannels = async (req, res) => {
  try {
    const channels = await Channel.find()
      .populate('creator', 'name')
      .select('-members'); // Üye listesini çıkar
      
    res.json(channels);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

// @desc    Kanala katıl
// @route   POST /api/channels/:id/join
// @access  Private
const joinChannel = async (req, res) => {
  try {
    const channelId = req.params.id;
    const userId = req.user._id;
    
    const channel = await Channel.findById(channelId);
    
    if (!channel) {
      res.status(404);
      throw new Error('Kanal bulunamadı');
    }
    
    // Kullanıcı zaten üye mi kontrol et
    if (channel.members.includes(userId)) {
      res.status(400);
      throw new Error('Zaten bu kanala üyesiniz');
    }
    
    // Kanala üye ekle
    channel.members.push(userId);
    await channel.save();
    
    res.json({ message: 'Kanala başarıyla katıldınız' });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

// @desc    Kanal mesajlarını getir
// @route   GET /api/channels/:id/messages
// @access  Private
const getChannelMessages = async (req, res) => {
  try {
    const channelId = req.params.id;
    
    // Kanal kontrolü
    const channel = await Channel.findById(channelId);
    if (!channel) {
      res.status(404);
      throw new Error('Kanal bulunamadı');
    }
    
    // Kullanıcı üye mi kontrol et
    if (!channel.members.includes(req.user._id)) {
      res.status(403);
      throw new Error('Bu kanala erişim yetkiniz yok');
    }
    
    // Son 50 mesajı getir
    const messages = await Message.find({ channel: channelId })
      .sort({ createdAt: -1 })
      .limit(50);
      
    res.json(messages.reverse()); // Kronolojik sırayla döndür
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

module.exports = { createChannel, getChannels, joinChannel, getChannelMessages }; 