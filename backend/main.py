from fastapi import FastAPI, HTTPException, Depends, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from typing import List, Optional, Dict
import sqlite3
import os
from datetime import datetime
import jwt
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from integrations.strava import StravaAPI, StravaDataSync
from integrations.spotify import SpotifyAPI, SpotifyDataSync as SpotifyDataSyncClass

# Load environment variables
load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    init_db()
    print("âœ… Database initialized!")
    print("ðŸš€ FastAPI server starting...")
    print("ðŸ“š API documentation available at: http://localhost:8000/docs")
    
    # Debug: Check environment variables
    print(f"ðŸ” STRAVA_CLIENT_ID: {os.getenv('STRAVA_CLIENT_ID')}")
    print(f"ðŸ” STRAVA_CLIENT_SECRET: {'***' if os.getenv('STRAVA_CLIENT_SECRET') else 'None'}")
    print(f"ðŸ” STRAVA_REDIRECT_URI: {os.getenv('STRAVA_REDIRECT_URI')}")
    print(f"ðŸŽµ SPOTIFY_CLIENT_ID: {os.getenv('SPOTIFY_CLIENT_ID')}")
    print(f"ðŸŽµ SPOTIFY_CLIENT_SECRET: {'***' if os.getenv('SPOTIFY_CLIENT_SECRET') else 'None'}")
    print(f"ðŸŽµ SPOTIFY_REDIRECT_URI: {os.getenv('SPOTIFY_REDIRECT_URI')}")
    
    yield
    # Shutdown
    print("ðŸ›‘ Server shutting down...")

