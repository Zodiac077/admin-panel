# Database Setup Guide

This admin panel now uses SQLite database to store and manage messages. Follow the steps below to set up and run the database.

## Prerequisites

- Node.js and npm installed
- The project dependencies installed

## Installation Steps

### Step 1: Install Backend Dependencies

Open a terminal in the project directory and run:

```bash
npm install express cors sqlite3
```

This installs:
- **express**: Web framework for Node.js
- **cors**: Middleware for handling Cross-Origin Resource Sharing
- **sqlite3**: SQLite database driver

### Step 2: Start the Backend Server

In a new terminal, run:

```bash
npm run server
```

You should see output like:
```
Server is running on http://localhost:5000
Database file: [path]/database.db
Messages table ready
Users table ready
Sample data inserted
```

### Step 3: Start the Frontend (in a different terminal)

In another terminal, run:

```bash
npm run dev
```

The frontend will start on `http://localhost:3000`

## Or Start Both Together

If you have `concurrently` installed globally:

```bash
npm run dev:all
```

Otherwise, install it:

```bash
npm install -g concurrently
npm run dev:all
```

## Database Features

### Messages Table
- Stores contact form submissions
- Tracks read/unread status
- Stores: id, name, email, subject, message, date, read status

### Users Table
- Store user information
- Tracks user status (active/inactive)
- Stores: id, name, email, status

## API Endpoints

### Messages
- `GET /api/messages` - Get all messages
- `GET /api/messages/:id` - Get single message
- `POST /api/messages` - Create new message
- `PATCH /api/messages/:id` - Update message (mark as read)
- `DELETE /api/messages/:id` - Delete message

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `DELETE /api/users/:id` - Delete user

### Health
- `GET /api/health` - Check server status

## Database File Location

The SQLite database file (`database.db`) is created in the root directory of your project when the server first runs.

## Sample Data

The database is automatically populated with sample messages on first run:
1. John Doe - Question about services
2. Sarah Smith - Partnership opportunity
3. Mike Johnson - Feedback

## Troubleshooting

### Port 5000 is already in use

Change the PORT in `server.js` to another number (e.g., 5001) and update `API_URL` in `AdminPanel.tsx`

### Database errors

Delete the `database.db` file and restart the server to recreate it with sample data.

### Admin panel shows connection error

- Make sure the backend server is running (`npm run server`)
- Check that it's running on port 5000
- Look for error messages in the server terminal

## Next Steps

You can:
1. Add more fields to messages or users
2. Implement authentication for the backend
3. Add filtering and sorting to API endpoints
4. Create a form to submit new messages from the frontend
5. Export data in different formats

For more information, see the main README.md
