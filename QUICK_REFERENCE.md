# 🚀 Quick Reference Card

## Setup Steps (TL;DR)

### 1️⃣ MongoDB Atlas Account (2 min)
```
Visit: https://www.mongodb.com/cloud/atlas
Create account → Create cluster (M0 free)
```

### 2️⃣ Get Connection String (1 min)
```
Clusters → Connect → Drivers → Copy string
```

### 3️⃣ Create .env File (1 min)
```
Create file: .env
Add line: MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/admin_panel?retryWrites=true&w=majority
```

### 4️⃣ Run Application (1 min)
```
Terminal 1: npm run server
Terminal 2: npm run dev
Open:      http://localhost:3000
```

---

## Command Cheat Sheet

### Start Application
```bash
# Backend only
npm run server

# Frontend only  
npm run dev

# Both together (needs concurrently)
npm run dev:all
```

### Check Installation
```bash
# Verify MongoDB connection
curl http://localhost:5000/api/health

# View all messages
curl http://localhost:5000/api/messages
```

### Database Operations

**List all messages:**
```bash
curl http://localhost:5000/api/messages
```

**Create new message:**
```bash
curl -X POST http://localhost:5000/api/messages \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John",
    "email": "john@example.com",
    "subject": "Hello",
    "message": "This is a test"
  }'
```

**Update message (mark as read):**
```bash
curl -X PATCH http://localhost:5000/api/messages/ID \
  -H "Content-Type: application/json" \
  -d '{"read": true}'
```

**Delete message:**
```bash
curl -X DELETE http://localhost:5000/api/messages/ID
```

---

## File Locations

| File | Purpose | Edit? |
|------|---------|-------|
| `.env` | MongoDB connection string | ✏️ YES - Add your URI |
| `.env.example` | Template for `.env` | ❌ Reference only |
| `server.js` | Express + MongoDB backend | ❌ Already configured |
| `MONGODB_SETUP.md` | Detailed setup guide | ❌ Read for help |
| `SETUP_CHECKLIST.md` | Step-by-step checklist | ❌ Follow for setup |

---

## Troubleshooting Quick Fixes

| Problem | Solution |
|---------|----------|
| `.env` not found | `cp .env.example .env` and add connection string |
| MongoDB connection error | Check `.env` has correct username/password |
| Port 5000 in use | Change PORT in `.env` to 5001 |
| CORS error | Server running? Check http://localhost:5000/api/health |
| No data showing | Restart server after creating `.env` |

---

## Important Notes ⚠️

- **Save `.env` securely** - Never share or commit to git
- **Strong password** - Use 12+ characters for MongoDB user
- **IP Whitelist** - For development: "Allow from anywhere"
- **Sample data** - Auto-inserted on first run
- **Frontend** - Already configured to use backend

---

## URLs

| Service | URL |
|---------|-----|
| Frontend (Admin Panel) | http://localhost:3000 |
| Backend API | http://localhost:5000 |
| Health Check | http://localhost:5000/api/health |
| MongoDB Atlas | https://www.mongodb.com/cloud/atlas |

---

## Ports

- **3000** - Frontend (Vite dev server)
- **5000** - Backend (Express API)

---

## Environment Variables

```env
# MongoDB Atlas Connection String (Required)
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/admin_panel?retryWrites=true&w=majority

# Server Port (Optional)
PORT=5000

# Environment (Optional)
NODE_ENV=development
```

---

## Database Collections

### messages
- `_id` - unique ID
- `name` - sender name
- `email` - sender email
- `subject` - message subject
- `message` - message content
- `date` - sent timestamp
- `read` - read status (boolean)
- `createdAt` - creation timestamp

### users
- `_id` - unique ID
- `name` - user name
- `email` - user email
- `status` - active/inactive/pending
- `createdAt` - creation timestamp

---

## Quick Test Commands

```bash
# Test backend is running
curl http://localhost:5000/api/health

# Get all messages
curl http://localhost:5000/api/messages | jq

# Get all users
curl http://localhost:5000/api/users | jq
```

---

## Performance Tips

✅ Close unused tabs/applications  
✅ Use SSD for better performance  
✅ Keep MongoDB Atlas region close to you  
✅ Monitor API calls in MongoDB Atlas console  
✅ Index frequently queried fields  

---

## Need Help?

1. Check `SETUP_CHECKLIST.md` - Step by step guide
2. Check `MONGODB_SETUP.md` - Detailed documentation
3. See troubleshooting section above
4. Check console output for error messages
5. Verify `.env` file exists and has correct format

---

## Common Errors & Fixes

```
❌ "MongooseError: Cannot connect to MongoDB"
✅ Check .env file has correct MONGODB_URI

❌ "ECONNREFUSED: Connection refused"
✅ Start server: npm run server

❌ "Cannot find module 'mongoose'"
✅ Install: npm install mongoose dotenv

❌ "IP address not whitelisted"
✅ Add IP in MongoDB Atlas > Network Access

❌ "Authentication failed"
✅ Check username/password in MONGODB_URI
```

---

**You're ready to go! 🎉**

Start with:
```bash
npm run server  # Terminal 1
npm run dev     # Terminal 2
```

Then open: http://localhost:3000

