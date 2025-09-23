#  Deployment Guide for Maya's Website

## Overview
Your website has two parts:
- **Backend**: FastAPI + SQLite (Python)
- **Frontend**: React (JavaScript)

##  Recommended Deployment Strategy

### Backend: Railway (Recommended)
-  Easy Python deployment
-  Free tier available
-  Automatic deployments from GitHub
-  Built-in database support

### Frontend: Vercel (Recommended)
-  Perfect for React apps
-  Free tier with great performance
-  Automatic deployments from GitHub
-  Custom domain support

##  Step-by-Step Deployment

### Step 1: Deploy Backend to Railway

1. **Go to [Railway.app](https://railway.app)**
2. **Sign up with GitHub**
3. **Click "New Project"  "Deploy from GitHub repo"**
4. **Select your repository**
5. **Railway will auto-detect it's a Python project**
6. **Set Environment Variables:**
   ```
   FRONTEND_URL=https://your-frontend-url.vercel.app
   JWT_SECRET_KEY=your-random-secret-key-here
   ```
7. **Deploy!** Railway will give you a URL like `https://your-app.railway.app`

### Step 2: Deploy Frontend to Vercel

1. **Go to [Vercel.com](https://vercel.com)**
2. **Sign up with GitHub**
3. **Click "New Project"**
4. **Import your repository**
5. **Set Build Settings:**
   - Framework Preset: `Create React App`
   - Root Directory: `frontend`
6. **Set Environment Variables:**
   ```
   REACT_APP_API_BASE_URL=https://your-backend-url.railway.app
   ```
7. **Deploy!** Vercel will give you a URL like `https://your-app.vercel.app`

### Step 3: Update Backend CORS

1. **Go back to Railway**
2. **Update Environment Variables:**
   ```
   FRONTEND_URL=https://your-frontend-url.vercel.app
   PRODUCTION_FRONTEND_URL=https://your-frontend-url.vercel.app
   ```
3. **Redeploy backend**

##  Alternative Platforms

### Backend Alternatives:
- **Render**: Free tier, good for Python
- **Heroku**: Popular but more complex setup

### Frontend Alternatives:
- **Netlify**: Great free tier, easy setup
- **GitHub Pages**: Free but static only

##  Files Created for Deployment

- `Procfile` - For Heroku/Railway deployment
- `railway.json` - Railway-specific configuration
- `backend/.env.production` - Backend environment template
- `frontend/.env.development` - Frontend dev environment
- `frontend/.env.production` - Frontend production environment

##  After Deployment

1. **Test your website** - make sure everything works
2. **Add custom domain** (optional)
3. **Set up automatic deployments** from GitHub
4. **Monitor performance** and usage

##  Troubleshooting

- **CORS errors**: Check that FRONTEND_URL is set correctly in backend
- **API not found**: Verify REACT_APP_API_BASE_URL in frontend
- **Database issues**: Railway handles SQLite automatically
- **Build failures**: Check that all dependencies are in requirements.txt

##  Cost Estimate

- **Railway**: Free tier (500 hours/month)
- **Vercel**: Free tier (100GB bandwidth/month)
- **Total**: $0/month for personal use!

Ready to deploy? Let's start with the backend! 
