import sqlite3
import os

def migrate_races_table():
    """Add race_type and distance columns to races table"""
    db_path = "database/website.db"
    
    if not os.path.exists(db_path):
        print("Database file not found!")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check if columns exist
        cursor.execute("PRAGMA table_info(races)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'race_type' not in columns:
            print(" Adding race_type column to races table...")
            cursor.execute("ALTER TABLE races ADD COLUMN race_type TEXT DEFAULT 'running'")
        
        if 'distance' not in columns:
            print(" Adding distance column to races table...")
            cursor.execute("ALTER TABLE races ADD COLUMN distance TEXT DEFAULT '5k'")
        
        conn.commit()
        print(" Race table migration completed successfully!")
        
    except Exception as e:
        print(f" Migration failed: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_races_table()
