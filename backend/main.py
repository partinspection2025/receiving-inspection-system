from fastapi import FastAPI, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
import os
from uuid import uuid4

from database import Base, engine, get_db
from models import User, Part, PartImage
from auth import authenticate_user
from models import ReceivingRecord
from fastapi import Body
import json


# ==============================
# App init
# ==============================
app = FastAPI()

Base.metadata.create_all(bind=engine)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# ==============================
# Health check
# ==============================
@app.get("/")
def root():
    return {"status": "Backend is running"}


@app.get("/phase5")
def phase5_ready():
    return {"message": "Phase 5 ready"}


# ==============================
# Register
# ==============================
@app.post("/register")
def register(
    username: str,
    password: str,
    name: str,
    section: str,
    role: str,
    db: Session = Depends(get_db)
):
    if db.query(User).filter(User.username == username).first():
        raise HTTPException(status_code=400, detail="Username already exists")

    user = User(
        username=username,
        password=password,
        name=name,
        section=section,
        role=role
    )
    db.add(user)
    db.commit()

    return {"message": "User registered successfully"}


# ==============================
# Login
# ==============================
@app.post("/login")
def login(
    username: str,
    password: str,
    db: Session = Depends(get_db)
):
    user = authenticate_user(username, password, db)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {
        "message": "Login successful",
        "name": user.name,
        "section": user.section,
        "role": user.role
    }


# ==============================
# Create Part (Excel base)
# ==============================
@app.post("/parts/create")
def create_part(
    part_name: str,
    part_number: str,
    supplier: str,
    drawing_number: str,
    document_code: str,
    db: Session = Depends(get_db)
):
    part = Part(
        part_name=part_name,
        part_number=part_number,
        supplier=supplier,
        drawing_number=drawing_number,
        document_code=document_code
    )
    db.add(part)
    db.commit()
    db.refresh(part)

    return {"message": "Part created successfully", "part_id": part.id}


# ==============================
# Upload Part Image
# ==============================
@app.post("/parts/{part_id}/images")
def upload_part_image(
    part_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    part = db.query(Part).filter(Part.id == part_id).first()
    if not part:
        raise HTTPException(status_code=404, detail="Part not found")

    filename = f"{uuid4()}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as f:
        f.write(file.file.read())

    image = PartImage(
        part_id=part_id,
        image_path=file_path
    )
    db.add(image)
    db.commit()

    return {"message": "Image uploaded successfully"}

@app.post("/receiving/save")
def save_receiving(data: dict = Body(...), db: Session = Depends(get_db)):

    record = ReceivingRecord(
        part_id=data.get("part_id"),
        inspection_day=data.get("inspection_day"),
        inspection_date=data.get("inspection_date"),
        measurements=json.dumps(data.get("measurements")),
        stamps=json.dumps(data.get("stamps"))
    )

    db.add(record)
    db.commit()

    # return updated history
    days = db.query(ReceivingRecord.inspection_day)\
             .filter(ReceivingRecord.part_id == data.get("part_id"))\
             .all()

    return {
        "message": "Receiving saved",
        "days": [d[0] for d in days]
    }
