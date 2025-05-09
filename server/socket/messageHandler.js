const Message = require('../model/messageModel');

/**
 * Mesaj olayları için işleyicileri yönetir
 * @param {Object} io - Socket.io instance
 * @param {Object} socket - Socket bağlantısı
 * @param {Map} activeUsers - Aktif kullanıcıların tutulduğu harita
 */
const messageHandler = (io, socket, activeUsers) => {
  

  socket.on('send_message', async (messageData) => {
    try {
      const { content, channelId, userId } = messageData;
      

      const user = activeUsers.get(socket.id);
      
      if (!user) {
        socket.emit('message_error', 'Kullanıcı bilgileriniz bulunamadı');
        return;
      }
      

      if (String(user.userId) !== String(userId)) {
        socket.emit('message_error', 'Yetkilendirme hatası');
        return;
      }
      

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const messageCount = await Message.countDocuments({
        user: userId,
        createdAt: { $gte: today }
      });
      

      if (messageCount >= 50) {
        socket.emit('message_limit', 'Günlük mesaj kotanız doldu. Yarın tekrar deneyin.');
        return;
      }
      
   
      const message = new Message({
        content,
        channel: channelId,
        user: userId,
        username: user.username,
    
        expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });
      
      await message.save();
      

      io.to(channelId).emit('new_message', {
        _id: message._id,
        content: message.content,
        username: user.username,
        userId: String(userId),
        channelId: message.channel,
        createdAt: message.createdAt
      });
      
    } catch (error) {
      console.error('Mesaj gönderme hatası:', error);
      socket.emit('message_error', 'Mesaj gönderilemedi');
    }
  });
  
  
  socket.on('typing', (data) => {
    const { channelId } = data;
    const user = activeUsers.get(socket.id);
    
    if (user) {
      
      socket.to(channelId).emit('user_typing', {
        username: user.username
      });
    }
  });
  
  
  socket.on('join_channel', (channelId) => {
    socket.join(channelId);
    console.log(`${socket.id} kanalına katıldı: ${channelId}`);
  });
  
  
  socket.on('leave_channel', (channelId) => {
    socket.leave(channelId);
    console.log(`${socket.id} kanalından ayrıldı: ${channelId}`);
  });
};

module.exports = messageHandler; 