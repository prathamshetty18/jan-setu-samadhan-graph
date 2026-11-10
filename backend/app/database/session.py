import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker

# Resolve absolute path to database file so working directory differences never cause split databases
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.abspath(os.path.join(CURRENT_DIR, "..", ".."))
DEFAULT_DB_FILE = os.path.join(BACKEND_DIR, "samadhan_graph.db").replace("\\", "/")

# Load database URL from environment variable, falling back to local SQLite
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DEFAULT_DB_FILE}").strip()

# Normalize PostgreSQL connection schemes to use modern Psycopg 3 (psycopg[binary]) consistently
# Handles postgres://, postgresql://, and postgresql+psycopg2:// from Render, Supabase, Heroku, Docker
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = "postgresql+psycopg://" + DATABASE_URL[len("postgres://"):]
elif DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = "postgresql+psycopg://" + DATABASE_URL[len("postgresql://"):]
elif DATABASE_URL.startswith("postgresql+psycopg2://"):
    DATABASE_URL = "postgresql+psycopg://" + DATABASE_URL[len("postgresql+psycopg2://"):]

# Configure engine arguments based on dialect
engine_kwargs = {
    "pool_pre_ping": True,
}

if DATABASE_URL.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    # PostgreSQL / Supabase connection pooling configuration:
    # Supabase uses Supavisor / PgBouncer. Connection recycling prevents stale socket drops.
    engine_kwargs["pool_size"] = int(os.getenv("DB_POOL_SIZE", "10"))
    engine_kwargs["max_overflow"] = int(os.getenv("DB_MAX_OVERFLOW", "20"))
    engine_kwargs["pool_recycle"] = int(os.getenv("DB_POOL_RECYCLE", "1800"))

    # Auto-ensure SSL for remote connections (required by Supabase)
    if "supabase" in DATABASE_URL or os.getenv("DB_REQUIRE_SSL", "false").lower() == "true":
        if "sslmode=" not in DATABASE_URL:
            separator = "&" if "?" in DATABASE_URL else "?"
            DATABASE_URL = f"{DATABASE_URL}{separator}sslmode=require"

engine = create_engine(
    DATABASE_URL,
    **engine_kwargs
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """
    Safely creates tables and enables PostGIS extension if running on PostgreSQL/Supabase.
    Idempotent and safe for production environments.
    """
    from app.models.models import Base
    if not DATABASE_URL.startswith("sqlite"):
        try:
            with engine.connect() as conn:
                conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
                conn.commit()
        except Exception:
            # Non-fatal if permission is restricted or already enabled
            pass

    Base.metadata.create_all(bind=engine)
