# =========================================================
# MAIN APPLICATION FILE
# - Backend startup
# - Database connection
# - User register & login (GET + POST for now)
# =========================================================

from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session

from database import Base, engine, SessionLocal
import models
from auth import hash_password, verify_password, get_user_by_username

app = FastAPI()

# =========================================================
# CREATE DATABASE TABLES
# =========================================================
Base.metadata.create_all(bind=engine)

# =========================================================
# DATABASE SESSION HANDLER
# =========================================================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# =========================================================
# ROOT CHECK
# =========================================================
@app.get("/")
def root():
    return {"status": "Backend is running"}

# =========================================================
# USER REGISTER (ALLOW GET & POST)
# =========================================================
@app.api_route("/register", methods=["GET", "POST"])
def register_user(
    username: str,
    password: str,
    name: str,
    section: str,
    role: str,
    db: Session = Depends(get_db)
):
    existing_user = get_user_by_username(db, username)
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")

    new_user = models.User(
        username=username,
        password=hash_password(password),
        name=name,
        section=section,
        role=role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User registered successfully"}

# =========================================================
# USER LOGIN (ALLOW GET & POST)
# =========================================================
@app.api_route("/login", methods=["GET", "POST"])
def login_user(
    username: str,
    password: str,
    db: Session = Depends(get_db)
):
    user = get_user_by_username(db, username)

    if not user or not verify_password(password, user.password):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    return {
        "message": "Login successful",
        "name": user.name,
        "section": user.section,
        "role": user.role
    }