# Initialize FastAPI app
app = FastAPI(
    title="Maya's Personal Website API",
    description="Backend API for personal website with articles, races, fitness, and music",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React frontend (development)
        os.getenv("FRONTEND_URL", "http://localhost:3000"),  # Production frontend
        os.getenv("PRODUCTION_FRONTEND_URL", "")  # Additional production URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
SECRET_KEY = "your-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

security = HTTPBearer()

# Database setup
DATABASE_URL = "database/website.db"

def get_db():
    """Get database connection"""
    # Ensure database directory exists
    os.makedirs("database", exist_ok=True)
    
    conn = sqlite3.connect(DATABASE_URL, timeout=30.0, check_same_thread=False)
    conn.row_factory = sqlite3.Row  # This allows accessing columns by name
    return conn

def init_db():
    """Initialize database with tables"""
    conn = get_db()
    cursor = conn.cursor()
    
    # Users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            name TEXT NOT NULL,
            bio TEXT,
            profile_photo TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Strava tokens table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS strava_tokens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            access_token TEXT NOT NULL,
            refresh_token TEXT NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    """)
    
    # Strava athletes table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS strava_athletes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            strava_id TEXT NOT NULL,
            username TEXT,
            firstname TEXT,
            lastname TEXT,
            city TEXT,
            state TEXT,
            country TEXT,
            sex TEXT,
            premium BOOLEAN DEFAULT FALSE,
            profile_medium TEXT,
            profile TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    """)
    
    # Strava activities table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS strava_activities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            strava_id TEXT NOT NULL,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            distance REAL,
            moving_time INTEGER,
            elapsed_time INTEGER,
            total_elevation_gain REAL,
            start_date TIMESTAMP,
            start_date_local TIMESTAMP,
            average_speed REAL,
            max_speed REAL,
            average_heartrate REAL,
            max_heartrate REAL,
            calories INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    """)
    
    # Workouts table (for manual entries)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS workouts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            strava_id TEXT,
            type TEXT NOT NULL,
            distance REAL,
            duration INTEGER,
            date DATE NOT NULL,
            elevation REAL,
            route_data TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    """)
    
    # Songs table (for Spotify integration)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS songs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            spotify_id TEXT,
            track_name TEXT NOT NULL,
            artist TEXT NOT NULL,
            album TEXT,
            album_art TEXT,
            personal_note TEXT,
            pinned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    """)
    
    # Photos table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS photos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            race_id INTEGER,
            filename TEXT NOT NULL,
            caption TEXT,
            upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (race_id) REFERENCES races (id)
        )
    """)
    
    # Articles table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS articles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            content TEXT,
            type TEXT DEFAULT 'manual',
            url TEXT,
            tags TEXT,
            published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    """)
    
    # Races table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS races (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            race_name TEXT NOT NULL,
            date DATE NOT NULL,
            location TEXT,
            time TEXT,
            placement TEXT,
            notes TEXT,
            race_type TEXT DEFAULT 'running',
            distance TEXT DEFAULT '5k',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    """)
    
    # Spotify tokens table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS spotify_tokens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            access_token TEXT NOT NULL,
            refresh_token TEXT NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    """)

    # Spotify profiles table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS spotify_profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            spotify_id TEXT NOT NULL,
            display_name TEXT NOT NULL,
            email TEXT,
            country TEXT,
            profile_image TEXT,
            followers_count INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    """)

    # Spotify tracks table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS spotify_tracks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            spotify_id TEXT NOT NULL,
            track_name TEXT NOT NULL,
            artist TEXT NOT NULL,
            album TEXT,
            album_art TEXT,
            duration_ms INTEGER,
            popularity INTEGER,
            preview_url TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    """)
    
    # Insert default admin user if not exists
    cursor.execute("SELECT * FROM users WHERE username = 'admin'")
    if not cursor.fetchone():
        # In production, use proper password hashing
        cursor.execute("""
            INSERT INTO users (username, email, password_hash, name, bio)
            VALUES (?, ?, ?, ?, ?)
        """, ("admin", "admin@example.com", "admin123", "Maya A. Ramirez", "Admin user"))
    
    conn.commit()
    conn.close()
    
    # Run database migrations
    run_migrations()

def run_migrations():
    """Run database migrations to update existing tables"""
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        # Check if spotify_profiles table exists and has the right columns
        cursor.execute("PRAGMA table_info(spotify_profiles)")
        columns = [column[1] for column in cursor.fetchall()]
        
        # Add missing columns if they don't exist
        if 'profile_image' not in columns:
            print("ðŸ”„ Adding profile_image column to spotify_profiles table...")
            cursor.execute("ALTER TABLE spotify_profiles ADD COLUMN profile_image TEXT")
        
        if 'followers_count' not in columns:
            print("ðŸ”„ Adding followers_count column to spotify_profiles table...")
            cursor.execute("ALTER TABLE spotify_profiles ADD COLUMN followers_count INTEGER")
        
        # Check if spotify_tracks table has the right columns
        cursor.execute("PRAGMA table_info(spotify_tracks)")
        track_columns = [column[1] for column in cursor.fetchall()]
        
        if 'duration_ms' not in track_columns:
            print("ðŸ”„ Adding duration_ms column to spotify_tracks table...")
            cursor.execute("ALTER TABLE spotify_tracks ADD COLUMN duration_ms INTEGER")
        
        if 'popularity' not in track_columns:
            print("ðŸ”„ Adding popularity column to spotify_tracks table...")
            cursor.execute("ALTER TABLE spotify_tracks ADD COLUMN popularity INTEGER")
        
        if 'preview_url' not in track_columns:
            print("ðŸ”„ Adding preview_url column to spotify_tracks table...")
            cursor.execute("ALTER TABLE spotify_tracks ADD COLUMN preview_url TEXT")
        
        conn.commit()
        print("âœ… Database migrations completed successfully")
        
    except Exception as e:
        print(f"âš ï¸ Warning: Some migrations failed: {e}")
        conn.rollback()
    finally:
        conn.close()

# Pydantic models for request/response
class UserBase(BaseModel):
    username: str
    email: str
    name: str
    bio: Optional[str] = None

class User(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class StravaTokens(BaseModel):
    access_token: str
    refresh_token: str
    expires_at: int
    token_type: str = "Bearer"

class StravaAthlete(BaseModel):
    id: int
    username: Optional[str] = None
    firstname: Optional[str] = None
    lastname: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    sex: Optional[str] = None
    premium: bool = False
    profile_medium: Optional[str] = None
    profile: Optional[str] = None

class StravaActivity(BaseModel):
    id: int
    name: str
    distance: Optional[float] = None
    moving_time: Optional[int] = None
    elapsed_time: Optional[int] = None
    total_elevation_gain: Optional[float] = None
    type: Optional[str] = None
    sport_type: Optional[str] = None
    start_date: Optional[str] = None
    start_date_local: Optional[str] = None
    timezone: Optional[str] = None
    location_city: Optional[str] = None
    location_state: Optional[str] = None
    location_country: Optional[str] = None
    achievement_count: Optional[int] = None
    kudos_count: Optional[int] = None
    comment_count: Optional[int] = None
    athlete_count: Optional[int] = None
    photo_count: Optional[int] = None
    trainer: bool = False
    commute: bool = False
    manual: bool = False
    private: bool = False
    flagged: bool = False
    average_speed: Optional[float] = None
    max_speed: Optional[float] = None
    average_cadence: Optional[float] = None
    average_watts: Optional[float] = None
    weighted_average_watts: Optional[float] = None
    kilojoules: Optional[float] = None
    device_watts: bool = False
    has_heartrate: bool = False
    average_heartrate: Optional[float] = None
    max_heartrate: Optional[float] = None
    elev_high: Optional[float] = None
    elev_low: Optional[float] = None
    pr_count: Optional[int] = None

class ArticleBase(BaseModel):
    title: str
    content: Optional[str] = None
    type: str = "manual"
    url: Optional[str] = None
    tags: Optional[str] = None

class Article(ArticleBase):
    id: int
    user_id: int
    published_at: datetime
    
    class Config:
        from_attributes = True

class RaceBase(BaseModel):
    race_name: str
    date: str
    location: Optional[str] = None
    time: Optional[str] = None
    placement: Optional[str] = None
    notes: Optional[str] = None

class Race(RaceBase):
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class WorkoutBase(BaseModel):
    type: str
    distance: Optional[float] = None
    duration: Optional[int] = None
    date: str
    elevation: Optional[float] = None

class Workout(WorkoutBase):
    id: int
    user_id: int
    strava_id: Optional[str] = None
    route_data: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class SongBase(BaseModel):
    track_name: str
    artist: str
    album: Optional[str] = None
    album_art: Optional[str] = None
    personal_note: Optional[str] = None

class Song(SongBase):
    id: int
    user_id: int
    spotify_id: Optional[str] = None
    pinned_at: datetime
    
    class Config:
        from_attributes = True

# Authentication helper
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return username
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Initialize Strava services
strava_api = StravaAPI()
strava_sync = StravaDataSync()

# Initialize Spotify services
spotify_api = SpotifyAPI()
spotify_sync = SpotifyDataSyncClass()

# Override the redirect URI to match Spotify's requirements
spotify_api.redirect_uri = "http://127.0.0.1:3000/auth/spotify/callback"

# Test endpoint
@app.get("/")
async def root():
    return {"message": "Welcome to Maya's Personal Website API!", "status": "running"}

# Health check
@app.get("/health")
async def health_check():
    """Simple health check endpoint"""
    # Test database connection
    db_status = "healthy"
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        cursor.fetchone()
        conn.close()
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "database": db_status,
        "strava_configured": bool(os.getenv('STRAVA_CLIENT_ID') and os.getenv('STRAVA_CLIENT_SECRET')),
        "spotify_configured": bool(os.getenv('SPOTIFY_CLIENT_ID') and os.getenv('SPOTIFY_CLIENT_SECRET'))
    }

@app.get("/debug/strava-config")
async def debug_strava_config():
    """Debug endpoint to check Strava configuration"""
    return {
        "client_id": strava_api.client_id,
        "client_secret": "***" if strava_api.client_secret else "None",
        "redirect_uri": strava_api.redirect_uri,
        "env_vars_loaded": {
            "STRAVA_CLIENT_ID": os.getenv('STRAVA_CLIENT_ID'),
            "STRAVA_CLIENT_SECRET": "***" if os.getenv('STRAVA_CLIENT_SECRET') else "None",
            "STRAVA_REDIRECT_URI": os.getenv('STRAVA_REDIRECT_URI')
        }
    }

@app.get("/debug/spotify-config")
async def debug_spotify_config():
    """Debug endpoint to check Spotify configuration"""
    return {
        "client_id": spotify_api.client_id,
        "client_secret": "***" if spotify_api.client_secret else "None",
        "redirect_uri": spotify_api.redirect_uri,
        "env_vars_loaded": {
            "SPOTIFY_CLIENT_ID": os.getenv('SPOTIFY_CLIENT_ID'),
            "SPOTIFY_CLIENT_SECRET": "***" if os.getenv('SPOTIFY_CLIENT_SECRET') else "None",
            "SPOTIFY_REDIRECT_URI": os.getenv('SPOTIFY_REDIRECT_URI')
        }
    }

@app.get("/api/test/db")
async def test_database():
    """Test database connection"""
    conn = None
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Test basic query
        cursor.execute("SELECT COUNT(*) as count FROM users")
        user_count = cursor.fetchone()['count']
        
        # Test Strava tables
        cursor.execute("SELECT COUNT(*) as count FROM strava_tokens")
        token_count = cursor.fetchone()['count']
        
        cursor.execute("SELECT COUNT(*) as count FROM strava_athletes")
        athlete_count = cursor.fetchone()['count']
        
        # Test Spotify tables
        cursor.execute("SELECT COUNT(*) as count FROM spotify_tokens")
        spotify_token_count = cursor.fetchone()['count']
        
        cursor.execute("SELECT COUNT(*) as count FROM spotify_tracks")
        spotify_track_count = cursor.fetchone()['count']
        
        return {
            "status": "success",
            "database": "connected",
            "user_count": user_count,
            "strava_tokens_count": token_count,
            "strava_athletes_count": athlete_count,
            "spotify_tokens_count": spotify_token_count,
            "spotify_tracks_count": spotify_track_count
        }
    except Exception as e:
        print(f"âŒ Database test error: {e}")
        import traceback
        print(f"âŒ Traceback: {traceback.format_exc()}")
        return {
            "status": "error",
            "database": "failed",
            "error": str(e)
        }
    finally:
        if conn:
            conn.close()

# Users endpoints
@app.get("/api/users/me", response_model=User)
async def get_current_user_info(current_user: str = Depends(get_current_user)):
    conn = None
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE username = ?", (current_user,))
        user = cursor.fetchone()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return dict(user)
    finally:
        if conn:
            conn.close()

# Strava API endpoints
@app.get("/api/strava/auth")
async def strava_auth():
    """Get Strava authorization URL"""
    try:
        print(f"ðŸ” Generating auth URL with:")
        print(f"   Client ID: {strava_api.client_id}")
        print(f"   Redirect URI: {strava_api.redirect_uri}")
        
        auth_url = strava_api.get_auth_url()
        print(f"   Generated URL: {auth_url}")
        
        return {"auth_url": auth_url}
    except Exception as e:
        print(f"âŒ Error generating auth URL: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/strava/callback")
async def strava_callback(code: str, state: Optional[str] = None):
    """Handle Strava OAuth callback"""
    try:
        print(f"ðŸ” Callback received with code: {code[:10]}...")
        print(f"ðŸ” State: {state}")
        
        # Exchange code for tokens
        print("ðŸ”„ Exchanging code for tokens...")
        tokens = strava_api.exchange_code_for_token(code)
        print(f"âœ… Tokens received: {list(tokens.keys())}")
        
        # For now, use the default admin user (you can enhance this later)
        print("ðŸ‘¤ Getting admin user...")
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE username = 'admin'")
        user = cursor.fetchone()
        conn.close()
        
        if not user:
            raise HTTPException(status_code=404, detail="Default user not found")
        
        print(f"ðŸ‘¤ Using user ID: {user['id']}")
        
        # Save tokens to database
        print("ðŸ’¾ Saving tokens to database...")
        try:
            strava_sync.save_tokens(user['id'], tokens)
            print("âœ… Tokens saved successfully")
        except Exception as token_error:
            print(f"âŒ Token save error: {token_error}")
            raise token_error
        
        # Get athlete info
        print("ï¿½ï¿½â€â™€ï¸ Getting athlete info...")
        try:
            athlete = strava_api.get_athlete(tokens['access_token'])
            print(f"âœ… Athlete info received: {athlete.get('firstname', 'Unknown')} {athlete.get('lastname', 'Unknown')}")
        except Exception as athlete_error:
            print(f"âŒ Athlete fetch error: {athlete_error}")
            raise athlete_error
        
        # Save athlete info to database
        print("ðŸ’¾ Saving athlete info to database...")
        try:
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute("""
                INSERT OR REPLACE INTO strava_athletes 
                (id, user_id, username, firstname, lastname, city, state, country, sex, premium, profile_medium, profile)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                athlete['id'], user['id'], athlete.get('username'), athlete.get('firstname'),
                athlete.get('lastname'), athlete.get('city'), athlete.get('state'),
                athlete.get('country'), athlete.get('sex'), athlete.get('premium', False),
                athlete.get('profile_medium'), athlete.get('profile')
            ))
            conn.commit()
            conn.close()
            print("âœ… Athlete info saved successfully")
        except Exception as db_error:
            print(f"âŒ Database save error: {db_error}")
            raise db_error
        
        print("ðŸŽ‰ OAuth flow completed successfully!")
        return {
            "message": "Strava connected successfully!",
            "athlete": {
                "id": athlete['id'],
                "firstname": athlete['firstname'],
                "lastname": athlete['lastname'],
                "city": athlete.get('city', ''),
                "state": athlete.get('state', ''),
                "country": athlete.get('country', '')
            }
        }
    except Exception as e:
        print(f"âŒ Error in callback: {e}")
        print(f"âŒ Error type: {type(e)}")
        import traceback
        print(f"âŒ Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/strava/athlete", response_model=StravaAthlete)
