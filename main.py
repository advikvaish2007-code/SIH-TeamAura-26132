import os
import sys

# Ensure agri-connect backend directory is on sys.path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(BASE_DIR, "agri-connect", "backend")

if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app import app  # import FastAPI app instance from backend/app.py

if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    print(f"Starting Agri-Connect Server on {host}:{port}...")
    uvicorn.run("app:app", host=host, port=port, reload=False)
