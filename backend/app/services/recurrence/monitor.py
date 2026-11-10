from typing import List, Dict, Any, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.models import Complaint, Incident, RecordedAction, Department

def check_for_recurrence(
    db: Session,
    new_complaint: Complaint,
    threshold_similarity: float = 0.70
) -> Optional[Dict[str, Any]]:
    """
    Checks if this newly submitted complaint resembles an earlier incident
    where an action was already taken/recorded.
    If so, returns the recurrence alert payload.
    """
    # 1. Check if connected to an incident that has prior recorded actions
    if new_complaint.incident_id:
        incident = db.query(Incident).filter(Incident.id == new_complaint.incident_id).first()
        if incident:
            # Check for actions on this incident
            action = db.query(RecordedAction).filter(
                RecordedAction.incident_id == incident.id,
                RecordedAction.action_date < new_complaint.created_at
            ).order_by(RecordedAction.action_date.desc()).first()

            if action:
                dept_name = action.department.name if action.department else "Assigned Department"
                return {
                    "incident_id": incident.id,
                    "incident_code": incident.incident_code,
                    "incident_title": incident.title,
                    "previous_action": action.action_description,
                    "previous_action_date": action.action_date,
                    "previous_officer": action.officer_name,
                    "department_name": dept_name,
                    "alert_message": (
                        "Potential Recurrence Detected: A similar complaint has been submitted "
                        f"after a previous action was recorded on {action.action_date.strftime('%d %b %Y')}. "
                        "Please review the earlier action and investigate."
                    )
                }

    # 2. Check for matching category and locality with prior actions
    earlier_action = (
        db.query(RecordedAction)
        .join(Complaint, RecordedAction.complaint_id == Complaint.id)
        .filter(
            Complaint.category == new_complaint.category,
            Complaint.locality.ilike(f"%{new_complaint.locality}%"),
            RecordedAction.action_date < new_complaint.created_at
        )
        .order_by(RecordedAction.action_date.desc())
        .first()
    )

    if earlier_action:
        earlier_complaint = earlier_action.complaint
        dept_name = earlier_action.department.name if earlier_action.department else "Assigned Department"
        inc_code = earlier_complaint.incident.incident_code if earlier_complaint and earlier_complaint.incident else f"LOC-{new_complaint.locality.upper()[:6]}"
        inc_title = earlier_complaint.incident.title if earlier_complaint and earlier_complaint.incident else f"Recurring {new_complaint.category} in {new_complaint.locality}"

        return {
            "incident_id": earlier_complaint.incident_id if earlier_complaint else None,
            "incident_code": inc_code,
            "incident_title": inc_title,
            "previous_action": earlier_action.action_description,
            "previous_action_date": earlier_action.action_date,
            "previous_officer": earlier_action.officer_name,
            "department_name": dept_name,
            "alert_message": (
                "Potential Recurrence Detected: A similar complaint has been submitted "
                f"after a previous action ('{earlier_action.action_type}') was recorded by {earlier_action.officer_name}. "
                "Please review the earlier action and investigate."
            )
        }

    return None

def get_all_recurrence_alerts(db: Session) -> List[Dict[str, Any]]:
    """
    Returns list of all active recurrence alerts across incidents and complaints.
    """
    alerts = []
    # Find all complaints submitted AFTER an action was recorded on the same incident or locality/category
    recent_complaints = db.query(Complaint).order_by(Complaint.created_at.desc()).all()

    seen_incident_ids = set()

    for c in recent_complaints:
        rec = check_for_recurrence(db, c)
        if rec and (rec["incident_code"] not in seen_incident_ids):
            seen_incident_ids.add(rec["incident_code"])
            ward_name = c.ward.name if c.ward else "Municipal Ward"
            alerts.append({
                "id": c.id,
                "incident_id": rec.get("incident_id"),
                "incident_code": rec["incident_code"],
                "incident_title": rec["incident_title"],
                "category": c.category,
                "locality": c.locality,
                "ward_name": ward_name,
                "latest_complaint_code": c.complaint_code,
                "latest_complaint_title": c.title,
                "latest_complaint_date": c.created_at,
                "previous_action_description": rec["previous_action"],
                "previous_action_date": rec["previous_action_date"],
                "previous_officer": rec["previous_officer"],
                "department_name": rec["department_name"],
                "related_complaints_count": 3,
                "alert_message": rec["alert_message"]
            })

    return alerts

