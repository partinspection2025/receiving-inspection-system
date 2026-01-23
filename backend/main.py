from fastapi import FastAPI
from models import create_tables

app = FastAPI()

@app.on_event("startup")
def startup():
    create_tables()

@app.get("/")
def read_root():
    return {"status": "Backend is running"}
