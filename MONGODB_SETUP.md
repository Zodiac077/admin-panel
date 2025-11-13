# MongoDB Atlas Setup Guide

This admin panel now connects to MongoDB Atlas for cloud-based data storage. Follow the steps below to set up your MongoDB Atlas cluster.

## Step 1: Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Sign Up" and create a free account
3. Complete the account verification

## Step 2: Create a New Cluster

1. After logging in, click "Create" to create a new project
2. Enter project name (e.g., "Admin Panel")
3. Click "Create Project"
4. Click "Create Deployment"
5. Select **M0 Shared** (Free tier)
6. Choose your preferred region (closer to your location is better)
7. Click "Create Deployment"

## Step 3: Configure Network Access

1. Go to **Security > Network Access** in the left sidebar
2. Click "Add IP Address"
3. Select "Allow access from anywhere" (for development)
   - For production, add your specific IP address
4. Click "Confirm"

## Step 4: Create Database User

1. Go to **Security > Database Access**
2. Click "Add New Database User"
3. Enter username and password (save these securely!)
4. Choose "Read and write to any database"
5. Click "Add User"

## Step 5: Get Connection String

1. Go back to **Deployments**
2. Click "Connect" on your cluster
3. Select "Drivers"
4. Copy the connection string
5. It will look like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

## Step 6: Configure Your Application

### Create `.env` File

1. In your project root, create a file named `.env`
2. Copy the connection string and update it:

```
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/admin_panel?retryWrites=true&w=majority
PORT=5000
NODE_ENV=development
```

**Important:**
- Replace `YOUR_USERNAME` with your database user username
- Replace `YOUR_PASSWORD` with your database user password
- Keep `admin_panel` as your database name (or change to your preference)

### Example:
```
MONGODB_URI=mongodb+srv://admin:MySecurePass123@cluster0.abc123.mongodb.net/admin_panel?retryWrites=true&w=majority
PORT=5000
NODE_ENV=development
```

## Step 7: Start Your Application

### Terminal 1 - Start Backend Server:
```bash
npm run server
```

Expected output:
```
✅ MongoDB Connected: ac123def-45gh.mongodb.net
📚 Database: admin_panel
✅ Server is running on http://localhost:5000
```

### Terminal 2 - Start Frontend (in different terminal):
```bash
npm run dev
```

Or start both together:
```bash
npm run dev:all
```

## Step 8: Verify Connection

1. Open http://localhost:3000 in your browser
2. Login to the admin panel
3. You should see sample data loaded from MongoDB Atlas
4. Test by:
   - Creating a new message
   - Marking messages as read
   - Deleting messages
   - All changes sync to MongoDB Atlas

## MongoDB Atlas Dashboard

Monitor your data in real-time:

1. Go to https://www.mongodb.com/cloud/atlas
2. Click on your cluster
3. Click "Browse Collections"
4. View your messages and users collections

## Collections Created

### Messages Collection
Stores all contact form submissions:
- `_id`: Unique identifier
- `name`: Sender's name
- `email`: Sender's email
- `subject`: Message subject
- `message`: Message content
- `date`: When message was sent
- `read`: Whether admin has read it
- `createdAt`: Server timestamp

### Users Collection
Stores user information:
- `_id`: Unique identifier
- `name`: User name
- `email`: User email
- `status`: active/inactive/pending
- `createdAt`: When user was created

## Troubleshooting

### Connection Error: "MONGODB_URI is not defined"
**Solution:** Create `.env` file with your connection string

### Error: "connect ECONNREFUSED"
**Solution:** 
- Check MongoDB Atlas status page
- Verify IP address is whitelisted in Network Access
- Verify connection string is correct

### Sample Data Not Showing
**Solution:**
- Restart the server
- Check MongoDB Atlas dashboard to see if data exists
- Delete `.env` and recreate it with correct credentials

### Slow Connection
**Solution:**
- Check your internet connection
- Choose a MongoDB region closer to you
- Upgrade from M0 tier if needed

## Security Best Practices

⚠️ **Important for Production:**

1. **Never commit `.env` to git:**
   ```
   # Add to .gitignore
   .env
   ```

2. **Use strong passwords** for MongoDB users

3. **Restrict IP addresses:**
   - Don't use "Allow from anywhere" in production
   - Add only your server's IP

4. **Use environment variables** for sensitive data

5. **Enable IP Whitelist** in Network Access

6. **Backup your data** regularly

## API Endpoints

All endpoints connect to MongoDB Atlas:

- `GET /api/messages` - Get all messages
- `POST /api/messages` - Create new message
- `PATCH /api/messages/:id` - Update message
- `DELETE /api/messages/:id` - Delete message
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/health` - Health check

## Next Steps

1. ✅ Your app is now using MongoDB Atlas!
2. Add authentication to protect your admin panel
3. Implement email notifications for new messages
4. Set up automated backups
5. Deploy your app to a hosting service

## Support

- MongoDB Documentation: https://docs.mongodb.com/
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas/
- Mongoose Documentation: https://mongoosejs.com/

