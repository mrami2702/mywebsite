import os
import requests
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import sqlite3
from dotenv import load_dotenv

load_dotenv()

class SpotifyAPI:
    def __init__(self):
        self.client_id = os.getenv('SPOTIFY_CLIENT_ID')
        self.client_secret = os.getenv('SPOTIFY_CLIENT_SECRET')
        self.redirect_uri = os.getenv('SPOTIFY_REDIRECT_URI', 'http://localhost:8000/api/spotify/callback')
        self.base_url = "https://api.spotify.com/v1"
        
        if not self.client_id or not self.client_secret:
            raise ValueError("Spotify credentials not configured")
    
    def get_auth_url(self) -> str:
        """Generate Spotify authorization URL"""
        scope = "user-read-private user-read-email user-top-read user-read-recently-played user-read-playback-state user-read-currently-playing"
        
        auth_url = "https://accounts.spotify.com/authorize"
        params = {
            'client_id': self.client_id,
            'response_type': 'code',
            'redirect_uri': self.redirect_uri,
            'scope': scope,
            'show_dialog': 'true'
        }
        
        # Build query string
        query_string = '&'.join([f"{k}={v}" for k, v in params.items()])
        return f"{auth_url}?{query_string}"
    
    def exchange_code_for_token(self, code: str) -> Dict:
        """Exchange authorization code for access token"""
        url = "https://accounts.spotify.com/api/token"
        
        data = {
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': self.redirect_uri,
            'client_id': self.client_id,
            'client_secret': self.client_secret
        }
        
        print(f"🔄 Making Spotify token exchange request...")
        print(f"🔄 Client ID: {self.client_id}")
        print(f"🔄 Code: {code[:10]}...")
        print(f"🔄 Redirect URI: {self.redirect_uri}")
        
        try:
            response = requests.post(url, data=data)
            print(f"🔄 Response status: {response.status_code}")
            print(f"🔄 Response headers: {dict(response.headers)}")
            print(f"🔄 Full response text: {response.text}")
            
            if response.status_code != 200:
                print(f"❌ Token exchange failed with status {response.status_code}")
                print(f"❌ Error response: {response.text}")
                raise Exception(f"Failed to exchange code for token: {response.text}")
            
            result = response.json()
            print(f"✅ Token exchange successful: {list(result.keys())}")
            return result
            
        except requests.exceptions.RequestException as e:
            print(f"❌ Network error during token exchange: {e}")
            raise Exception(f"Network error during token exchange: {e}")
        except Exception as e:
            print(f"❌ Unexpected error during token exchange: {e}")
            raise e
    
    def refresh_token(self, refresh_token: str) -> Dict:
        """Refresh access token using refresh token"""
        url = "https://accounts.spotify.com/api/token"
        
        data = {
            'grant_type': 'refresh_token',
            'refresh_token': refresh_token,
            'client_id': self.client_id,
            'client_secret': self.client_secret
        }
        
        response = requests.post(url, data=data)
        
        if response.status_code != 200:
            raise Exception(f"Failed to refresh token: {response.text}")
            
        return response.json()
    
    def get_user_profile(self, access_token: str) -> Dict:
        """Get current user profile"""
        headers = {'Authorization': f'Bearer {access_token}'}
        response = requests.get(f"{self.base_url}/me", headers=headers)
        
        if response.status_code != 200:
            raise Exception(f"Failed to get user profile: {response.text}")
            
        return response.json()
    
    def get_top_tracks(self, access_token: str, time_range: str = 'short_term', limit: int = 20) -> List[Dict]:
        """Get user's top tracks"""
        headers = {'Authorization': f'Bearer {access_token}'}
        params = {
            'time_range': time_range,  # short_term, medium_term, long_term
            'limit': limit
        }
        
        response = requests.get(f"{self.base_url}/me/top/tracks", headers=headers, params=params)
        
        if response.status_code != 200:
            raise Exception(f"Failed to get top tracks: {response.text}")
            
        return response.json()['items']
    
    def get_recently_played(self, access_token: str, limit: int = 20) -> List[Dict]:
        """Get user's recently played tracks"""
        headers = {'Authorization': f'Bearer {access_token}'}
        params = {'limit': limit}
        
        response = requests.get(f"{self.base_url}/me/player/recently-played", headers=headers, params=params)
        
        if response.status_code != 200:
            raise Exception(f"Failed to get recently played: {response.text}")
            
        return response.json()['items']
    
    def get_current_playback(self, access_token: str) -> Optional[Dict]:
        """Get current playback state"""
        headers = {'Authorization': f'Bearer {access_token}'}
        response = requests.get(f"{self.base_url}/me/player", headers=headers)
        
        if response.status_code == 204:  # No content (not playing)
            return None
        elif response.status_code != 200:
            raise Exception(f"Failed to get playback state: {response.text}")
            
        return response.json()
    
    def get_playlist(self, access_token: str, playlist_id: str) -> Dict:
        """Get playlist details and tracks"""
        headers = {'Authorization': f'Bearer {access_token}'}
        response = requests.get(f"{self.base_url}/playlists/{playlist_id}", headers=headers)
        
        if response.status_code != 200:
            raise Exception(f"Failed to get playlist: {response.text}")
            
        return response.json()

