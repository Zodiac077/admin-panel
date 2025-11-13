import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in .env file');
    }
    const conn = await mongoose.connect(mongoURI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📚 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.error('\n📝 To fix this:');
    console.error('1. Create a .env file with your MongoDB Atlas connection string');
    console.error('2. Copy the format from .env.example');
    console.error('3. Get your connection string from: https://www.mongodb.com/cloud/atlas\n');
    process.exit(1);
  }
};

// Define Schemas
const messageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
  },
  title: {
    type: String,
  },
  message: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { collection: 'contacts' }); // Point to existing 'contacts' collection

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'active',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create Models
const Message = mongoose.model('Message', messageSchema);
const User = mongoose.model('User', userSchema);


// Routes

// Get all messages
app.get('/api/messages', async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1, date: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single message
app.get('/api/messages/:id', async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create message
app.post('/api/messages', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    const newMessage = new Message({
      name,
      email,
      subject,
      message,
      date: new Date(),
      read: false,
    });

    const saved = await newMessage.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update message (mark as read)
app.patch('/api/messages/:id', async (req, res) => {
  try {
    const { read } = req.body;
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { read },
      { new: true }
    );
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete message
app.delete('/api/messages/:id', async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create user
app.post('/api/users', async (req, res) => {
  try {
    const { name, email, status } = req.body;

    const newUser = new User({
      name,
      email,
      status: status || 'active',
    });

    const saved = await newUser.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update user
app.patch('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete user
app.delete('/api/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const mongoHealth = mongoose.connection.readyState;
    res.json({
      status: 'ok',
      message: 'Server is running',
      mongodb: mongoHealth === 1 ? 'Connected' : 'Disconnected',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Initialize Database with Sample Data
const initializeSampleData = async () => {
  try {
    const messageCount = await Message.countDocuments();
    
    if (messageCount === 0) {
      const sampleMessages = [
        {
          name: 'John Doe',
          email: 'john@example.com',
          subject: 'Question about services',
          message: 'Hi, I would like to know more about your services. Can you provide more details?',
          date: new Date(Date.now() - 1000 * 60 * 30),
          read: false,
        },
        {
          name: 'Sarah Smith',
          email: 'sarah@example.com',
          subject: 'Partnership opportunity',
          message: 'Hello, I represent a company that would like to explore partnership opportunities with you.',
          date: new Date(Date.now() - 1000 * 60 * 60 * 2),
          read: false,
        },
        {
          name: 'Mike Johnson',
          email: 'mike@example.com',
          subject: 'Feedback',
          message: 'Great work on your recent project! I really enjoyed it.',
          date: new Date(Date.now() - 1000 * 60 * 60 * 24),
          read: true,
        },
      ];

      await Message.insertMany(sampleMessages);
      console.log('✅ Sample messages inserted into MongoDB');
    }
  } catch (err) {
    console.error('Error initializing sample data:', err);
  }
};

// Connect to MongoDB and Start Server
connectDB().then(() => {
  initializeSampleData();

  app.listen(PORT, () => {
    console.log(`\n✅ Server is running on http://localhost:${PORT}`);
    console.log(`📊 MongoDB connected and ready to use`);
    console.log('\n📋 API Endpoints:');
    console.log('  GET  /api/messages');
    console.log('  POST /api/messages');
    console.log('  PATCH /api/messages/:id');
    console.log('  DELETE /api/messages/:id');
    console.log('  GET  /api/users');
    console.log('  POST /api/users');
    console.log('  PATCH /api/users/:id');
    console.log('  DELETE /api/users/:id');
    console.log('  GET  /api/health\n');
  });
}).catch((err) => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await mongoose.connection.close();
  console.log('MongoDB connection closed');
  process.exit(0);
});
