from database import get_db

def create_tables():
    db = get_db()
    db.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT,
            real_name TEXT,
            section TEXT,
            role TEXT
        )
    """)
    db.commit()
