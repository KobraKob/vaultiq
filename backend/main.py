import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="VAULTIQ API", version="1.0.0")

# Security and CORS
default_origins = [
    "http://localhost,http://localhost:5173"
    "https://balavanth-vaultiq-backend.hf.space/"
]
origins = os.getenv("CORS_ORIGINS", default_origins).split(",")
origins = [o.strip() for o in origins if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from routers.api import router as api_router

@app.get("/")
def read_root():
    return {"message": "Welcome to VAULTIQ Backend"}

app.include_router(api_router)
