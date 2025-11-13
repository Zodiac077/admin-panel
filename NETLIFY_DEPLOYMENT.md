# Netlify Deployment Guide

## Prerequisites
- GitHub account
- Netlify account (connect to GitHub)
- MongoDB Atlas account with connection string

## Step 1: Prepare for Deployment

### Update package.json
Make sure your `package.json` has the build script:
```json
"scripts": {
  "build": "vite build",
  "dev": "vite"
}
```

### Environment Variables
Set up on Netlify:
1. Go to Site Settings → Build & Deploy → Environment
2. Add these environment variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `NODE_ENV`: production

## Step 2: Deploy to Netlify

### Option A: Using GitHub (Recommended)
1. Push your project to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

2. Connect to Netlify:
   - Go to netlify.com/teams/[your-team]/overview
   - Click "New site from Git"
   - Select GitHub and your repository
   - Build settings should auto-populate:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Click Deploy

### Option B: Manual Deployment
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=dist
```

## Step 3: First Time Setup

1. After deployment, check Netlify logs:
   - Site Settings → Build & Deploy → Deploy logs

2. If API errors occur:
   - Verify MONGODB_URI is set correctly
   - Check MongoDB Atlas network access allows Netlify IPs

3. View your site at: `https://your-site.netlify.app`

## File Structure for Netlify
```
project/
├── netlify.toml           # ← Netlify configuration
├── netlify/
│   └── functions/
│       └── api.js         # ← Serverless API
├── src/                   # React components
├── dist/                  # Built output
├── package.json
└── vite.config.ts
```

## Testing Locally Before Deploy
```bash
# Build the project
npm run build

# Install Netlify CLI
npm install -g netlify-cli

# Test locally
netlify dev
```

Visit `http://localhost:8888` to test the deployed version locally.

## Troubleshooting

**API calls fail:**
- Check MongoDB URI is correct
- Verify MongoDB network access allows Netlify IP ranges
- Check Netlify function logs

**Build fails:**
- Check Node version compatibility
- Review Netlify deploy logs
- Ensure all dependencies are in package.json

**Site not loading:**
- Clear browser cache (Ctrl+Shift+R)
- Check Netlify site settings
- Review browser console for errors

## Monitoring

Check your site health:
- Netlify Dashboard → Overview
- Monitor build status and logs
- Set up notifications for deploy failures
