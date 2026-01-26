from fastapi import FastAPI

from database import Base, engine
import models

app = FastAPI()

# Create tables
Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"status": "Backend is running"}
