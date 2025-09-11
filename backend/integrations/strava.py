import os
import requests
import json
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import sqlite3

class StravaAPI:
    def __init__(self):
        self.client_id = os.getenv('STRAVA_CLIENT_ID')
        self.client_secret = os.getenv('STRAVA_CLIENT_SECRET')
        self.redirect_uri = os.getenv('STRAVA_REDIRECT_URI', '').strip('"').strip("'")
        self.base_url = "https://www.strava.com/api/v3"
        
    def get_auth_url(self) -> str:
        """Generate Strava OAuth authorization URL"""
        if not self.client_id:
            raise ValueError("STRAVA_CLIENT_ID not configured")
            
        params = {
            'client_id': self.client_id,
            'redirect_uri': self.redirect_uri,
            'response_type': 'code',
            'scope': 'read,activity:read_all,profile:read_all'
        }
        
        auth_url = "https://www.strava.com/oauth/authorize"
        query_string = "&".join([f"{k}={v}" for k, v in params.items()])
        return f"{auth_url}?{query_string}"
    
    def exchange_code_for_token(self, code: str) -> Dict:
        """Exchange authorization code for access token"""
        if not self.client_secret:
            raise ValueError("STRAVA_CLIENT_SECRET not configured")
            
        url = "https://www.strava.com/oauth/token"
        data = {
            'client_id': self.client_id,
            'client_secret': self.client_secret,
            'code': code,
            'grant_type': 'authorization_code'
        }
        
        print(f"🔄 Making token exchange request to: {url}")
        print(f"🔄 Client ID: {self.client_id}")
        print(f"🔄 Client Secret: {'***' if self.client_secret else 'None'}")
        print(f"🔄 Code: {code[:10]}...")
        print(f"🔄 Redirect URI: {self.redirect_uri}")
        print(f"🔄 Full data being sent: {data}")
        
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
        url = "https://www.strava.com/oauth/token"
        data = {
            'client_id': self.client_id,
            'client_secret': self.client_secret,
            'refresh_token': refresh_token,
            'grant_type': 'refresh_token'
        }
        
        response = requests.post(url, data=data)
        if response.status_code != 200:
            raise Exception(f"Failed to refresh token: {response.text}")
            
        return response.json()
    
    def get_athlete(self, access_token: str) -> Dict:
        """Get athlete profile information"""
        headers = {'Authorization': f'Bearer {access_token}'}
        response = requests.get(f"{self.base_url}/athlete", headers=headers)
        
        if response.status_code != 200:
            raise Exception(f"Failed to get athlete: {response.text}")
            
        return response.json()
    
    def get_activities(self, access_token: str, page: int = 1, per_page: int = 30) -> List[Dict]:
        """Get athlete activities"""
        headers = {'Authorization': f'Bearer {access_token}'}
        params = {
            'page': page,
            'per_page': per_page
        }
        
        response = requests.get(f"{self.base_url}/athlete/activities", headers=headers, params=params)
        
        if response.status_code != 200:
            raise Exception(f"Failed to get activities: {response.text}")
            
        return response.json()
    
    def get_activity(self, access_token: str, activity_id: int) -> Dict:
        """Get specific activity details"""
        headers = {'Authorization': f'Bearer {access_token}'}
        response = requests.get(f"{self.base_url}/activities/{activity_id}", headers=headers)
        
        if response.status_code != 200:
            raise Exception(f"Failed to get activity: {response.text}")
            
        return response.json()
    
    def get_stats(self, access_token: str, athlete_id: int) -> Dict:
        """Get athlete statistics"""
        headers = {'Authorization': f'Bearer {access_token}'}
        response = requests.get(f"{self.base_url}/athletes/{athlete_id}/stats", headers=headers)
        
        if response.status_code != 200:
            raise Exception(f"Failed to get stats: {response.text}")
            
        return response.json()

