const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const connectDB = require('./config/db');
const initializeSocket = require('./socket');

// Environment variables
dotenv.config();

// Connect to database
connectDB();

// Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/channels', require('./routes/channelRoutes'));

// Test route
app.get('/', (req, res) => {
  res.send('API çalışıyor');
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// HTTP Server (Socket.io için)
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Socket.io başlat
const io = initializeSocket(server);

// Server'ı dinle
server.listen(PORT, () => console.log(`Server: ${PORT}`));

module.exports = { app, server, io };
