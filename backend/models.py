from sqlalchemy import Column, Integer, String, ForeignKey
from database import Base

# ==============================
# Users
# ==============================
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    name = Column(String)
    section = Column(String)
    role = Column(String)


# ==============================
# Parts (Excel base file)
# ==============================
class Part(Base):
    __tablename__ = "parts"

    id = Column(Integer, primary_key=True, index=True)
    part_name = Column(String)
    part_number = Column(String)
    supplier = Column(String)
    drawing_number = Column(String)
    document_code = Column(String)


# ==============================
# Part Images
# ==============================
class PartImage(Base):
    __tablename__ = "part_images"

    id = Column(Integer, primary_key=True, index=True)
    part_id = Column(Integer, ForeignKey("parts.id"))
    image_path = Column(String)

class ReceivingRecord(Base):
    __tablename__ = "receiving_records"

    id = Column(Integer, primary_key=True, index=True)
    part_id = Column(Integer)
    inspection_day = Column(Integer)
    inspection_date = Column(String)
    measurements = Column(String)  # JSON string
    stamps = Column(String)        # JSON string
