import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Chat from './models/Chat.js';
import User from './models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ Connection error:', err));

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  console.log('🔐 Auth Header:', authHeader);
  console.log('🎫 Token:', token ? 'Present' : 'Missing');

  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log('❌ Token verification failed:', err.message);
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    console.log('✅ Token verified for user:', user.email);
    req.user = user;
    next();
  });
};

// ======================= AUTH ROUTES ========================

// REGISTER
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashed });

    res.status(201).json({ message: 'User created' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// LOGIN
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '2h' });

    res.status(200).json({
      token,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ======================= CHAT ROUTES ========================

app.post('/api/save-chat', authenticateToken, async (req, res) => {
  const { title, messages } = req.body;
  const userId = req.user.id; // Get user ID from JWT token

  try {
    const newChat = new Chat({ userId, title, messages });
    const savedChat = await newChat.save();
    res.json(savedChat);
  } catch (err) {
    console.error('❌ Failed to save chat:', err);
    res.status(500).json({ error: 'Failed to save chat' });
  }
});

app.get('/api/chats', authenticateToken, async (req, res) => {
  const userId = req.user.id; // Get user ID from JWT token
  try {
    const chats = await Chat.find({ userId }).sort({ createdAt: -1 });
    res.json(chats);
  } catch (err) {
    console.error('❌ Failed to fetch chats:', err);
    res.status(500).json({ error: 'Failed to get chats' });
  }
});

app.put('/api/update-chat/:id', authenticateToken, async (req, res) => {
  try {
    const { messages, title } = req.body;
    const userId = req.user.id;
    const updateData = { messages };
    if (title) updateData.title = title;

    // Ensure user can only update their own chats
    const updatedChat = await Chat.findOneAndUpdate(
      { _id: req.params.id, userId },
      updateData,
      { new: true }
    );
    
    if (!updatedChat) {
      return res.status(404).json({ error: 'Chat not found or unauthorized' });
    }
    
    res.json(updatedChat);
  } catch (error) {
    console.error('❌ Failed to update chat:', error);
    res.status(500).json({ error: 'Failed to update chat' });
  }
});

app.delete('/api/delete-chat/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    // Ensure user can only delete their own chats
    const deleted = await Chat.findOneAndDelete({ _id: id, userId });
    if (!deleted) return res.status(404).json({ error: 'Chat not found or unauthorized' });
    res.json({ success: true, id });
  } catch (err) {
    console.error('❌ Failed to delete chat:', err);
    res.status(500).json({ error: 'Failed to delete chat' });
  }
});

// ======================= AI MODEL ========================

app.get('/api/models', async (req, res) => {
  try {
    const response = await fetch('http://localhost:11434/api/tags');
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Error fetching models:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/chat', async (req, res) => {
  const { message, model = 'mistral' } = req.body;
  console.log('Received message:', message);
  console.log('Using model:', model);

  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt: message,
        stream: false,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    console.log('Ollama raw response:', data);

    const responseText = data.response || "I'm sorry, I couldn't generate a response.";
    res.json({ response: responseText });
  } catch (err) {
    console.error('Error in /api/chat:', err);
    res.status(500).json({ error: err.message });
  }
});

// ======================= START SERVER ========================
app.listen(3001, () => {
  console.log('🚀 Backend running on http://localhost:3001');
});
