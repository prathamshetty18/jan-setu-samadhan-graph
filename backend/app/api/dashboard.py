from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database.session import get_db
from app.models.models import Complaint, Incident, Ward
from app.schemas.schemas import DashboardSummaryOut, CategoryAnalyticsItem, WardAnalyticsItem
from app.services.recurrence.monitor import get_all_recurrence_alerts

router = APIRouter(prefix="/api", tags=["Dashboard & Analytics"])

@router.get("/dashboard/summary", response_model=DashboardSummaryOut)
def get_dashboard_summary(db: Session = Depends(get_db)):
    """Computes real-time KPI metrics calculated strictly from live database records."""
    total = db.query(Complaint).count()
    pending = db.query(Complaint).filter(Complaint.status.in_(["Submitted", "Assigned", "Under Review", "Action Taken"])).count()
    under_review = db.query(Complaint).filter(Complaint.status == "Under Review").count()
    resolved = db.query(Complaint).filter(Complaint.status == "Resolved").count()
    
    related_groups = db.query(Incident).count()
    recurrence_alerts_list = get_all_recurrence_alerts(db)

    return DashboardSummaryOut(
        total_complaints=total,
        pending_complaints=pending,
        under_review=under_review,
        resolved_complaints=resolved,
        related_complaint_groups=related_groups,
        recurrence_alerts=len(recurrence_alerts_list)
    )

@router.get("/analytics/categories", response_model=List[CategoryAnalyticsItem])
def get_category_analytics(db: Session = Depends(get_db)):
    """Returns complaint breakdown by category, with counts and resolution rates."""
    total = db.query(Complaint).count() or 1
    
    cat_counts = db.query(
        Complaint.category,
        func.count(Complaint.id).label("count")
    ).group_by(Complaint.category).all()

    resolved_counts = dict(
        db.query(
            Complaint.category,
            func.count(Complaint.id)
        ).filter(Complaint.status == "Resolved")
        .group_by(Complaint.category)
        .all()
    )

    results = []
    for cat, count in cat_counts:
        res_cnt = resolved_counts.get(cat, 0)
        results.append(CategoryAnalyticsItem(
            category=cat,
            count=count,
            resolved_count=res_cnt,
            percentage=round((count / total) * 100, 1)
        ))

    # Sort descending
    results.sort(key=lambda x: x.count, reverse=True)
    return results

@router.get("/analytics/wards", response_model=List[WardAnalyticsItem])
def get_ward_analytics(db: Session = Depends(get_db)):
    """Returns ward-level grievance density and prominent category."""
    wards = db.query(Ward).all()
    results = []

    for w in wards:
        count = db.query(Complaint).filter(Complaint.ward_id == w.id).count()
        # Top category in this ward
        top_cat_row = db.query(
            Complaint.category,
            func.count(Complaint.id).label("cnt")
        ).filter(Complaint.ward_id == w.id).group_by(Complaint.category).order_by(func.count(Complaint.id).desc()).first()

        top_cat = top_cat_row[0] if top_cat_row else "None"
        results.append(WardAnalyticsItem(
            ward_number=w.ward_number,
            ward_name=w.name,
            count=count,
            top_category=top_cat
        ))

    results.sort(key=lambda x: x.count, reverse=True)
    return results

