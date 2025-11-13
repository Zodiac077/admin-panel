# Deploy to Netlify - Quick Start

## 3-Step Deployment

### Step 1: Push to GitHub
```powershell
git init
git add .
git commit -m "Ready for Netlify deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/admin-panel.git
git push -u origin main
```

### Step 2: Connect GitHub to Netlify
1. Go to https://netlify.com
2. Click "New site from Git"
3. Select GitHub → select your repository
4. Build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. Click "Deploy site"

### Step 3: Add Environment Variable
1. Go to Site Settings → Environment
2. Add new variable:
   - **Key:** `MONGODB_URI`
   - **Value:** `mongodb+srv://ky202101_db_user:AxN6Mk6tJrsoPel3@portfolio.rcj1rkz.mongodb.net/portfolio`
3. Trigger redeploy

## ✅ Done!
Your admin panel is now live at: `https://your-site.netlify.app`

## What Changed for Netlify?
- ✅ API uses serverless functions in `netlify/functions/api.js`
- ✅ Frontend automatically detects Netlify deployment
- ✅ Configuration stored in `netlify.toml`
- ✅ MongoDB connection works on cloud

See `NETLIFY_DEPLOYMENT.md` for detailed troubleshooting.
