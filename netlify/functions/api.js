import mongoose from 'mongoose';

// MongoDB Connection
let conn = null;

const connectDB = async () => {
  if (conn && conn.connection.readyState === 1) {
    return conn;
  }
  
  // In Netlify, env vars are passed directly, no need for dotenv
  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI) {
    console.error('MONGODB_URI environment variable is not set');
    throw new Error('MONGODB_URI is not defined. Please set it in Netlify environment variables.');
  }
  
  console.log('Connecting to MongoDB...');
  conn = await mongoose.connect(mongoURI);
  console.log('MongoDB connected successfully');
  return conn;
};

// Define Schemas
const messageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String },
  title: { type: String },
  message: { type: String, required: true },
  date: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
}, { collection: 'contacts' });

const Message = mongoose.model('Message', messageSchema);

// Main API Handler
export const handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  
  try {
    await connectDB();
    
    const { path, httpMethod, body } = event;
    
    // GET /api/messages
    if (path === '/api/messages' && httpMethod === 'GET') {
      const messages = await Message.find().sort({ createdAt: -1, date: -1 });
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messages),
      };
    }
    
    // GET /api/messages/:id
    if (path.match(/^\/api\/messages\/[a-z0-9]+$/i) && httpMethod === 'GET') {
      const id = path.split('/').pop();
      const message = await Message.findById(id);
      if (!message) {
        return { statusCode: 404, body: JSON.stringify({ error: 'Not found' }) };
      }
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      };
    }
    
    // PATCH /api/messages/:id
    if (path.match(/^\/api\/messages\/[a-z0-9]+$/i) && httpMethod === 'PATCH') {
      const id = path.split('/').pop();
      const data = JSON.parse(body);
      const message = await Message.findByIdAndUpdate(id, data, { new: true });
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      };
    }
    
    // DELETE /api/messages/:id
    if (path.match(/^\/api\/messages\/[a-z0-9]+$/i) && httpMethod === 'DELETE') {
      const id = path.split('/').pop();
      await Message.findByIdAndDelete(id);
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: true }),
      };
    }
    
    // POST /api/messages
    if (path === '/api/messages' && httpMethod === 'POST') {
      const data = JSON.parse(body);
      const newMessage = new Message({
        ...data,
        date: new Date(),
      });
      const saved = await newMessage.save();
      return {
        statusCode: 201,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saved),
      };
    }
    
    return { statusCode: 404, body: JSON.stringify({ error: 'Not found' }) };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message }),
    };
  }
};
