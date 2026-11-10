import sys
import os

# Ensure backend directory is in sys.path regardless of execution directory
SCRIPTS_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.abspath(os.path.join(SCRIPTS_DIR, "..", "backend"))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.database.session import SessionLocal, init_db, DEFAULT_DB_FILE, DATABASE_URL
from app.services.seed import seed_database
from app.models.models import Complaint

def run_seed():
    preserve_existing = "--preserve" in sys.argv
    print(f"Target Database URL: {DATABASE_URL}")
    print("Initializing database schema / PostGIS extensions...")
    init_db()
    db = SessionLocal()
    try:
        if preserve_existing:
            count = db.query(Complaint).count()
            if count > 0:
                print(f"✓ Preserving existing database: {count} complaints found. No changes made.")
                return
            print("Database empty. Seeding initial Jan Setu demo reference data...")
            seed_database(db, clear_existing=False)
        else:
            print("Seeding Jan Setu — Samadhan-Graph demo dataset...")
            seed_database(db, clear_existing=True)
            print("✓ Database successfully seeded with 23 multilingual complaints, departments, wards, and recurrence signals.")
    except Exception as e:
        print(f"✗ Seeding failed with error: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    run_seed()
