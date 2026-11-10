# Supabase PostgreSQL Deployment & Configuration Guide
### JAN SETU — SAMADHAN-GRAPH

This guide provides step-by-step instructions for deploying the **Jan Setu – Samadhan-Graph** backend to a production **Supabase PostgreSQL** instance with **PostGIS** spatial capabilities.

---

## 1. Architecture & Driver Compatibility

| Component | Specification |
|---|---|
| **Database Engine** | PostgreSQL 15+ / 16 (Managed via Supabase) |
| **Spatial Engine** | PostGIS extension (enabled in Supabase) |
| **Python Driver** | `psycopg[binary]>=3.1.18` (Psycopg 3) |
| **ORM & Layer** | SQLAlchemy 2.0+ with declarative base mapping |
| **Local Fallback** | SQLite (`samadhan_graph.db`) when `DATABASE_URL` is unset |
| **Connection Pooling** | Pre-ping enabled, connection recycling at 1800s for PgBouncer/Supavisor |

---

## 2. Supabase Project Setup

### Step 1: Create Supabase Project
1. Log in to [Supabase Console](https://supabase.com/dashboard).
2. Create a new project and select your preferred AWS/GCP region.
3. Save your database password securely (never commit passwords to git).

### Step 2: Enable PostGIS Extension
1. In the Supabase Dashboard, navigate to the **SQL Editor**.
2. Run the following command to enable PostGIS spatial capabilities:
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```
3. *Note: Jan Setu's `init_db()` also executes this automatically on startup when connected to PostgreSQL if user permissions permit.*

---

## 3. Database Connection URI Format

Supabase provides two connection types in **Project Settings -> Database**:

### Option A: Direct Connection (Recommended for Web Servers)
```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require
```

### Option B: Connection Pooler (Supavisor / PgBouncer)
Use this if running inside serverless environments (AWS Lambda, Vercel Functions):
```
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require
```

> [!IMPORTANT]
> The backend automatically handles `postgres://` prefixes from hosting dashboards and normalizes them to `postgresql://` for SQLAlchemy 2.0. It also enforces `sslmode=require` for all Supabase hostnames.

---

## 4. Production Environment Variables

Configure these environment variables in your hosting provider (Render, Railway, Fly.io, AWS, or Docker):

```ini
# Database Connection (Supabase)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require

# Connection Pool Settings (Optimized for Supabase Supavisor)
DB_POOL_SIZE=10
DB_MAX_OVERFLOW=20
DB_POOL_RECYCLE=1800
DB_REQUIRE_SSL=true

# Data Protection in Production
# Set to 'false' to guarantee synthetic demo data is NEVER automatically seeded into production
AUTO_SEED_DEMO_DATA=false

# Backend API Configuration
PORT=8000
HOST=0.0.0.0
CORS_ORIGINS=https://your-frontend-domain.com

# Multilingual AI Engine
EMBEDDING_MODEL=paraphrase-multilingual-MiniLM-L12-v2
COSINE_SIMILARITY_THRESHOLD=0.75
ENABLE_HEAVY_TRANSFORMER=false
```

---

## 5. Safe Schema Migration & Zero-Data-Loss Startup

1. **Idempotent Table Creation**:
   - On application launch, `init_db()` executes `Base.metadata.create_all(bind=engine)`.
   - Existing tables, indexes, and citizen complaints are **never dropped or modified**.

2. **Data Preservation Guarantee**:
   - The startup lifecycle checks `count = db.query(Complaint).count()`.
   - If records exist, startup prints:
     `"Database contains N existing records. Preserving data without overwriting."`
   - Real citizen grievances are protected against accidental deletion on container restarts.

3. **Seeding Synthetic Data (Optional)**:
   - To seed initial reference departments and wards without overwriting:
     ```bash
     python scripts/seed_demo_data.py --preserve
     ```
   - In staging/demo environments where an intentional full wipe is desired:
     ```bash
     python scripts/seed_demo_data.py
     ```

---

## 6. Pre-Flight Verification Checklist

Before pointing production traffic to Supabase:

- [ ] PostGIS extension active in Supabase SQL editor (`SELECT postgis_version();`).
- [ ] `DATABASE_URL` uses `sslmode=require`.
- [ ] `AUTO_SEED_DEMO_DATA=false` configured in production environment.
- [ ] Backend health probe returns `{"status": "healthy"}` at `/api/health`.
- [ ] Test complaint registration in English, Kannada, and Hindi via `/api/complaints`.
- [ ] Confirm no database credentials or secrets are present in Git repository.

