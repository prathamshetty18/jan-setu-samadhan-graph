from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.schemas import RecurrenceAlertOut
from app.services.recurrence.monitor import get_all_recurrence_alerts

router = APIRouter(prefix="/api/recurrence", tags=["Recurrence Monitoring"])

@router.get("", response_model=List[RecurrenceAlertOut])
def list_recurrence_alerts(db: Session = Depends(get_db)):
    """
    Returns detected recurrence alerts where citizen complaints arrived
    after a previous official action was recorded on a linked incident/locality.
    """
    return get_all_recurrence_alerts(db)

