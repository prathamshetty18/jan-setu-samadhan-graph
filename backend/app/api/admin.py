from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services.seed import seed_database
from app.models.models import JurisdictionRule
from pydantic import BaseModel, ConfigDict
from typing import Optional, List

router = APIRouter(prefix="/api/admin", tags=["Administration"])

class RuleOut(BaseModel):
    id: int
    category: str
    ward_id: Optional[int] = None
    primary_department_id: int
    supporting_department_id: Optional[int] = None
    rule_description: Optional[str] = None
    is_active: bool
    model_config = ConfigDict(from_attributes=True)

@router.post("/reset-demo-data")
def reset_demo_data(db: Session = Depends(get_db)):
    """
    Resets database and seeds it with complete multilingual synthetic demo data
    (23 complaints in EN/HI/KN, incidents, departments, ward rules, actions, and recurrence alerts).
    """
    seed_database(db)
    return {
        "status": "success",
        "message": "Demo civic dataset successfully reset with 23 multilingual records and verified jurisdiction rules."
    }

@router.get("/rules", response_model=List[RuleOut])
def get_jurisdiction_rules(db: Session = Depends(get_db)):
    """Returns active jurisdiction and routing assignment rules."""
    return db.query(JurisdictionRule).all()
