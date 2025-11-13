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
    
    // Netlify passes path differently - get the actual path
    const path = event.rawPath || event.path || '';
    const httpMethod = event.requestContext?.http?.method || event.httpMethod || 'GET';
    const body = event.body;
    
    console.log(`[API] ${httpMethod} ${path}`);
    
    // GET /api/messages - list all messages
    if ((path === '/api/messages' || path.endsWith('/api/messages')) && httpMethod === 'GET') {
      console.log('Fetching all messages...');
      const messages = await Message.find().sort({ createdAt: -1, date: -1 });
      console.log(`Found ${messages.length} messages`);
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messages),
      };
    }
    
    // Extract ID from path for /:id routes
    const idMatch = path.match(/\/api\/messages\/([a-z0-9]+)/i);
    const id = idMatch ? idMatch[1] : null;
    
    // GET /api/messages/:id - get single message
    if (id && httpMethod === 'GET') {
      console.log(`Fetching message ${id}...`);
      const message = await Message.findById(id);
      if (!message) {
        return { 
          statusCode: 404, 
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Not found' }) 
        };
      }
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      };
    }
    
    // PATCH /api/messages/:id - update message
    if (id && httpMethod === 'PATCH') {
      console.log(`Updating message ${id}...`);
      const data = JSON.parse(body || '{}');
      const message = await Message.findByIdAndUpdate(id, data, { new: true });
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      };
    }
    
    // DELETE /api/messages/:id - delete message
    if (id && httpMethod === 'DELETE') {
      console.log(`Deleting message ${id}...`);
      await Message.findByIdAndDelete(id);
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: true }),
      };
    }
    
    // POST /api/messages - create message
    if ((path === '/api/messages' || path.endsWith('/api/messages')) && httpMethod === 'POST') {
      console.log('Creating new message...');
      const data = JSON.parse(body || '{}');
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
    
    console.log(`No route matched for ${httpMethod} ${path}`);
    return { 
      statusCode: 404, 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Not found' }) 
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    };
  }
};
