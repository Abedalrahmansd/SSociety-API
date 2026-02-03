import express from 'express';
import { PORT, JWT_SECRET } from './config/env.js';
import { createServer } from 'node:http';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { connectDB } from './database/mysqldb.js';
import cookieParser from 'cookie-parser';
import Grade from './models/grade.model.js';
import Message from './models/message.model.js';
import { setIO } from './utils/socket.io.js';

// Import associations after all models are loaded
import './models/associations.js';

//Routes
import authRouter from './routes/auth.routes.js';
import assignmentsRouter from './routes/assignments.routes.js';
import filesRouter from './routes/files.routes.js';
import usersRouter from './routes/users.routes.js';
import gradesRouter from './routes/grades.routes.js';
import versionRouter from './routes/version.routes.js';
import messagesRouter from './routes/messages.routes.js';


const app = express();
const server = createServer(app);

// Socket.io CORS is configured below, after we compute allowed origins.

// Global middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // To get cookies from requests 

// Security headers
app.use(helmet());

// CORS configuration
// In development, we allow all origins for convenience.
// For production, set CORS_ORIGIN (comma-separated origins) in env to tighten this.
const allowedOrigins =
  process.env.CORS_ORIGIN?.split(',').map((o) => o.trim()).filter(Boolean) ||
  ['*'];

app.use(
  cors({
    origin: allowedOrigins.length === 1 && allowedOrigins[0] === '*'
      ? '*'
      : allowedOrigins,
    credentials: false,
  }),
);

// Basic rate limiting for auth routes (protects against brute force)
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
});


//Defualt Api Routes
app.use('/api/v1/auth', authRateLimiter, authRouter);
app.use('/api/v1/assignments', assignmentsRouter);
app.use('/api/v1/files', filesRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/grades', gradesRouter);
app.use('/api/v1/version', versionRouter);
app.use('/api/v1/messages', messagesRouter);

const __dirname = dirname(fileURLToPath(import.meta.url)); // Get current directory name

// Configure socket.io with CORS using the same allowed origins
const io = new Server(server, {
  cors: {
    origin: allowedOrigins.length === 1 && allowedOrigins[0] === '*'
      ? '*'
      : allowedOrigins,
    methods: ['GET', 'POST'],
  },
});

// Export io instance for use in controllers
setIO(io);

//main Route
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'view', 'index.html')); // Serve the HTML file
});

// Socket.io connection with JWT auth and grade-based rooms
io.use((socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      (socket.handshake.headers.authorization || '').replace('Bearer ', '');

    if (!token) {
      return next(new Error('Authentication token is required'));
    }

    const payload = jwt.verify(token, JWT_SECRET);
    socket.user = { id: payload.id, email: payload.email };
    next();
  } catch (err) {
    console.error('Socket auth error:', err);
    next(new Error('Invalid or expired token'));
  }
});

// Track online users per room
const onlineUsers = new Map(); // roomId -> Set of userIds

