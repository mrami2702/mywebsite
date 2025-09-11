#!/usr/bin/env python3
"""
Database Fix Script
This script helps fix database locking issues by clearing connections and testing the database.
"""

import sqlite3
import os
import time

def fix_database():
    """Fix database locking issues"""
    db_path = "database/website.db"
    
    print("🔧 Database Fix Script")
    print("=" * 50)
    
    # Check if database exists
    if not os.path.exists(db_path):
        print(f"❌ Database not found at {db_path}")
        return
    
    print(f"📁 Database found at: {db_path}")
    
    # Try to connect with different timeout values
    timeouts = [5, 10, 20, 30]
    
    for timeout in timeouts:
        print(f"\n🔄 Trying connection with timeout {timeout}s...")
        try:
            conn = sqlite3.connect(db_path, timeout=timeout, check_same_thread=False)
            cursor = conn.cursor()
            
            # Test basic query
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            
            if result:
                print(f"✅ Connection successful with timeout {timeout}s!")
                
                # Test a few more queries
                try:
                    cursor.execute("SELECT COUNT(*) FROM users")
                    user_count = cursor.fetchone()[0]
                    print(f"📊 Users table: {user_count} records")
                except:
                    print("⚠️  Users table not accessible")
                
                try:
                    cursor.execute("SELECT COUNT(*) FROM strava_tokens")
                    token_count = cursor.fetchone()[0]
                    print(f"🏃‍♀️ Strava tokens: {token_count} records")
                except:
                    print("⚠️  Strava tokens table not accessible")
                
                try:
                    cursor.execute("SELECT COUNT(*) FROM spotify_tokens")
                    spotify_count = cursor.fetchone()[0]
                    print(f"🎵 Spotify tokens: {spotify_count} records")
                except:
                    print("⚠️  Spotify tokens table not accessible")
                
                conn.close()
                print("\n🎉 Database is working properly!")
                return True
                
        except sqlite3.OperationalError as e:
            if "database is locked" in str(e):
                print(f"❌ Database locked with timeout {timeout}s")
            else:
                print(f"❌ Database error: {e}")
        except Exception as e:
            print(f"❌ Unexpected error: {e}")
        finally:
            try:
                if 'conn' in locals():
                    conn.close()
            except:
                pass
    
    print("\n❌ Could not establish database connection with any timeout value")
    print("\n🔧 Troubleshooting steps:")
    print("1. Make sure no other processes are using the database")
    print("2. Restart your FastAPI server")
    print("3. Try the /api/db/reset endpoint")
    print("4. Check if the database file has proper permissions")
    
    return False

if __name__ == "__main__":
    fix_database() 