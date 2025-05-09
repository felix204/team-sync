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


  const activeUsers = new Map();
  
  io.on('connection', (socket) => {
    console.log('Yeni kullanıcı bağlandı:', socket.id);
    

    socket.on('user_connected', (userData) => {
      console.log('Kullanıcı tanımlandı:', userData.name);
      activeUsers.set(socket.id, {
        userId: userData.userId,
        username: userData.name
      });
      

      io.emit('active_users', Array.from(activeUsers.values()));
    });


    messageHandler(io, socket, activeUsers);
    

    socket.on('disconnect', () => {
      console.log('Kullanıcı ayrıldı:', socket.id);
      activeUsers.delete(socket.id);
      io.emit('active_users', Array.from(activeUsers.values()));
    });
  });

  return io;
};

module.exports = initializeSocket; 