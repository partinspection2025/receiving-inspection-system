from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User

def authenticate_user(username: str, password: str, db: Session):
    user = db.query(User).filter(User.username == username).first()
    if not user or user.password != password:
        return None
    return user
