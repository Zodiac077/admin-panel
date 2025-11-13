const mongoose = require('mongoose');

let connection = null;

async function getConnection() {
  if (connection) {
    return connection;
  }
  
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not set');
    }
    
    connection = await mongoose.connect(uri, {
      retryWrites: true,
      w: 'majority',
    });
    
    return connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

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
  { collection: 'contacts', strict: false }
);

let MessageModel = null;

function getMessage() {
  if (!MessageModel) {
    MessageModel = mongoose.model('Message', messageSchema);
  }
  return MessageModel;
}

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    // OPTIONS request for CORS
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers };
    }

    console.log(`[${event.httpMethod}] ${event.path}`);

    // Connect to MongoDB
    await getConnection();
    const Message = getMessage();

    // GET /api/messages - fetch all
    if (event.httpMethod === 'GET' && event.path.includes('/messages')) {
      if (event.path.match(/\/messages\/[a-zA-Z0-9]+/)) {
        // GET single
        const id = event.path.match(/\/messages\/([a-zA-Z0-9]+)/)[1];
        const doc = await Message.findById(id);
        
        return {
          statusCode: doc ? 200 : 404,
          headers,
          body: JSON.stringify(doc || { error: 'Not found' }),
        };
      } else {
        // GET all
        const docs = await Message.find().sort({ createdAt: -1, date: -1 });
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(docs),
        };
      }
    }

    // PATCH /api/messages/:id
    if (event.httpMethod === 'PATCH' && event.path.match(/\/messages\/[a-zA-Z0-9]+/)) {
      const id = event.path.match(/\/messages\/([a-zA-Z0-9]+)/)[1];
      const data = JSON.parse(event.body || '{}');
      const doc = await Message.findByIdAndUpdate(id, data, { new: true });
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(doc),
      };
    }

    // DELETE /api/messages/:id
    if (event.httpMethod === 'DELETE' && event.path.match(/\/messages\/[a-zA-Z0-9]+/)) {
      const id = event.path.match(/\/messages\/([a-zA-Z0-9]+)/)[1];
      await Message.findByIdAndDelete(id);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true }),
      };
    }

    // POST /api/messages
    if (event.httpMethod === 'POST' && event.path.includes('/messages')) {
      const data = JSON.parse(event.body || '{}');
      const doc = new Message({
        ...data,
        createdAt: new Date(),
        date: new Date(),
      });
      const saved = await doc.save();
      
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(saved),
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Route not found' }),
    };
  } catch (error) {
    console.error('[ERROR]', error.message);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error.message,
        type: error.constructor.name,
      }),
    };
  }
};
