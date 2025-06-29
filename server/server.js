const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

// Import your route modules
const authRoutes = require('./api/auth/login');
const registerRoutes = require('./api/auth/register');
const userRoutes = require('./api/users');
const conversationRoutes = require('./api/conversations');
const messageRoutes = require('./api/messages');

// dotenv.config({ path: require('path').resolve(__dirname, '../.env') });
dotenv.config();
const app = express();
const server = http.createServer(app); // Create HTTP server
const io = new Server(server, {
  cors: {
    origin: '*', // Adjust as needed for security
    methods: ['GET', 'POST']
  }
});
app.set('io', io);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Database Connected"))
  .catch((error) => {
    console.log("MongoDb Connect error", error);
    process.exit(1);
  });

// Health check route
app.get('/', (req, res) => {
  res.json({
    message: "Server is Running " + (process.env.PORT || 5000)
  });
});

// API routes
app.use('/api/auth/login', authRoutes);
app.use('/api/auth/register', registerRoutes);
app.use('/api/users', userRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', messageRoutes);

// ... existing code ...
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Join a conversation room
  socket.on('joinConversation', (conversationId) => {
    socket.join(conversationId);
    console.log(`User ${socket.id} joined conversation ${conversationId}`);
  });

  // Removed sendMessage handler to prevent duplicate emits

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});
// ... existing code ...

const PORT = process.env.PORT || 4000;
server.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
); 