class SpotifyDataSync:
    def __init__(self, db_path: str = "database/website.db"):
        self.db_path = db_path
        self.spotify_api = SpotifyAPI()
    
    def save_tokens(self, user_id: int, tokens: Dict):
        """Save Spotify tokens to database"""
        conn = None
        try:
            conn = sqlite3.connect(self.db_path, timeout=30.0, check_same_thread=False)
            cursor = conn.cursor()
            
            # Create spotify_tokens table if it doesn't exist
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
            
            # Calculate expiration time
            expires_at = datetime.now() + timedelta(seconds=tokens['expires_in'])
            
            # Insert or update tokens
            cursor.execute("""
                INSERT OR REPLACE INTO spotify_tokens 
                (user_id, access_token, refresh_token, expires_at)
                VALUES (?, ?, ?, ?)
            """, (user_id, tokens['access_token'], tokens['refresh_token'], expires_at))
            
            conn.commit()
        finally:
            if conn:
                conn.close()
    
    def get_valid_tokens(self, user_id: int) -> Optional[Dict]:
        """Get valid access token for user, refresh if needed"""
        conn = None
        try:
            conn = sqlite3.connect(self.db_path, timeout=30.0, check_same_thread=False)
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT access_token, refresh_token, expires_at 
                FROM spotify_tokens 
                WHERE user_id = ?
            """, (user_id,))
            
            result = cursor.fetchone()
            
            if not result:
                return None
                
            access_token, refresh_token, expires_at = result
            expires_at = datetime.fromisoformat(expires_at)
            
            # Check if token is expired or will expire soon (within 5 minutes)
            if datetime.now() + timedelta(minutes=5) >= expires_at:
                # Refresh token
                try:
                    print(f"🔄 Refreshing expired Spotify token for user {user_id}")
                    new_tokens = self.spotify_api.refresh_token(refresh_token)
                    
                    # Update tokens in the same connection
                    cursor.execute("""
                        UPDATE spotify_tokens 
                        SET access_token = ?, refresh_token = ?, expires_at = ?
                        WHERE user_id = ?
                    """, (
                        new_tokens['access_token'], 
                        new_tokens.get('refresh_token', refresh_token),  # Spotify might not return refresh_token
                        (datetime.now() + timedelta(seconds=new_tokens['expires_in'])).isoformat(),
                        user_id
                    ))
                    conn.commit()
                    
                    return {
                        'access_token': new_tokens['access_token'],
                        'refresh_token': new_tokens.get('refresh_token', refresh_token)
                    }
                except Exception as e:
                    print(f"❌ Failed to refresh Spotify token: {e}")
                    return None
            
            # Return current valid token
            return {
                'access_token': access_token,
                'refresh_token': refresh_token
            }
        except Exception as e:
            print(f"❌ Database error in get_valid_spotify_tokens: {e}")
            return None
        finally:
            if conn:
                conn.close()
    
    def save_user_profile(self, user_id: int, profile: Dict):
        """Save Spotify user profile to database"""
        conn = None
        try:
            conn = sqlite3.connect(self.db_path, timeout=30.0, check_same_thread=False)
            cursor = conn.cursor()
            
            # Create spotify_profiles table if it doesn't exist
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS spotify_profiles (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    spotify_id TEXT NOT NULL,
                    display_name TEXT,
                    email TEXT,
                    country TEXT,
                    profile_image TEXT,
                    followers_count INTEGER,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            """)
            
            # Insert or update profile
            cursor.execute("""
                INSERT OR REPLACE INTO spotify_profiles 
                (user_id, spotify_id, display_name, email, country, profile_image, followers_count)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                user_id, profile['id'], profile.get('display_name'), profile.get('email'),
                profile.get('country'), profile.get('images', [{}])[0].get('url') if profile.get('images') else None,
                profile.get('followers', {}).get('total', 0)
            ))
            
            conn.commit()
        finally:
            if conn:
                conn.close()
    
    def save_top_tracks(self, user_id: int, tracks: List[Dict]):
        """Save top tracks to database"""
        conn = None
        try:
            conn = sqlite3.connect(self.db_path, timeout=30.0, check_same_thread=False)
            cursor = conn.cursor()
            
            # Create spotify_tracks table if it doesn't exist
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS spotify_tracks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    track_id TEXT NOT NULL,
                    track_name TEXT NOT NULL,
                    artist_name TEXT NOT NULL,
                    album_name TEXT,
                    album_art TEXT,
                    popularity INTEGER,
                    duration_ms INTEGER,
                    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            """)
            
            # Clear existing tracks for this user
            cursor.execute("DELETE FROM spotify_tracks WHERE user_id = ?", (user_id,))
            
            # Insert new tracks
            for track in tracks:
                cursor.execute("""
                    INSERT INTO spotify_tracks 
                    (user_id, track_id, track_name, artist_name, album_name, album_art, popularity, duration_ms)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    user_id, track['id'], track['name'], 
                    track['artists'][0]['name'] if track['artists'] else 'Unknown',
                    track['album']['name'] if track['album'] else 'Unknown',
                    track['album']['images'][0]['url'] if track['album'] and track['album']['images'] else None,
                    track.get('popularity', 0), track.get('duration_ms', 0)
                ))
            
            conn.commit()
        finally:
            if conn:
                conn.close() 