class StravaDataSync:
    def __init__(self, db_path: str = "database/website.db"):
        self.db_path = db_path
        self.strava_api = StravaAPI()
    
    def save_tokens(self, user_id: int, tokens: Dict):
        """Save Strava tokens to database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Create strava_tokens table if it doesn't exist
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
        
        # Calculate expiration time
        expires_at = datetime.now() + timedelta(seconds=tokens['expires_in'])
        
        # Insert or update tokens
        cursor.execute("""
            INSERT OR REPLACE INTO strava_tokens 
            (user_id, access_token, refresh_token, expires_at)
            VALUES (?, ?, ?, ?)
        """, (user_id, tokens['access_token'], tokens['refresh_token'], expires_at))
        
        conn.commit()
        conn.close()
    
    def get_valid_tokens(self, user_id: int) -> Optional[Dict]:
        """Get valid access token for user, refresh if needed"""
        conn = None
        try:
            conn = sqlite3.connect(self.db_path, timeout=30.0, check_same_thread=False)
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT access_token, refresh_token, expires_at 
                FROM strava_tokens 
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
                    print(f"🔄 Refreshing expired token for user {user_id}")
                    new_tokens = self.strava_api.refresh_token(refresh_token)
                    
                    # Update tokens in the same connection
                    cursor.execute("""
                        UPDATE strava_tokens 
                        SET access_token = ?, refresh_token = ?, expires_at = ?
                        WHERE user_id = ?
                    """, (
                        new_tokens['access_token'], 
                        new_tokens['refresh_token'],
                        (datetime.now() + timedelta(seconds=new_tokens['expires_in'])).isoformat(),
                        user_id
                    ))
                    conn.commit()
                    
                    return {
                        'access_token': new_tokens['access_token'],
                        'refresh_token': new_tokens['refresh_token']
                    }
                except Exception as e:
                    print(f"❌ Failed to refresh token: {e}")
                    return None
            
            # Return current valid token
            return {
                'access_token': access_token,
                'refresh_token': refresh_token
            }
        except Exception as e:
            print(f"❌ Database error in get_valid_tokens: {e}")
            return None
        finally:
            if conn:
                conn.close()
    
    def sync_activities(self, user_id: int, limit: int = 50) -> Dict:
        """Sync Strava activities to local database"""
        tokens = self.get_valid_tokens(user_id)
        if not tokens:
            raise Exception("No valid Strava tokens found")
        
        # Get activities from Strava
        activities = self.strava_api.get_activities(tokens['access_token'], per_page=limit)
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        synced_count = 0
        for activity in activities:
            # Check if activity already exists
            cursor.execute("SELECT id FROM workouts WHERE strava_id = ?", (str(activity['id']),))
            if cursor.fetchone():
                continue  # Skip if already synced
            
            # Convert Strava activity to workout format
            workout_data = {
                'user_id': user_id,
                'strava_id': str(activity['id']),
                'type': activity['type'],
                'distance': activity.get('distance', 0) / 1000,  # Convert to km
                'duration': activity.get('moving_time', 0),
                'date': activity['start_date'][:10],  # YYYY-MM-DD
                'elevation': activity.get('total_elevation_gain', 0),
                'route_data': json.dumps({
                    'name': activity.get('name', ''),
                    'description': activity.get('description', ''),
                    'average_speed': activity.get('average_speed', 0),
                    'max_speed': activity.get('max_speed', 0),
                    'average_heartrate': activity.get('average_heartrate', 0),
                    'max_heartrate': activity.get('max_heartrate', 0),
                    'calories': activity.get('calories', 0)
                })
            }
            
            cursor.execute("""
                INSERT INTO workouts 
                (user_id, strava_id, type, distance, duration, date, elevation, route_data)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                workout_data['user_id'],
                workout_data['strava_id'],
                workout_data['type'],
                workout_data['distance'],
                workout_data['duration'],
                workout_data['date'],
                workout_data['elevation'],
                workout_data['route_data']
            ))
            
            synced_count += 1
        
        conn.commit()
        conn.close()
        
        return {
            'synced_count': synced_count,
            'total_activities': len(activities)
        }
    
    def get_activity_summary(self, user_id: int, days: int = 30) -> Dict:
        """Get activity summary for the last N days"""
        tokens = self.get_valid_tokens(user_id)
        if not tokens:
            raise Exception("No valid Strava tokens found")
        
        # Get recent activities
        activities = self.strava_api.get_activities(tokens['access_token'], per_page=200)
        
        # Filter activities from last N days
        cutoff_date = datetime.now() - timedelta(days=days)
        recent_activities = [
            activity for activity in activities
            if datetime.fromisoformat(activity['start_date'].replace('Z', '+00:00')) > cutoff_date
        ]
        
        # Calculate summary statistics
        total_distance = sum(activity.get('distance', 0) for activity in recent_activities) / 1000  # km
        total_time = sum(activity.get('moving_time', 0) for activity in recent_activities) / 3600  # hours
        total_elevation = sum(activity.get('total_elevation_gain', 0) for activity in recent_activities)
        
        # Group by activity type
        activity_types = {}
        for activity in recent_activities:
            activity_type = activity['type']
            if activity_type not in activity_types:
                activity_types[activity_type] = {
                    'count': 0,
                    'distance': 0,
                    'time': 0
                }
            
            activity_types[activity_type]['count'] += 1
            activity_types[activity_type]['distance'] += activity.get('distance', 0) / 1000
            activity_types[activity_type]['time'] += activity.get('moving_time', 0) / 3600
        
        return {
            'period_days': days,
            'total_activities': len(recent_activities),
            'total_distance_km': round(total_distance, 2),
            'total_time_hours': round(total_time, 2),
            'total_elevation_m': round(total_elevation, 0),
            'activity_types': activity_types
        } 