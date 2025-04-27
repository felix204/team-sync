const Message = require('../model/messageModel');

/**
 * Mesaj olayları için işleyicileri yönetir
 * @param {Object} io - Socket.io instance
 * @param {Object} socket - Socket bağlantısı
 * @param {Map} activeUsers - Aktif kullanıcıların tutulduğu harita
 */
const messageHandler = (io, socket, activeUsers) => {
  
  // Yeni mesaj gönderildiğinde
  socket.on('send_message', async (messageData) => {
    try {
      const { content, channelId, userId } = messageData;
      
      // Gönderen kullanıcı bilgilerini al
      const user = activeUsers.get(socket.id);
      
      if (!user) {
        socket.emit('message_error', 'Kullanıcı bilgileriniz bulunamadı');
        return;
      }
      
      // Güvenlik kontrolü - kullanıcı ID'leri eşleşiyor mu
      if (String(user.userId) !== String(userId)) {
        socket.emit('message_error', 'Yetkilendirme hatası');
        return;
      }
      
      // Kullanıcının mesaj kotasını kontrol et
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const messageCount = await Message.countDocuments({
        user: userId,
        createdAt: { $gte: today }
      });
      
      // Günlük limit 50 mesaj
      if (messageCount >= 50) {
        socket.emit('message_limit', 'Günlük mesaj kotanız doldu. Yarın tekrar deneyin.');
        return;
      }
      
      // Yeni mesaj oluştur
      const message = new Message({
        content,
        channel: channelId,
        user: userId,
        username: user.username,
        // 24 saat sonra otomatik silinmesi için TTL
        expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });
      
      await message.save();
      
      // Tüm bağlı kullanıcılara mesajı gönder
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
  
  // Kullanıcı yazıyor bildirimi
  socket.on('typing', (data) => {
    const { channelId } = data;
    const user = activeUsers.get(socket.id);
    
    if (user) {
      // Kullanıcının yazıyor olduğunu diğerlerine bildir
      socket.to(channelId).emit('user_typing', {
        username: user.username
      });
    }
  });
  
  // Kanala katılma
  socket.on('join_channel', (channelId) => {
    socket.join(channelId);
    console.log(`${socket.id} kanalına katıldı: ${channelId}`);
  });
  
  // Kanaldan ayrılma
  socket.on('leave_channel', (channelId) => {
    socket.leave(channelId);
    console.log(`${socket.id} kanalından ayrıldı: ${channelId}`);
  });
};

module.exports = messageHandler; 