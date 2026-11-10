import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.session import init_db, SessionLocal
from app.models.models import Complaint
from app.services.seed import seed_database

# Routers
from app.api.complaints import router as complaints_router
from app.api.dashboard import router as dashboard_router
from app.api.graph import router as graph_router
from app.api.recurrence import router as recurrence_router
from app.api.departments import router as departments_router
from app.api.wards import router as wards_router
from app.api.admin import router as admin_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables exist and demo data is loaded
    init_db()
    db = SessionLocal()
    try:
        count = db.query(Complaint).count()
        if count == 0:
            print("Database empty. Seeding initial Jan Setu demo data...")
            seed_database(db)
            print("Seeding complete.")
    except Exception as e:
        print("Startup warning:", e)
    finally:
        db.close()
    yield
    # Shutdown

app = FastAPI(
    title="JAN SETU — Samadhan-Graph API",
    description="Civic Intelligence Platform: Multilingual Grievance Fusion, Civic Responsibility Graph & Recurrence Monitoring",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Enable CORS for local frontend development and containers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(complaints_router)
app.include_router(dashboard_router)
app.include_router(graph_router)
app.include_router(recurrence_router)
app.include_router(departments_router)
app.include_router(wards_router)
app.include_router(admin_router)

@app.get("/")
def root():
    return {
        "platform": "JAN SETU — Samadhan-Graph",
        "tagline": "From Citizen Complaints to Civic Intelligence",
        "version": "1.0.0",
        "status": "operational",
        "docs": "/docs"
    }

@app.get("/api/health")
def health():
    return {"status": "healthy", "service": "jan-setu-backend"}
