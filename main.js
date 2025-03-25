const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const prisma = new PrismaClient();
const MESSAGES_PER_PAGE = 10;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to fetch message history
app.get('/api/messages', async (req, res) => {
  try {
    const { cursor, limit = MESSAGES_PER_PAGE } = req.query;
    const messages = await prisma.message.findMany({
      take: parseInt(limit),
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: parseInt(cursor) } : undefined,
      orderBy: {
        createdAt: 'desc'
      }
    });
    // Reverse the messages to maintain chronological order
    messages.reverse();
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// API endpoint to create a new message
app.post('/api/messages', async (req, res) => {
  try {
    const { content, sender, userUUID } = req.body;
    const message = await prisma.message.create({
      data: {
        content,
        sender,
        userUUID
      }
    });
    res.json(message);
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ error: 'Failed to create message' });
  }
});

// Socket.IO connection handling
io.on('connection', async (socket) => {
  console.log('A user connected');

  // Handle new messages
  socket.on('message', async (message) => {
    try {
      const response = await fetch(`http://localhost:${PORT}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message)
      });
      const newMessage = await response.json();
      io.emit('message', newMessage);
    } catch (error) {
      console.error('Error saving message:', error);
      socket.emit('error', 'Failed to save message');
    }
  });

  // Handle message deletion
  socket.on('deleteMessage', async ({ messageId, userUUID }) => {
    try {
      const message = await prisma.message.findUnique({
        where: { id: parseInt(messageId) }
      });

      if (message && message.userUUID === userUUID) {
        await prisma.message.delete({
          where: { id: parseInt(messageId) }
        });
        io.emit('messageDeleted', messageId);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      socket.emit('error', 'Failed to delete message');
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});