const mongoose = require('mongoose');

let cachedConnection = null;

async function connectToDatabase() {
  if (cachedConnection) {
    console.log('[DB] Using cached connection');
    return cachedConnection;
  }

  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is missing');
    }

    console.log('[DB] Connecting to MongoDB...');
    const connection = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });

    cachedConnection = connection;
    console.log('[DB] Connected successfully');
    return connection;
  } catch (error) {
    console.error('[DB] Connection error:', error.message);
    throw error;
  }
}

const contactSchema = new mongoose.Schema(
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

let Contact = null;

function getContactModel() {
  if (!Contact) {
    Contact = mongoose.model('Contact', contactSchema);
  }
  return Contact;
}

exports.handler = async (event) => {
  console.log(`[API] ${event.httpMethod} ${event.path}`);

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  };

  try {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers };
    }

    // Connect to database
    await connectToDatabase();
    const ContactModel = getContactModel();

    // GET all contacts
    if (event.httpMethod === 'GET' && event.path.includes('/messages')) {
      console.log('[API] Fetching all contacts...');
      const contacts = await ContactModel.find().sort({ createdAt: -1, date: -1 }).limit(100);
      console.log(`[API] Found ${contacts.length} contacts`);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(contacts),
      };
    }

    // Extract ID from path
    const idMatch = event.path.match(/\/messages\/([a-zA-Z0-9]+)$/);
    
    if (idMatch) {
      const contactId = idMatch[1];
      
      // GET single contact
      if (event.httpMethod === 'GET') {
        console.log(`[API] Fetching contact ${contactId}...`);
        const contact = await ContactModel.findById(contactId);
        
        if (!contact) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Contact not found' }),
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(contact),
        };
      }

      // PATCH update contact
      if (event.httpMethod === 'PATCH') {
        console.log(`[API] Updating contact ${contactId}...`);
        const updateData = JSON.parse(event.body || '{}');
        const contact = await ContactModel.findByIdAndUpdate(
          contactId,
          updateData,
          { new: true }
        );

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(contact),
        };
      }

      // DELETE contact
      if (event.httpMethod === 'DELETE') {
        console.log(`[API] Deleting contact ${contactId}...`);
        await ContactModel.findByIdAndDelete(contactId);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, message: 'Contact deleted' }),
        };
      }
    }

    // POST create contact
    if (event.httpMethod === 'POST' && event.path.includes('/messages')) {
      console.log('[API] Creating new contact...');
      const newContactData = JSON.parse(event.body || '{}');
      
      const newContact = new ContactModel({
        ...newContactData,
        createdAt: new Date(),
        date: new Date(),
      });

      const savedContact = await newContact.save();
      console.log('[API] Contact created:', savedContact._id);

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(savedContact),
      };
    }

    // 404 - Route not found
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({
        error: 'Not found',
        path: event.path,
        method: event.httpMethod,
      }),
    };
  } catch (error) {
    console.error('[API] Error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message,
      }),
    };
  }
};
