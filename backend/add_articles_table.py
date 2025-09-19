# Add articles table to database
import sqlite3

def add_articles_table():
    conn = sqlite3.connect('database/website.db')
    cursor = conn.cursor()
    
    # Add articles table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS articles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            url TEXT NOT NULL,
            description TEXT,
            category TEXT DEFAULT 'technology',
            tags TEXT DEFAULT '[]',
            read_time TEXT,
            source TEXT,
            date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            is_read BOOLEAN DEFAULT FALSE,
            is_favorite BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()
    print(" Articles table added successfully!")

if __name__ == "__main__":
    add_articles_table()
