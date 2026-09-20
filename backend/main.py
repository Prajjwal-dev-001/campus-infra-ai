import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from config import settings
from database import create_tables, SessionLocal, engine
from models.user import User
from routers.auth import hash_password, router as auth_router
from routers.tickets import router as tickets_router
from routers.ai_diagnosis import router as ai_diagnosis_router
from routers.analytics import router as analytics_router
from routers.navigation import router as navigation_router
from services.vector_store import get_vector_store

def seed_mock_users():
    db: Session = SessionLocal()
    try:
        mock_users = [
            {
                "user_id": "12300001",
                "password": "student123",
                "role": "student",
                "name": "Rahul Kumar",
                "block_assigned": "BH-5",
                "room_number": "A-824",
                "contact": "9876543210"
            },
            {
                "user_id": "FAC001",
                "password": "warden123",
                "role": "warden",
                "name": "Dr. Priya Sharma",
                "block_assigned": "BH-5",
                "room_number": None,
                "contact": "9812345678"
            },
            {
                "user_id": "FAC002",
                "password": "warden123",
                "role": "warden",
                "name": "Prof. Anil Gupta",
                "block_assigned": "Block-32",
                "room_number": None,
                "contact": "9812345679"
            },
            {
                "user_id": "FAC003",
                "password": "warden123",
                "role": "warden",
                "name": "Warden Sunita Verma",
                "block_assigned": "GH-2",
                "room_number": None,
                "contact": "9812345680"
            },
            {
                "user_id": "MAINT001",
                "password": "maint123",
                "role": "maintenance",
                "name": "Suresh Singh",
                "block_assigned": None,
                "room_number": None,
                "contact": "9823456789"
            }
        ]

        for u in mock_users:
            existing = db.query(User).filter(User.user_id == u["user_id"]).first()
            if not existing:
                new_user = User(
                    user_id=u["user_id"],
                    name=u["name"],
                    hashed_password=hash_password(u["password"]),
                    role=u["role"],
                    block_assigned=u["block_assigned"],
                    room_number=u["room_number"],
                    contact=u["contact"],
                    is_active=True
                )
                db.add(new_user)
                print(f"Seeded mock user: {u['user_id']} ({u['name']} - {u['role']})")
        db.commit()
    except Exception as e:
        print(f"Error seeding mock users: {e}")
        db.rollback()
    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting LPU RMS AI Backend Services...")
    # 1. Create SQLite tables
    create_tables()
    print("Database tables initialized.")

    # 2. Seed mock users
    seed_mock_users()

    # 3. Initialize ChromaDB Vector Store & load 250 records
    print("Initializing ChromaDB Vector Store...")
    try:
        vs = get_vector_store()
        print(f"ChromaDB ready with {vs.collection.count()} maintenance records.")
    except Exception as e:
        print(f"ChromaDB initialization warning: {e}")

    yield
    print("Shutting down LPU RMS Backend...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers
app.include_router(auth_router, prefix="/api")
app.include_router(tickets_router, prefix="/api")
app.include_router(ai_diagnosis_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")
app.include_router(navigation_router)

@app.get("/api/health")
@app.get("/health")
def health_check():
    db_ok = True
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except Exception:
        db_ok = False

    chroma_count = 0
    try:
        vs = get_vector_store()
        chroma_count = vs.collection.count()
    except Exception:
        pass

    return {
        "status": "ok",
        "chroma_records": chroma_count,
        "db_connected": db_ok
    }
