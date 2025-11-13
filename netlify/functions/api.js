import mongoose from 'mongoose';

let cachedConn = null;

const connectDB = async () => {
  if (cachedConn && cachedConn.connection.readyState === 1) {
    console.log('Using cached DB connection');
    return cachedConn;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI not set in environment variables');
  }

  console.log('Creating new MongoDB connection...');
  cachedConn = await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  });
  console.log('MongoDB connected');
  return cachedConn;
};

const messageSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    subject: String,
    title: String,
    message: String,
    date: Date,
    read: Boolean,
    createdAt: Date,
  },
  { collection: 'contacts' }
);

let Message;

const getMessageModel = () => {
  if (!Message) {
    Message = mongoose.model('Message', messageSchema);
  }
  return Message;
};

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    console.log(`${event.httpMethod} ${event.path}`);
    
    await connectDB();
    const MessageModel = getMessageModel();

    // GET all messages
    if (event.path === '/.netlify/functions/api/messages' && event.httpMethod === 'GET') {
      const messages = await MessageModel.find().sort({ createdAt: -1, date: -1 });
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(messages),
      };
    }

    // GET single message
    const idMatch = event.path.match(/\/(\w+)$/);
    if (idMatch && event.httpMethod === 'GET') {
      const id = idMatch[1];
      const message = await MessageModel.findById(id);
      if (!message) {
        return { statusCode: 404, headers, body: JSON.stringify({ error: 'Not found' }) };
      }
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(message),
      };
    }

    // PATCH message
    if (idMatch && event.httpMethod === 'PATCH') {
      const id = idMatch[1];
      const data = JSON.parse(event.body || '{}');
      const message = await MessageModel.findByIdAndUpdate(id, data, { new: true });
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(message),
      };
    }

    // DELETE message
    if (idMatch && event.httpMethod === 'DELETE') {
      const id = idMatch[1];
      await MessageModel.findByIdAndDelete(id);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true }),
      };
    }

    // POST message
    if (event.path === '/.netlify/functions/api/messages' && event.httpMethod === 'POST') {
      const data = JSON.parse(event.body || '{}');
      const msg = new MessageModel({
        ...data,
        createdAt: new Date(),
      });
      const saved = await msg.save();
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(saved),
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Not found' }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
