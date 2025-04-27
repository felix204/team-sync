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

// @desc    Kanal mesajlarını sil
// @route   DELETE /api/channels/:id/messages
// @access  Private
const deleteChannelMessages = async (req, res) => {
  try {
    const channelId = req.params.id;
    
    // Kanal kontrolü
    const channel = await Channel.findById(channelId);
    if (!channel) {
      res.status(404);
      throw new Error('Kanal bulunamadı');
    }
    
    // Kullanıcı kanalın yaratıcısı mı veya üyesi mi kontrol et
    const isCreator = String(channel.creator) === String(req.user._id);
    const isMember = channel.members.some(id => String(id) === String(req.user._id));
    
    if (!isCreator && !isMember) {
      res.status(403);
      throw new Error('Bu işlem için yetkiniz yok');
    }
    
    // Tüm mesajları sil
    await Message.deleteMany({ channel: channelId });
    
    res.json({ message: 'Tüm mesajlar başarıyla silindi' });
  } catch (error) {
    console.error('deleteChannelMessages hatası:', error.message);
    res.status(400).send(error.message);
  }
};

// @desc    Kanal mesajlarını getir
// @route   GET /api/channels/:id/messages
// @access  Private
const getChannelMessages = async (req, res) => {
  try {
    const channelId = req.params.id;
    console.log('Mesajlar isteniyor - Kanal ID:', channelId);
    console.log('İsteği yapan kullanıcı:', req.user?._id);
    
    // Kanal kontrolü
    const channel = await Channel.findById(channelId);
    if (!channel) {
      console.log('Kanal bulunamadı:', channelId);
      res.status(404);
      throw new Error('Kanal bulunamadı');
    }
    
    console.log('Kanal bulundu:', channel.name);
    console.log('Kanal üyeleri:', channel.members.map(id => String(id)));
    
    // Kullanıcı üye mi kontrol et
    const isUserMember = channel.members.some(memberId => 
      String(memberId) === String(req.user._id)
    );
    
    console.log('Kullanıcı kanalın üyesi mi:', isUserMember);
    
    // Kullanıcı kanalın üyesi değilse, otomatik olarak üye yap
    if (!isUserMember) {
      console.log('Kullanıcı kanala otomatik üye yapılıyor');
      channel.members.push(req.user._id);
      await channel.save();
      console.log('Kullanıcı kanala üye yapıldı');
    }
    
    // Son 50 mesajı getir
    const messages = await Message.find({ channel: channelId })
      .sort({ createdAt: -1 })
      .limit(50);
    
    console.log('Bulunan mesaj sayısı:', messages.length);
    
    // Mesaj ID'lerini string'e çevir ve Frontend'e gönder
    const formattedMessages = messages.map(msg => ({
      _id: msg._id,
      content: msg.content,
      userId: String(msg.user), // String'e çevir
      username: msg.username,
      channelId: String(msg.channel),
      createdAt: msg.createdAt
    }));
    
    res.json(formattedMessages.reverse()); // Kronolojik sırayla döndür
  } catch (error) {
    console.error('getChannelMessages hatası:', error.message);
    res.status(400).send(error.message);
  }
};

module.exports = { createChannel, getChannels, joinChannel, getChannelMessages, deleteChannelMessages }; 