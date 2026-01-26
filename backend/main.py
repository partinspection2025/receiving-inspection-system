# =========================================================
# MAIN APPLICATION FILE
# This file:
# - Starts FastAPI
# - Connects to database
# - Creates tables
# - Handles user register
# - Handles user login
# =========================================================

from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session

# --- DATABASE IMPORTS ---
from database import Base, engine, SessionLocal

# --- MODEL IMPORT ---
import models

# --- AUTH / SECURITY IMPORTS ---
from auth import hash_password, verify_password, get_user_by_username


# =========================================================
# CREATE FASTAPI APP
# =========================================================
app = FastAPI()


# =========================================================
# CREATE DATABASE TABLES (AUTO)
# =========================================================
Base.metadata.create_all(bind=engine)


# =========================================================
# DATABASE SESSION HANDLER
# This opens and closes DB safely for every request
# =========================================================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# =========================================================
# ROOT CHECK (HEALTH CHECK)
# =========================================================
@app.get("/")
def root():
    return {"status": "Backend is running"}


# =========================================================
# USER REGISTRATION API
# - Username must be unique
# - Password is hashed
# - Name, Section, Role saved for digital stamp later
# =========================================================
@app.post("/register")
def register_user(
    username: str,
    password: str,
    name: str,
    section: str,
    role: str,
    db: Session = Depends(get_db)
):
    # Check if username already exists
    existing_user = get_user_by_username(db, username)
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")

    # Create new user
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
# USER LOGIN API
# - Verifies password
# - Returns user info for stamp usage later
# =========================================================
@app.post("/login")
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
