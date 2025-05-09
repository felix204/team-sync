const Channel = require('../model/channelModel');
const Message = require('../model/messageModel');


const createChannel = async (req, res) => {
  try {
    const { name, description } = req.body;
    

    const channelExists = await Channel.findOne({ name });
    if (channelExists) {
      res.status(400);
      throw new Error('Bu isimde bir kanal zaten var');
    }
    
    const channel = await Channel.create({
      name,
      description,
      creator: req.user._id,
      members: [req.user._id] 
    });
    
    res.status(201).json(channel);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};


const getChannels = async (req, res) => {
  try {
    const channels = await Channel.find()
      .populate('creator', 'name')
      .select('-members'); 
      
    res.json(channels);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};


const joinChannel = async (req, res) => {
  try {
    const channelId = req.params.id;
    const userId = req.user._id;
    
    const channel = await Channel.findById(channelId);
    
    if (!channel) {
      res.status(404);
      throw new Error('Kanal bulunamadı');
    }

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


const deleteChannelMessages = async (req, res) => {
  try {
    const channelId = req.params.id;
    
    
    const channel = await Channel.findById(channelId);
    if (!channel) {
      res.status(404);
      throw new Error('Kanal bulunamadı');
    }
    
 
    const isCreator = String(channel.creator) === String(req.user._id);
    const isMember = channel.members.some(id => String(id) === String(req.user._id));
    
    if (!isCreator && !isMember) {
      res.status(403);
      throw new Error('Bu işlem için yetkiniz yok');
    }
    

    await Message.deleteMany({ channel: channelId });
    
    res.json({ message: 'Tüm mesajlar başarıyla silindi' });
  } catch (error) {
    console.error('deleteChannelMessages hatası:', error.message);
    res.status(400).send(error.message);
  }
};

const getChannelMessages = async (req, res) => {
  try {
    const channelId = req.params.id;
    console.log('Mesajlar isteniyor - Kanal ID:', channelId);
    console.log('İsteği yapan kullanıcı:', req.user?._id);
    

    const channel = await Channel.findById(channelId);
    if (!channel) {
      console.log('Kanal bulunamadı:', channelId);
      res.status(404);
      throw new Error('Kanal bulunamadı');
    }
    
    console.log('Kanal bulundu:', channel.name);
    console.log('Kanal üyeleri:', channel.members.map(id => String(id)));
    

    const isUserMember = channel.members.some(memberId => 
      String(memberId) === String(req.user._id)
    );
    
    console.log('Kullanıcı kanalın üyesi mi:', isUserMember);
    

    if (!isUserMember) {
      console.log('Kullanıcı kanala otomatik üye yapılıyor');
      channel.members.push(req.user._id);
      await channel.save();
      console.log('Kullanıcı kanala üye yapıldı');
    }
    

    const messages = await Message.find({ channel: channelId })
      .sort({ createdAt: -1 })
      .limit(50);
    
    console.log('Bulunan mesaj sayısı:', messages.length);
    

    const formattedMessages = messages.map(msg => ({
      _id: msg._id,
      content: msg.content,
      userId: String(msg.user), 
      username: msg.username,
      channelId: String(msg.channel),
      createdAt: msg.createdAt
    }));
    
    res.json(formattedMessages.reverse()); 
  } catch (error) {
    console.error('getChannelMessages hatası:', error.message);
    res.status(400).send(error.message);
  }
};

module.exports = { createChannel, getChannels, joinChannel, getChannelMessages, deleteChannelMessages }; 