from sqlalchemy import Column, Integer, String
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)

    name = Column(String)
    section = Column(String)
    role = Column(String)  # PIC / Checker / Approver

# ==============================
# Part model (Excel base file)
# ==============================
class Part(Base):
    __tablename__ = "parts"

    id = Column(Integer, primary_key=True, index=True)
    part_name = Column(String, nullable=False)
    part_number = Column(String, nullable=False)
    supplier = Column(String, nullable=False)
    drawing_number = Column(String, nullable=False)
    document_code = Column(String, nullable=False)

