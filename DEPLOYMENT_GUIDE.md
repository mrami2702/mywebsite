#  Maya's Website Deployment Guide

##  Pre-Deployment Checklist

###  Backend Preparation (COMPLETED)
- [x] Environment variables configured
- [x] CORS settings updated for production
- [x] Railway.json configuration created
- [x] Procfile created for Heroku compatibility
- [x] Requirements.txt verified

###  Frontend Preparation (COMPLETED)
- [x] Environment variables for API URLs
- [x] API services updated to use env vars
- [x] Production build configuration

##  Deployment Options

### Option 1: Railway (Recommended - $5/month)
**Pros:** Easy setup, includes database, automatic deployments
**Cons:** Paid service

### Option 2: Render (Free tier available)
**Pros:** Free tier, good for small projects
**Cons:** Limited free tier resources

### Option 3: Heroku (Paid)
**Pros:** Very reliable, lots of add-ons
**Cons:** No free tier anymore

##  Step-by-Step Deployment

### Phase 1: Deploy Backend

#### Using Railway:
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project"  "Deploy from GitHub repo"
4. Select your repository
5. Railway will auto-detect Python and deploy
6. Add environment variables in Railway dashboard:
   - `FRONTEND_URL` = your frontend URL (set after frontend deployment)
   - `SECRET_KEY` = generate a secure random string
   - `JWT_SECRET_KEY` = generate another secure random string
   - `STRAVA_CLIENT_ID` = your Strava app ID
   - `STRAVA_CLIENT_SECRET` = your Strava app secret
   - `SPOTIFY_CLIENT_ID` = your Spotify app ID
   - `SPOTIFY_CLIENT_SECRET` = your Spotify app secret
7. Railway will give you a URL like: `https://your-app.railway.app`

### Phase 2: Deploy Frontend

#### Using Vercel (Recommended):
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "New Project"  Import your repository
4. Set build settings:
   - Framework Preset: Create React App
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `build`
5. Add environment variable:
   - `REACT_APP_API_BASE_URL` = your Railway backend URL
6. Deploy!

#### Using Netlify:
1. Go to [netlify.com](https://netlify.com)
2. Sign up with GitHub
3. Click "New site from Git"  GitHub
4. Select your repository
5. Set build settings:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/build`
6. Add environment variable:
   - `REACT_APP_API_BASE_URL` = your Railway backend URL
7. Deploy!

### Phase 3: Update Backend CORS
After frontend deployment, update your Railway environment variables:
- `FRONTEND_URL` = your Vercel/Netlify frontend URL
- `PRODUCTION_FRONTEND_URL` = your Vercel/Netlify frontend URL

##  Environment Variables Reference

### Backend (Railway):
```
FRONTEND_URL=https://your-frontend.vercel.app
PRODUCTION_FRONTEND_URL=https://your-frontend.vercel.app
SECRET_KEY=your-super-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here
STRAVA_CLIENT_ID=your_strava_client_id
STRAVA_CLIENT_SECRET=your_strava_client_secret
STRAVA_REDIRECT_URI=https://your-backend.railway.app/api/strava/callback
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=https://your-backend.railway.app/api/spotify/callback
```

### Frontend (Vercel/Netlify):
```
REACT_APP_API_BASE_URL=https://your-backend.railway.app
REACT_APP_ENVIRONMENT=production
```

##  Testing Your Deployment

1. **Backend Health Check**: Visit `https://your-backend.railway.app/docs`
2. **Frontend**: Visit your frontend URL
3. **Admin Pages**: Test `/admin` and `/admin/races`
4. **API Integration**: Try adding articles/races through admin interface

##  Cost Breakdown

### Railway (Backend):
- **Hobby Plan**: $5/month
- Includes: Database, 512MB RAM, 1GB storage

### Vercel (Frontend):
- **Hobby Plan**: FREE
- Includes: Unlimited personal projects, 100GB bandwidth

### Total Monthly Cost: $5

##  Important Notes

1. **Database**: Railway provides PostgreSQL automatically
2. **SSL**: Both Railway and Vercel provide free SSL certificates
3. **Custom Domain**: You can add a custom domain later
4. **Backups**: Railway automatically backs up your database
5. **Monitoring**: Both platforms provide basic monitoring

##  Updates and Maintenance

- **Code Updates**: Push to GitHub  Automatic deployment
- **Environment Variables**: Update in platform dashboards
- **Database**: Access through Railway dashboard
- **Logs**: View in platform dashboards

##  Troubleshooting

### Common Issues:
1. **CORS Errors**: Check FRONTEND_URL environment variable
2. **API Not Found**: Verify REACT_APP_API_BASE_URL
3. **Database Issues**: Check Railway database connection
4. **Build Failures**: Check build logs in deployment platform

### Getting Help:
- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- Netlify Docs: https://docs.netlify.com
