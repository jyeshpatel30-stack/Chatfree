const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/database');

// Database Connection
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: '✅ Server is running!' });
});

// Socket.io Events
const users = new Map();

io.on('connection', (socket) => {
  console.log('🔗 नया user connected:', socket.id);

  // User को online mark करें
  socket.on('user_online', (userId) => {
    users.set(userId, socket.id);
    io.emit('user_status_changed', { userId, status: 'online' });
    console.log('👤 Online users:', users.size);
  });

  // Direct message भेजें
  socket.on('send_message', (data) => {
    const { sender, receiver, content, messageId } = data;
    const receiverSocketId = users.get(receiver);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit('receive_message', {
        sender,
        content,
        messageId,
        timestamp: new Date(),
      });
    }
    console.log(`💬 Message sent from ${sender} to ${receiver}`);
  });

  // Group message भेजें
  socket.on('send_group_message', (data) => {
    const { sender, groupId, content, messageId } = data;
    io.emit('receive_group_message', {
      sender,
      groupId,
      content,
      messageId,
      timestamp: new Date(),
    });
  });

  // Typing indicator
  socket.on('user_typing', (data) => {
    const { userId, receiver } = data;
    const receiverSocketId = users.get(receiver);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('user_typing_indicator', { userId });
    }
  });

  // User disconnect
  socket.on('disconnect', () => {
    let disconnectedUserId = null;
    for (let [userId, socketId] of users.entries()) {
      if (socketId === socket.id) {
        disconnectedUserId = userId;
        users.delete(userId);
        break;
      }
    }
    if (disconnectedUserId) {
      io.emit('user_status_changed', { userId: disconnectedUserId, status: 'offline' });
      console.log('❌ User disconnected:', disconnectedUserId);
    }
  });
});

// Error Handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    message: 'कोई गड़बड़ हो गई!',
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`
🚀 Chatfree Server चल रहा है: http://localhost:${PORT}
✅ Database: Connected
🔌 Socket.io: Ready
`);
});
