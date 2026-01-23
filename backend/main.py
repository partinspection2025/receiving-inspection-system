from fastapi import FastAPI
from database import get_db
from models import create_tables
from auth import hash_password

app = FastAPI()

@app.on_event("startup")
def startup():
    create_tables()

@app.post("/register")
def register_user(
    username: str,
    password: str,
    real_name: str,
    section: str,
    role: str
):
    db = get_db()
    hashed_pw = hash_password(password)

    try:
        db.execute(
            "INSERT INTO users (username, password, real_name, section, role) VALUES (?, ?, ?, ?, ?)",
            (username, hashed_pw, real_name, section, role)
        )
        db.commit()
        return {"message": "User registered successfully"}
    except:
        return {"error": "Username already exists"}

@app.get("/")
def read_root():
    return {"status": "Backend is running"}
