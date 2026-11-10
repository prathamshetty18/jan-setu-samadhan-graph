from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import Ward
from app.schemas.schemas import WardOut
from app.services.geospatial.geo import get_demo_ward_features

router = APIRouter(prefix="/api/wards", tags=["Wards"])

@router.get("", response_model=List[WardOut])
def list_wards(db: Session = Depends(get_db)):
    """Returns municipal wards with center coordinates and administrative zones."""
    return db.query(Ward).order_by(Ward.ward_number.asc()).all()

@router.get("/geojson")
def get_ward_boundaries():
    """Returns GeoJSON FeatureCollection of demo ward boundary polygons for Leaflet."""
    return {
        "type": "FeatureCollection",
        "features": get_demo_ward_features()
    }

