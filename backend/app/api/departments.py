from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import Department
from app.schemas.schemas import DepartmentOut

router = APIRouter(prefix="/api/departments", tags=["Departments"])

@router.get("", response_model=List[DepartmentOut])
def list_departments(db: Session = Depends(get_db)):
    """Returns municipal department catalog with jurisdiction codes and SLAs."""
    return db.query(Department).order_by(Department.name.asc()).all()