io.on('connection', async (socket) => {
  console.log('User connected to socket:', socket.id, 'userId:', socket.user?.id);

  // Client can explicitly join a chat group id (must match grades.chat_group_id)
  socket.on('join_room', async (chatGroupId) => {
    if (!chatGroupId) return;
    socket.join(chatGroupId);
    
    // Track presence
    if (!onlineUsers.has(chatGroupId)) {
      onlineUsers.set(chatGroupId, new Set());
    }
    onlineUsers.get(chatGroupId).add(socket.user.id);
    
    // Notify others in room
    socket.to(chatGroupId).emit('user_online', {
      chat_group_id: chatGroupId,
      user_id: socket.user.id,
    });
    
    // Send current online users to the new joiner
    const online = Array.from(onlineUsers.get(chatGroupId));
    socket.emit('online_users', {
      chat_group_id: chatGroupId,
      user_ids: online,
    });
  });

  // Typing indicators
  socket.on('typing_start', (chatGroupId) => {
    if (!chatGroupId) return;
    socket.to(chatGroupId).emit('typing', {
      chat_group_id: chatGroupId,
      user_id: socket.user.id,
      isTyping: true,
    });
  });

  socket.on('typing_stop', (chatGroupId) => {
    if (!chatGroupId) return;
    socket.to(chatGroupId).emit('typing', {
      chat_group_id: chatGroupId,
      user_id: socket.user.id,
      isTyping: false,
    });
  });

  // Send message event: persists to DB and broadcasts to room
  socket.on('send_message', async (payload, callback) => {
    try {
      const { chat_group_id, msg, hidefrom = [], readList = [] } = payload || {};

      if (!chat_group_id || !msg) {
        if (callback) callback({ status: 'error', message: 'chat_group_id and msg are required.' });
        return;
      }

      // Validate chat_group_id exists on some grade
      const grade = await Grade.findOne({ where: { chat_group_id } });
      if (!grade) {
        if (callback) callback({ status: 'error', message: 'Invalid chat group.' });
        return;
      }

      const sentAt = new Date();

      const message = await Message.create({
        chat_group_id,
        sender: socket.user.id,
        senderName: payload.senderName || socket.user.email,
        msg,
        hidefrom,
        readList,
        sentAt,
      });

      const messageData = message.toJSON();

      io.to(chat_group_id).emit('new_message', messageData);

      if (callback) callback({ status: 'success', data: messageData });
    } catch (error) {
      console.error('send_message error:', error);
      if (callback) callback({ status: 'error', message: 'Failed to send message.' });
    }
  });

  // Edit message (only sender can edit)
  socket.on('edit_message', async (payload, callback) => {
    try {
      const { id, msg } = payload || {};
      if (!id || !msg) {
        if (callback) callback({ status: 'error', message: 'id and msg are required.' });
        return;
      }

      const message = await Message.findByPk(id);
      if (!message) {
        if (callback) callback({ status: 'error', message: 'Message not found.' });
        return;
      }

      if (message.sender !== socket.user.id) {
        if (callback) callback({ status: 'error', message: 'Not allowed to edit this message.' });
        return;
      }

      await message.update({ msg, isEdited: true });
      const data = message.toJSON();

      io.to(message.chat_group_id).emit('message_edited', data);
      if (callback) callback({ status: 'success', data });
    } catch (error) {
      console.error('edit_message error:', error);
      if (callback) callback({ status: 'error', message: 'Failed to edit message.' });
    }
  });

  // Delete message (soft delete: mark as isDeleted)
  socket.on('delete_message', async (payload, callback) => {
    try {
      const { id } = payload || {};
      if (!id) {
        if (callback) callback({ status: 'error', message: 'id is required.' });
        return;
      }

      const message = await Message.findByPk(id);
      if (!message) {
        if (callback) callback({ status: 'error', message: 'Message not found.' });
        return;
      }

      // Sender can delete own message; admins could be added later via role lookup if needed
      if (message.sender !== socket.user.id) {
        if (callback) callback({ status: 'error', message: 'Not allowed to delete this message.' });
        return;
      }

      await message.update({ isDeleted: true });
      const data = message.toJSON();

      io.to(message.chat_group_id).emit('message_deleted', data);
      if (callback) callback({ status: 'success' });
    } catch (error) {
      console.error('delete_message error:', error);
      if (callback) callback({ status: 'error', message: 'Failed to delete message.' });
    }
  });

  // Mark messages as read
  socket.on('mark_read', async (payload, callback) => {
    try {
      const { ids, chat_group_id } = payload || {};
      if (!Array.isArray(ids) || !ids.length || !chat_group_id) {
        if (callback) callback({ status: 'error', message: 'ids (non-empty array) and chat_group_id are required.' });
        return;
      }

      const userId = socket.user.id;

      const messages = await Message.findAll({ where: { id: ids, chat_group_id } });

      for (const message of messages) {
        const list = Array.isArray(message.readList) ? message.readList : [];
        if (!list.includes(userId)) {
          list.push(userId);
          await message.update({ readList: list });
        }
      }

      io.to(chat_group_id).emit('messages_read', {
        chat_group_id,
        message_ids: ids,
        reader_id: userId,
      });

      if (callback) callback({ status: 'success' });
    } catch (error) {
      console.error('mark_read error:', error);
      if (callback) callback({ status: 'error', message: 'Failed to mark messages as read.' });
    }
  });

  // Hide a message for the current user only
  socket.on('hide_message', async (payload, callback) => {
    try {
      const { id } = payload || {};
      if (!id) {
        if (callback) callback({ status: 'error', message: 'id is required.' });
        return;
      }

      const message = await Message.findByPk(id);
      if (!message) {
        if (callback) callback({ status: 'error', message: 'Message not found.' });
        return;
      }

      const userId = socket.user.id;
      const list = Array.isArray(message.hidefrom) ? message.hidefrom : [];
      if (!list.includes(userId)) {
        list.push(userId);
        await message.update({ hidefrom: list });
      }

      if (callback) callback({ status: 'success' });
    } catch (error) {
      console.error('hide_message error:', error);
      if (callback) callback({ status: 'error', message: 'Failed to hide message.' });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected from socket:', socket.id);
    
    // Remove from presence tracking and notify
    onlineUsers.forEach((userSet, roomId) => {
      if (userSet.has(socket.user.id)) {
        userSet.delete(socket.user.id);
        socket.to(roomId).emit('user_offline', {
          chat_group_id: roomId,
          user_id: socket.user.id,
        });
        if (userSet.size === 0) {
          onlineUsers.delete(roomId);
        }
      }
    });
  });
});

// Basic error handler to ensure consistent JSON responses
// Note: keep this after all routes/middleware.
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);

  const status = err.status || 500;
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Internal server error.'
      : err.message || 'Internal server error.';

  res.status(status).json({
    status: 'error',
    message,
  });
});


server.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  await connectDB(); // Connect to the database when the server starts
});

