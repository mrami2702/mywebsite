# Maya A. Ramirez - Personal Website

A modern, warm-toned personal website built with FastAPI and React, showcasing Maya's professional background, fitness journey, and personal interests.

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)
```bash
python setup.py
```

### Option 2: Manual Setup
1. **Backend Setup**:
   ```bash
   cd backend
   python -m venv venv
   # Windows: venv\Scripts\activate
   # Mac/Linux: source venv/bin/activate
   pip install -r requirements.txt
   python main.py
   ```

2. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   npm start
   ```

## ✨ What's Built

### **Phase 1: Core Backbone ✅ COMPLETE**
- **FastAPI Backend**: Modern Python API with automatic documentation
- **React Frontend**: Clean, responsive interface with smooth animations
- **SQLite Database**: Basic data models for users, articles, races, workouts, songs
- **Navigation**: Modern navigation with mobile-responsive design
- **Basic Pages**: Home, About, and placeholder pages for future sections

### **Phase 2: Content Structure** (Next)
- Article management system
- Photo gallery for races
- Resume display
- Content management interface

### **Phase 3: External Integrations** (Future)
- Strava API integration
- Spotify API integration
- Automated data sync

### **Phase 4: Polish & Deploy** (Future)
- Advanced UI/UX features
- Performance optimization
- Production deployment

## 🏗️ Architecture

```
mywebsite/
├── backend/                 # FastAPI server
│   ├── main.py            # Main application
│   ├── requirements.txt   # Python dependencies
│   └── env.example       # Environment template
├── frontend/              # React application
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   └── App.js        # Main app component
│   ├── public/           # Static assets
│   └── package.json      # Node dependencies
└── setup.py              # Automated setup script
```

## 🎨 Design Features

- **Color Palette**: Warm modern theme (#FF6B35, #F7931E, #FFF8DC, #8B7765, #4A4238)
- **Typography**: Inter font family for clean readability
- **Animations**: Framer Motion for smooth, engaging interactions
- **Responsive**: Mobile-first design that works on all devices
- **Modern UI**: Clean cards, rounded corners, subtle shadows

## 🔧 Technology Stack

### Backend
- **FastAPI**: Modern, fast Python web framework
- **SQLite**: Lightweight database for development
- **SQLAlchemy**: Database ORM
- **Pydantic**: Data validation and serialization
- **JWT**: Authentication system

### Frontend
- **React 18**: Modern React with hooks
- **React Router**: Client-side routing
- **Styled Components**: CSS-in-JS styling
- **Framer Motion**: Animation library
- **React Icons**: Beautiful icon set

## 📚 API Documentation

Once your backend is running, visit:
- **Interactive Docs**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc

### Available Endpoints
- `GET /` - Health check
- `GET /health` - Server status
- `GET /api/articles` - Get all articles
- `POST /api/articles` - Create article (admin)
- `GET /api/races` - Get all races
- `POST /api/races` - Create race (admin)
- `GET /api/workouts` - Get all workouts
- `POST /api/workouts` - Create workout (admin)
- `GET /api/songs` - Get all songs
- `POST /api/songs` - Create song (admin)

## 🚀 Running the Application

### Backend (Port 8000)
```bash
cd backend
# Activate virtual environment
python main.py
```

### Frontend (Port 3000)
```bash
cd frontend
npm start
```

### Access Points
- **Website**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs
- **Backend API**: http://localhost:8000

## 🔐 Authentication

The system includes a basic JWT-based authentication system:
- **Default Admin**: username: `admin`, password: `admin123`
- **Security**: Change default credentials in production
- **Protected Routes**: Admin-only endpoints for content management

## 📱 Features

### Current Features
- ✅ Responsive navigation with mobile menu
- ✅ Beautiful homepage with hero section
- ✅ About page with skills and contact info
- ✅ Placeholder pages for future sections
- ✅ Smooth animations and transitions
- ✅ Mobile-responsive design
- ✅ FastAPI backend with auto-docs
- ✅ Basic database structure

### Coming Soon
- 📝 Article management system
- 🏃‍♀️ Race photo gallery
- 💪 Strava workout integration
- 🎵 Spotify music integration
- 💼 Professional resume display
- 🔐 Admin content management

## 🛠️ Development

### Adding New Pages
1. Create component in `frontend/src/pages/`
2. Add route in `frontend/src/App.js`
3. Add navigation item in `frontend/src/components/Navigation.js`

### Adding New API Endpoints
1. Add model in `backend/main.py`
2. Create CRUD endpoints
3. Test using FastAPI's automatic docs

### Styling
- Use styled-components for component-specific styles
- Follow the established color palette
- Maintain responsive design principles

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
# Deploy build folder to Vercel
```

### Backend (Railway/Heroku)
```bash
cd backend
# Update requirements.txt for production
# Deploy to Railway or Heroku
```

## 🤝 Contributing

This is a personal website project, but suggestions and improvements are welcome!

## 📄 License

Personal project - All rights reserved.

## 📞 Contact

- **Email**: mrami2702@gmail.com
- **GitHub**: https://github.com/mrami2702
- **LinkedIn**: https://linkedin.com/in/maya-ramirez-367066184

---

**Built with ❤️ using FastAPI + React** 