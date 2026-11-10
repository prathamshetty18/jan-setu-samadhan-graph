from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.schemas import GraphDataOut
from app.services.graph.builder import build_civic_graph

router = APIRouter(prefix="/api/graph", tags=["Civic Responsibility Graph"])

@router.get("", response_model=GraphDataOut)
def get_full_graph(db: Session = Depends(get_db)):
    """
    Returns the complete Civic Responsibility Graph generated dynamically via NetworkX
    from actual database records (Complaints, Incidents, Wards, Departments, Actions, Evidence).
    """
    return build_civic_graph(db)

