const socketIO = require('socket.io');
const messageHandler = require('./messageHandler');

/**
 * Socket.io sunucusunu başlatır ve olay dinleyicilerini ekler
 * @param {Object} server - HTTP server instance
 * @returns {Object} - Socket.io instance
 */
const initializeSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Kullanıcı bağlantılarını takip etmek için
  const activeUsers = new Map();
  
  io.on('connection', (socket) => {
    console.log('Yeni kullanıcı bağlandı:', socket.id);
    
    // Kullanıcı bilgilerini kaydet
    socket.on('user_connected', (userData) => {
      console.log('Kullanıcı tanımlandı:', userData.name);
      activeUsers.set(socket.id, {
        userId: userData.userId,
        username: userData.name
      });
      
      // Tüm aktif kullanıcıları emisyon et
      io.emit('active_users', Array.from(activeUsers.values()));
    });

    // Mesaj olaylarını işle
    messageHandler(io, socket, activeUsers);
    
    // Bağlantı kesildiğinde
    socket.on('disconnect', () => {
      console.log('Kullanıcı ayrıldı:', socket.id);
      activeUsers.delete(socket.id);
      io.emit('active_users', Array.from(activeUsers.values()));
    });
  });

  return io;
};

module.exports = initializeSocket; 