async def get_strava_athlete():
    """Get Strava athlete profile"""
    conn = None
    try:
        # Get user ID and tokens
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE username = 'admin'")
        user = cursor.fetchone()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        print(f"ðŸ” Checking tokens for user {user['id']}")
        tokens = strava_sync.get_valid_tokens(user['id'])
        if not tokens:
            print("âŒ No valid tokens found")
            raise HTTPException(status_code=401, detail="Strava not connected")
        
        print(f"âœ… Tokens found, fetching athlete info...")
        # Get athlete info
        athlete = strava_api.get_athlete(tokens['access_token'])
        print(f"âœ… Athlete info retrieved: {athlete.get('firstname', 'Unknown')}")
        
        return athlete
    except Exception as e:
        print(f"âŒ Error in get_strava_athlete: {e}")
        import traceback
        print(f"âŒ Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:
            conn.close()

@app.get("/api/strava/activities", response_model=List[StravaActivity])
async def get_strava_activities(
    page: int = 1, 
    per_page: int = 30,
    after: Optional[int] = None,
    before: Optional[int] = None
):
    """Get Strava activities"""
    conn = None
    try:
        # Get user ID and tokens
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE username = 'admin'")
        user = cursor.fetchone()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        print(f"ðŸ” Checking tokens for user {user['id']} to get activities")
        tokens = strava_sync.get_valid_tokens(user['id'])
        if not tokens:
            print("âŒ No valid tokens found for activities")
            raise HTTPException(status_code=401, detail="Strava not connected")
        
        print(f"âœ… Tokens found, fetching activities (page {page}, per_page {per_page})...")
        # Get activities from Strava
        activities = strava_api.get_activities(tokens['access_token'], page, per_page)
        print(f"âœ… Retrieved {len(activities)} activities")
        
        return activities
    except Exception as e:
        print(f"âŒ Error in get_strava_activities: {e}")
        import traceback
        print(f"âŒ Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:
            conn.close()

@app.get("/api/strava/activities/{activity_id}", response_model=StravaActivity)
async def get_strava_activity(activity_id: int):
    """Get specific Strava activity"""
    conn = None
    try:
        # Get user ID and tokens
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE username = 'admin'")
        user = cursor.fetchone()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        tokens = strava_sync.get_valid_tokens(user['id'])
        if not tokens:
            raise HTTPException(status_code=401, detail="Strava not connected")
        
        # Get activity from Strava
        activity = strava_api.get_activity(activity_id, tokens['access_token'])
        
        return activity
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:
            conn.close()

@app.post("/api/strava/sync")
async def sync_strava_activities(limit: int = 50):
    """Sync Strava activities to local database"""
    try:
        # Get user ID
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE username = 'admin'")
        user = cursor.fetchone()
        conn.close()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Sync activities
        result = strava_sync.sync_activities(user['id'], limit)
        
        return {
            "message": f"Synced {result['synced_count']} new activities",
            "synced_count": result['synced_count'],
            "total_activities": result['total_activities']
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/strava/summary")
async def get_strava_summary(days: int = 30):
    """Get Strava activity summary"""
    try:
        # Get user ID
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE username = 'admin'")
        user = cursor.fetchone()
        conn.close()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get summary
        summary = strava_sync.get_activity_summary(user['id'], days)
        
        return summary
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/strava/disconnect")
async def disconnect_strava():
    """Disconnect Strava and clear tokens"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE username = 'admin'")
        user = cursor.fetchone()
        
        if user:
            # Clear tokens
            cursor.execute("DELETE FROM strava_tokens WHERE user_id = ?", (user['id'],))
            # Clear athlete data
            cursor.execute("DELETE FROM strava_athletes WHERE user_id = ?", (user['id'],))
            # Clear activities
            cursor.execute("DELETE FROM strava_activities WHERE user_id = ?", (user['id'],))
            conn.commit()
            print("âœ… Strava data cleared")
        
        conn.close()
        return {"message": "Strava disconnected successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/strava/clear")
async def clear_strava_tokens():
    """Clear all Strava tokens and data (for troubleshooting)"""
    conn = None
    try:
        # Get user ID
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE username = 'admin'")
        user = cursor.fetchone()
        
        if user:
            # Clear all Strava data
            cursor.execute("DELETE FROM strava_tokens WHERE user_id = ?", (user['id'],))
            cursor.execute("DELETE FROM strava_athletes WHERE user_id = ?", (user['id'],))
            cursor.execute("DELETE FROM strava_activities WHERE user_id = ?", (user['id'],))
            conn.commit()
            print("ðŸ§¹ Cleared all Strava data for troubleshooting")
        
        return {"message": "Strava tokens and data cleared successfully"}
    except Exception as e:
        print(f"âŒ Error clearing Strava data: {e}")
        return {"error": str(e)}
    finally:
        if conn:
            conn.close()

@app.post("/api/db/reset")
async def reset_database():
    """Reset database connections (for troubleshooting locked database)"""
    try:
        # Force close any existing connections by reinitializing
        init_db()
        return {"message": "Database reset successfully"}
    except Exception as e:
        print(f"âŒ Error resetting database: {e}")
        return {"error": str(e)}

@app.get("/api/strava/status")
async def get_strava_status():
    """Check if Strava is connected"""
    conn = None
    try:
        # Get user ID
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE username = 'admin'")
        user = cursor.fetchone()
        
        if not user:
            return {"connected": False, "error": "User not found"}
        
        # Check if tokens exist
        cursor.execute("""
            SELECT access_token, refresh_token, expires_at 
            FROM strava_tokens 
            WHERE user_id = ?
        """, (user['id'],))
        
        tokens = cursor.fetchone()
        
        if not tokens:
            return {"connected": False, "message": "No tokens found"}
        
        access_token, refresh_token, expires_at = tokens
        expires_at = datetime.fromisoformat(expires_at)
        
        # Check if token is expired
        if datetime.now() >= expires_at:
            return {"connected": False, "message": "Token expired", "expired_at": expires_at.isoformat()}
        
        # Check if we can get athlete info
        try:
            athlete = strava_api.get_athlete(access_token)
            return {
                "connected": True,
                "athlete": {
                    "id": athlete.get('id'),
                    "firstname": athlete.get('firstname'),
                    "lastname": athlete.get('lastname')
                },
                "token_expires": expires_at.isoformat()
            }
        except Exception as e:
            return {"connected": False, "message": f"Token invalid: {str(e)}"}
            
    except Exception as e:
        print(f"âŒ Error in get_strava_status: {e}")
        return {"connected": False, "error": str(e)}
    finally:
        if conn:
            conn.close()

# Articles endpoints
@app.get("/api/articles", response_model=List[Article])
async def get_articles():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM articles ORDER BY published_at DESC")
    articles = [dict(article) for article in cursor.fetchall()]
    conn.close()
    return articles

@app.post("/api/articles", response_model=Article)
async def create_article(article: ArticleBase, current_user: str = Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor()
    
    # Get user ID
    cursor.execute("SELECT id FROM users WHERE username = ?", (current_user,))
    user = cursor.fetchone()
    if not user:
        conn.close()
        raise HTTPException(status_code=404, detail="User not found")
    
    cursor.execute("""
        INSERT INTO articles (user_id, title, content, type, url, tags)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (user['id'], article.title, article.content, article.type, article.url, article.tags))
    
    article_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return {**article.dict(), "id": article_id, "user_id": user['id'], "published_at": datetime.now()}

# Races endpoints
@app.get("/api/races", response_model=List[Race])
async def get_races():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM races ORDER BY date DESC")
    races = [dict(race) for race in cursor.fetchall()]
    conn.close()
    return races

# Workouts endpoints
@app.get("/api/workouts", response_model=List[Workout])
async def get_workouts():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM workouts ORDER BY date DESC")
    workouts = [dict(workout) for workout in cursor.fetchall()]
    conn.close()
    return workouts

@app.post("/api/workouts", response_model=Workout)
async def create_workout(workout: WorkoutBase, current_user: str = Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor()
    
    # Get user ID
    cursor.execute("SELECT id FROM users WHERE username = ?", (current_user,))
    user = cursor.fetchone()
    if not user:
        conn.close()
        raise HTTPException(status_code=404, detail="User not found")
    
    cursor.execute("""
        INSERT INTO workouts (user_id, type, distance, duration, date, elevation)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (user['id'], workout.type, workout.distance, workout.duration, workout.date, workout.elevation))
    
    workout_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return {**workout.dict(), "id": workout_id, "user_id": user['id'], "created_at": datetime.now()}

# Songs endpoints
@app.get("/api/songs", response_model=List[Song])
async def get_songs():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM songs ORDER BY pinned_at DESC")
    songs = [dict(song) for song in cursor.fetchall()]
    conn.close()
    return songs

@app.post("/api/songs", response_model=Song)
async def create_song(song: SongBase, current_user: str = Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor()
    
    # Get user ID
    cursor.execute("SELECT id FROM users WHERE username = ?", (current_user,))
    user = cursor.fetchone()
    if not user:
        conn.close()
        raise HTTPException(status_code=404, detail="User not found")
    
    cursor.execute("""
        INSERT INTO songs (user_id, track_name, artist, album, album_art, personal_note)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (user['id'], song.track_name, song.artist, song.album, song.album_art, song.personal_note))
    
    song_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return {**song.dict(), "id": song_id, "user_id": user['id'], "pinned_at": datetime.now()}

# Spotify endpoints
@app.get("/api/spotify/auth")
async def spotify_auth():
    """Get Spotify authorization URL"""
    try:
        auth_url = spotify_api.get_auth_url()
        print(f"ðŸŽµ Generated Spotify auth URL: {auth_url}")
        return {"auth_url": auth_url}
    except Exception as e:
        print(f"âŒ Error generating Spotify auth URL: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/spotify/callback")
async def spotify_callback(code: str):
    """Handle Spotify OAuth callback"""
    try:
        print(f"ðŸŽµ Spotify OAuth callback received with code: {code[:10]}...")
        
        # Exchange code for tokens
        print("ðŸ”„ Exchanging code for tokens...")
        try:
            tokens = spotify_api.exchange_code_for_token(code)
            print(f"âœ… Token exchange successful: {list(tokens.keys())}")
        except Exception as token_error:
            print(f"âŒ Token exchange error: {token_error}")
            raise token_error
        
        # Get user ID
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE username = 'admin'")
        user = cursor.fetchone()
        conn.close()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Save tokens to database
        print("ðŸ’¾ Saving Spotify tokens to database...")
        try:
            spotify_sync.save_tokens(user['id'], tokens)
            print("âœ… Spotify tokens saved successfully")
        except Exception as token_error:
            print(f"âŒ Token save error: {token_error}")
            raise token_error
        
        # Get user profile
        print("ðŸŽµ Getting Spotify user profile...")
        try:
            profile = spotify_api.get_user_profile(tokens['access_token'])
            print(f"âœ… Profile received: {profile.get('display_name', 'Unknown')}")
        except Exception as profile_error:
            print(f"âŒ Profile fetch error: {profile_error}")
            raise profile_error
        
        # Save profile to database
        print("ðŸ’¾ Saving Spotify profile to database...")
        try:
            spotify_sync.save_user_profile(user['id'], profile)
            print("âœ… Spotify profile saved successfully")
        except Exception as db_error:
            print(f"âŒ Database save error: {db_error}")
            raise db_error
        
        print("ðŸŽ‰ Spotify OAuth flow completed successfully!")
        return {
            "message": "Spotify connected successfully!",
            "profile": {
                "id": profile['id'],
                "display_name": profile.get('display_name', 'Unknown'),
                "email": profile.get('email', ''),
                "country": profile.get('country', ''),
                "followers": profile.get('followers', {}).get('total', 0)
            }
        }
    except Exception as e:
        print(f"âŒ Error in Spotify callback: {e}")
        print(f"âŒ Error type: {type(e)}")
        import traceback
        print(f"âŒ Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/spotify/frontend-callback")
async def spotify_frontend_callback(code: str):
    """Handle Spotify OAuth callback from frontend (port 3000)"""
    try:
        print(f"ðŸŽµ Spotify frontend callback received with code: {code[:10]}...")
        
        # Exchange code for tokens
        print("ðŸ”„ Exchanging code for tokens...")
        try:
            tokens = spotify_api.exchange_code_for_token(code)
            print(f"âœ… Token exchange successful: {list(tokens.keys())}")
        except Exception as token_error:
            print(f"âŒ Token exchange error: {token_error}")
            raise token_error
        
        # Get user ID
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE username = 'admin'")
        user = cursor.fetchone()
        conn.close()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Save tokens to database
        print("ðŸ’¾ Saving Spotify tokens to database...")
        try:
            spotify_sync.save_tokens(user['id'], tokens)
            print("âœ… Spotify tokens saved successfully")
        except Exception as token_error:
            print(f"âŒ Token save error: {token_error}")
            raise token_error
        
        # Get user profile
        print("ðŸŽµ Getting Spotify user profile...")
        try:
            profile = spotify_api.get_user_profile(tokens['access_token'])
            print(f"âœ… Profile received: {profile.get('display_name', 'Unknown')}")
        except Exception as profile_error:
            print(f"âŒ Profile fetch error: {profile_error}")
            raise profile_error
        
        # Save profile to database
        print("ðŸ’¾ Saving Spotify profile to database...")
        try:
            spotify_sync.save_user_profile(user['id'], profile)
            print("âœ… Spotify profile saved successfully")
        except Exception as db_error:
            print(f"âŒ Database save error: {db_error}")
            raise db_error
        
        print("ðŸŽ‰ Spotify OAuth flow completed successfully!")
        return {
            "message": "Spotify connected successfully!",
            "profile": {
                "id": profile['id'],
                "display_name": profile.get('display_name', 'Unknown'),
                "email": profile.get('email', ''),
                "country": profile.get('country', ''),
                "followers": profile.get('followers', {}).get('total', 0)
            }
        }
    except Exception as e:
        print(f"âŒ Error in Spotify frontend callback: {e}")
        print(f"âŒ Error type: {type(e)}")
        import traceback
        print(f"âŒ Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/spotify/profile")
async def get_spotify_profile():
    """Get Spotify user profile"""
    try:
        # Get user ID and tokens
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE username = 'admin'")
        user = cursor.fetchone()
        conn.close()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        print(f"ðŸ” Checking Spotify tokens for user {user['id']}")
        tokens = spotify_sync.get_valid_tokens(user['id'])
        if not tokens:
            print("âŒ No valid Spotify tokens found")
            raise HTTPException(status_code=401, detail="Spotify not connected")
        
        print(f"âœ… Spotify tokens found, fetching profile...")
        # Get profile from Spotify
        profile = spotify_api.get_user_profile(tokens['access_token'])
        print(f"âœ… Spotify profile retrieved: {profile.get('display_name', 'Unknown')}")
        
        return profile
    except Exception as e:
        print(f"âŒ Error in get_spotify_profile: {e}")
        import traceback
        print(f"âŒ Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/spotify/top-tracks")
async def get_spotify_top_tracks(
    time_range: str = 'short_term',
    limit: int = 20
):
    """Get Spotify top tracks"""
    try:
        # Get user ID and tokens
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE username = 'admin'")
        user = cursor.fetchone()
        conn.close()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        print(f"ðŸ” Checking Spotify tokens for user {user['id']} to get top tracks")
        tokens = spotify_sync.get_valid_tokens(user['id'])
        if not tokens:
            print("âŒ No valid Spotify tokens found for top tracks")
            raise HTTPException(status_code=401, detail="Spotify not connected")
        
        print(f"âœ… Spotify tokens found, fetching top tracks (time_range: {time_range}, limit: {limit})...")
        # Get top tracks from Spotify
        tracks = spotify_api.get_top_tracks(tokens['access_token'], time_range, limit)
        print(f"âœ… Retrieved {len(tracks)} top tracks")
        
        # Save tracks to database
        try:
            spotify_sync.save_top_tracks(user['id'], tracks)
            print("âœ… Top tracks saved to database")
        except Exception as save_error:
            print(f"âš ï¸ Warning: Could not save tracks to database: {save_error}")
        
        return tracks
    except Exception as e:
        print(f"âŒ Error in get_spotify_top_tracks: {e}")
        import traceback
        print(f"âŒ Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/spotify/recently-played")
async def get_spotify_recently_played(limit: int = 20):
    """Get Spotify recently played tracks"""
    try:
        # Get user ID and tokens
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE username = 'admin'")
        user = cursor.fetchone()
        conn.close()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        tokens = spotify_sync.get_valid_tokens(user['id'])
        if not tokens:
            raise HTTPException(status_code=401, detail="Spotify not connected")
        
        # Get recently played from Spotify
        tracks = spotify_api.get_recently_played(tokens['access_token'], limit)
        
        return tracks
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/spotify/current-playback")
async def get_spotify_current_playback():
    """Get Spotify current playback state"""
    try:
        # Get user ID and tokens
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE username = 'admin'")
        user = cursor.fetchone()
        conn.close()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        tokens = spotify_sync.get_valid_tokens(user['id'])
        if not tokens:
            raise HTTPException(status_code=401, detail="Spotify not connected")
        
        # Get current playback from Spotify
        playback = spotify_api.get_current_playback(tokens['access_token'])
        
        if not playback:
            return {"message": "No active playback"}
        
        return playback
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/spotify/status")
async def get_spotify_status():
    """Check if Spotify is connected"""
    try:
        # Get user ID
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE username = 'admin'")
        user = cursor.fetchone()
        conn.close()
        
        if not user:
            return {"connected": False, "error": "User not found"}
        
        # Check if tokens exist
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT access_token, refresh_token, expires_at 
            FROM spotify_tokens 
            WHERE user_id = ?
        """, (user['id'],))
        
        tokens = cursor.fetchone()
        conn.close()
        
        if not tokens:
            return {"connected": False, "message": "No tokens found"}
        
        access_token, refresh_token, expires_at = tokens
        expires_at = datetime.fromisoformat(expires_at)
        
        # Check if token is expired
        if datetime.now() >= expires_at:
            return {"connected": False, "message": "Token expired", "expired_at": expires_at.isoformat()}
        
        # Check if we can get user profile
        try:
            profile = spotify_api.get_user_profile(access_token)
            return {
                "connected": True,
                "profile": {
                    "id": profile.get('id'),
                    "display_name": profile.get('display_name'),
                    "email": profile.get('email')
                },
                "token_expires": expires_at.isoformat()
            }
        except Exception as e:
            return {"connected": False, "message": f"Token invalid: {str(e)}"}
            
    except Exception as e:
        print(f"âŒ Error in get_spotify_status: {e}")
        return {"connected": False, "error": str(e)}

@app.post("/api/spotify/disconnect")
async def disconnect_spotify():
    """Disconnect Spotify and clear tokens"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE username = 'admin'")
        user = cursor.fetchone()
        
        if user:
            # Clear tokens
            cursor.execute("DELETE FROM spotify_tokens WHERE user_id = ?", (user['id'],))
            # Clear profile
            cursor.execute("DELETE FROM spotify_profiles WHERE user_id = ?", (user['id'],))
            # Clear tracks
            cursor.execute("DELETE FROM spotify_tracks WHERE user_id = ?", (user['id'],))
            conn.commit()
            print("ðŸ§¹ Cleared all Spotify data")
        
        conn.close()
        return {"message": "Spotify disconnected successfully"}
    except Exception as e:
        print(f"âŒ Error disconnecting Spotify: {e}")
        return {"error": str(e)}

@app.post("/api/spotify/clear")
async def clear_spotify_data():
    """Clear all Spotify data (for troubleshooting)"""
    try:
        # Get user ID
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE username = 'admin'")
        user = cursor.fetchone()
        
        if user:
            # Clear all Spotify data
            cursor.execute("DELETE FROM spotify_tokens WHERE user_id = ?", (user['id'],))
            cursor.execute("DELETE FROM spotify_profiles WHERE user_id = ?", (user['id'],))
            cursor.execute("DELETE FROM spotify_tracks WHERE user_id = ?", (user['id'],))
            conn.commit()
            print("ðŸ§¹ Cleared all Spotify data for troubleshooting")
        
        conn.close()
        return {"message": "Spotify data cleared successfully"}
    except Exception as e:
        print(f"âŒ Error clearing Spotify data: {e}")
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 




# Enhanced Article Models
class ArticleCreate(BaseModel):
    title: str
    url: str
    description: Optional[str] = None
    category: str = "technology"
    tags: Optional[str] = None
    readTime: Optional[str] = None
    source: Optional[str] = None

class ArticleUpdate(BaseModel):
    title: Optional[str] = None
    url: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[str] = None
    readTime: Optional[str] = None
    source: Optional[str] = None

class ArticleResponse(BaseModel):
    id: int
    title: str
    url: str
    description: Optional[str] = None
    category: str
    tags: List[str] = []
    readTime: Optional[str] = None
    source: Optional[str] = None
    dateAdded: str
    isRead: bool = False
    isFavorite: bool = False
    
    class Config:
        from_attributes = True

# Enhanced Articles endpoints
@app.get("/api/articles/enhanced", response_model=List[ArticleResponse])
async def get_articles_enhanced():
    """Get all articles with enhanced format"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, title, url, content as description, type as category, tags, 
               published_at as dateAdded, 0 as isRead, 0 as isFavorite
        FROM articles 
        ORDER BY published_at DESC
    """)
    articles = []
    for row in cursor.fetchall():
        article = dict(row)
        # Parse tags from string to list
        article['tags'] = [tag.strip() for tag in (article['tags'] or '').split(',') if tag.strip()]
        # Convert datetime to string
        article['dateAdded'] = article['dateAdded'].split('T')[0] if article['dateAdded'] else ''
        articles.append(ArticleResponse(**article))
    conn.close()
    return articles

@app.post("/api/articles/enhanced", response_model=ArticleResponse)
async def create_article_enhanced(article: ArticleCreate):
    """Create a new article with enhanced format"""
    conn = get_db()
    cursor = conn.cursor()
    
    # Get admin user ID
    cursor.execute("SELECT id FROM users WHERE username = 'admin'")
    user = cursor.fetchone()
    if not user:
        conn.close()
        raise HTTPException(status_code=404, detail="Admin user not found")
    
    # Insert article
    cursor.execute("""
        INSERT INTO articles (user_id, title, content, type, url, tags)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        user['id'], 
        article.title, 
        article.description, 
        article.category, 
        article.url, 
        article.tags
    ))
    
    article_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    # Return the created article
    return ArticleResponse(
        id=article_id,
        title=article.title,
        url=article.url,
        description=article.description,
        category=article.category,
        tags=[tag.strip() for tag in (article.tags or '').split(',') if tag.strip()],
        readTime=article.readTime,
        source=article.source,
        dateAdded=datetime.now().strftime('%Y-%m-%d'),
        isRead=False,
        isFavorite=False
    )

@app.put("/api/articles/enhanced/{article_id}", response_model=ArticleResponse)
async def update_article_enhanced(article_id: int, article: ArticleUpdate):
    """Update an existing article with enhanced format"""
    conn = get_db()
    cursor = conn.cursor()
    
    # Check if article exists
    cursor.execute("SELECT * FROM articles WHERE id = ?", (article_id,))
    existing_article = cursor.fetchone()
    if not existing_article:
        conn.close()
        raise HTTPException(status_code=404, detail="Article not found")
    
    # Build update query dynamically
    update_fields = []
    update_values = []
    
    if article.title is not None:
        update_fields.append("title = ?")
        update_values.append(article.title)
    
    if article.url is not None:
        update_fields.append("url = ?")
        update_values.append(article.url)
    
    if article.description is not None:
        update_fields.append("content = ?")
        update_values.append(article.description)
    
    if article.category is not None:
        update_fields.append("type = ?")
        update_values.append(article.category)
    
    if article.tags is not None:
        update_fields.append("tags = ?")
        update_values.append(article.tags)
    
    if update_fields:
        update_values.append(article_id)
        cursor.execute(f"""
            UPDATE articles 
            SET {', '.join(update_fields)}
            WHERE id = ?
        """, update_values)
        conn.commit()
    
    # Get updated article
    cursor.execute("""
        SELECT id, title, url, content as description, type as category, tags, 
               published_at as dateAdded
        FROM articles 
        WHERE id = ?
    """, (article_id,))
    updated_article = cursor.fetchone()
    conn.close()
    
    return ArticleResponse(
        id=updated_article['id'],
        title=updated_article['title'],
        url=updated_article['url'],
        description=updated_article['description'],
        category=updated_article['category'],
        tags=[tag.strip() for tag in (updated_article['tags'] or '').split(',') if tag.strip()],
        readTime=article.readTime,
        source=article.source,
        dateAdded=updated_article['dateAdded'].split('T')[0] if updated_article['dateAdded'] else '',
        isRead=False,
        isFavorite=False
    )

@app.delete("/api/articles/enhanced/{article_id}")
async def delete_article_enhanced(article_id: int):
    """Delete an article"""
    conn = get_db()
    cursor = conn.cursor()
    
    # Check if article exists
    cursor.execute("SELECT id FROM articles WHERE id = ?", (article_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Article not found")
    
    # Delete article
    cursor.execute("DELETE FROM articles WHERE id = ?", (article_id,))
    conn.commit()
    conn.close()
    
    return {"message": "Article deleted successfully"}

@app.get("/api/articles/enhanced/{article_id}", response_model=ArticleResponse)
async def get_article_enhanced(article_id: int):
    """Get a specific article with enhanced format"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, title, url, content as description, type as category, tags, 
               published_at as dateAdded
        FROM articles 
        WHERE id = ?
    """, (article_id,))
    article = cursor.fetchone()
    conn.close()
    
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    return ArticleResponse(
        id=article['id'],
        title=article['title'],
        url=article['url'],
        description=article['description'],
        category=article['category'],
        tags=[tag.strip() for tag in (article['tags'] or '').split(',') if tag.strip()],
        readTime=None,
        source=None,
        dateAdded=article['dateAdded'].split('T')[0] if article['dateAdded'] else '',
        isRead=False,
        isFavorite=False
    )




# Enhanced Race Models
class RaceCreate(BaseModel):
    raceName: str
    date: str
    location: Optional[str] = None
    time: Optional[str] = None
    placement: Optional[str] = None
    distance: str = "5k"
    raceType: str = "running"
    notes: Optional[str] = None

class RaceUpdate(BaseModel):
    raceName: Optional[str] = None
    date: Optional[str] = None
    location: Optional[str] = None
    time: Optional[str] = None
    placement: Optional[str] = None
    distance: Optional[str] = None
    raceType: Optional[str] = None
    notes: Optional[str] = None

class RaceResponse(BaseModel):
    id: int
    raceName: str
    date: str
    location: Optional[str] = None
    time: Optional[str] = None
    placement: Optional[str] = None
    distance: Optional[str] = '5k'
    raceType: Optional[str] = 'running'
    notes: Optional[str] = None
    year: int
    
    class Config:
        from_attributes = True

# Enhanced Races endpoints
@app.get("/api/races", response_model=List[RaceResponse])
async def get_races():
    """Get all races"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, race_name, date, location, time, placement, notes, created_at
        FROM races 
        ORDER BY date DESC
    """)
    races = []
    for row in cursor.fetchall():
        race = dict(row)
        # Extract year from date
        race['year'] = datetime.strptime(race['date'], '%Y-%m-%d').year
        # Use actual values from database
        race['distance'] = race.get('distance', '5k')  # Use database value or default
        race['raceType'] = race.get('race_type', 'running')  # Use database value or default
        races.append(RaceResponse(**race))
    conn.close()
    return races



@app.post("/api/races", response_model=RaceResponse)
async def create_race(race: RaceCreate):
    """Create a new race"""
    conn = get_db()
    cursor = conn.cursor()
    
    # Get admin user ID
    cursor.execute("SELECT id FROM users WHERE username = 'admin'")
    user = cursor.fetchone()
    if not user:
        conn.close()
        raise HTTPException(status_code=404, detail="Admin user not found")
    
    # Insert race
    cursor.execute("""
        INSERT INTO races (user_id, race_name, date, location, time, placement, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        user['id'], 
        race.raceName, 
        race.date, 
        race.location, 
        race.time, 
        race.placement, 
        race.notes
    ))
    
    race_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    # Return the created race
    return RaceResponse(
        id=race_id,
        raceName=race.raceName,
        date=race.date,
        location=race.location,
        time=race.time,
        placement=race.placement,
        distance=race.distance,
        raceType=race.raceType,
        notes=race.notes,
        year=datetime.strptime(race.date, '%Y-%m-%d').year
    )

@app.put("/api/races/{race_id}", response_model=RaceResponse)
async def update_race(race_id: int, race: RaceUpdate):
    """Update an existing race"""
    conn = get_db()
    cursor = conn.cursor()
    
    # Check if race exists
    cursor.execute("SELECT * FROM races WHERE id = ?", (race_id,))
    existing_race = cursor.fetchone()
    if not existing_race:
        conn.close()
        raise HTTPException(status_code=404, detail="Race not found")
    
    # Build update query dynamically
    update_fields = []
    update_values = []
    
    if race.raceName is not None:
        update_fields.append("race_name = ?")
        update_values.append(race.raceName)
    
    if race.date is not None:
        update_fields.append("date = ?")
        update_values.append(race.date)
    
    if race.location is not None:
        update_fields.append("location = ?")
        update_values.append(race.location)
    
    if race.time is not None:
        update_fields.append("time = ?")
        update_values.append(race.time)
    
    if race.placement is not None:
        update_fields.append("placement = ?")
        update_values.append(race.placement)
    
    if race.notes is not None:
        update_fields.append("notes = ?")
        update_values.append(race.notes)
    
    if update_fields:
        update_values.append(race_id)
        cursor.execute(f"""
            UPDATE races 
            SET {', '.join(update_fields)}
            WHERE id = ?
        """, update_values)
        conn.commit()
    
    # Get updated race
    cursor.execute("""
        SELECT id, race_name, date, location, time, placement, notes
        FROM races 
        WHERE id = ?
    """, (race_id,))
    updated_race = cursor.fetchone()
    conn.close()
    
    return RaceResponse(
        id=updated_race['id'],
        raceName=updated_race['race_name'],
        date=updated_race['date'],
        location=updated_race['location'],
        time=updated_race['time'],
        placement=updated_race['placement'],
        distance='5k',  # Default since column doesn't exist
        raceType='running',  # Default since column doesn't exist
        notes=updated_race['notes'],
        year=datetime.strptime(updated_race['date'], '%Y-%m-%d').year
    )

@app.delete("/api/races/{race_id}")
async def delete_race(race_id: int):
    """Delete a race"""
    conn = get_db()
    cursor = conn.cursor()
    
    # Check if race exists
    cursor.execute("SELECT id FROM races WHERE id = ?", (race_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Race not found")
    
    # Delete race
    cursor.execute("DELETE FROM races WHERE id = ?", (race_id,))
    conn.commit()
    conn.close()
    
    return {"message": "Race deleted successfully"}

@app.get("/api/races/{race_id}", response_model=RaceResponse)
async def get_race(race_id: int):
    """Get a specific race"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, race_name, date, location, time, placement, notes
        FROM races 
        WHERE id = ?
    """, (race_id,))
    race = cursor.fetchone()
    conn.close()
    
    if not race:
        raise HTTPException(status_code=404, detail="Race not found")
    
    return RaceResponse(
        id=race['id'],
        raceName=race['race_name'],
        date=race['date'],
        location=race['location'],
        time=race['time'],
        placement=race['placement'],
        distance='5k',  # Default
        raceType='running',  # Default
        notes=race['notes'],
        year=datetime.strptime(race['date'], '%Y-%m-%d').year
    )


















