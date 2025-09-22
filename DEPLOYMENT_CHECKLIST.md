#  Quick Deployment Checklist

## Before You Start:
- [ ] Push all changes to GitHub
- [ ] Test your app locally (frontend + backend)
- [ ] Have your API keys ready (Strava, Spotify)

## Backend Deployment (Railway):
- [ ] Sign up at railway.app with GitHub
- [ ] Create new project from GitHub repo
- [ ] Wait for auto-deployment
- [ ] Add environment variables in Railway dashboard
- [ ] Test backend at https://your-app.railway.app/docs
- [ ] Copy your Railway backend URL

## Frontend Deployment (Vercel):
- [ ] Sign up at vercel.com with GitHub
- [ ] Import your GitHub repository
- [ ] Set build settings:
  - Framework: Create React App
  - Root Directory: frontend
  - Build Command: npm run build
  - Output Directory: build
- [ ] Add environment variable: REACT_APP_API_BASE_URL
- [ ] Deploy and get your frontend URL

## Final Steps:
- [ ] Update Railway environment variables with frontend URL
- [ ] Test your deployed website
- [ ] Test admin functionality (/admin, /admin/races)
- [ ] Test adding articles and races

## URLs to Save:
- Backend: https://your-app.railway.app
- Frontend: https://your-app.vercel.app
- Admin: https://your-app.vercel.app/admin
- Races Admin: https://your-app.vercel.app/admin/races

## Total Cost: $5/month (Railway only, Vercel is free)
