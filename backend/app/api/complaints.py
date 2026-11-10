import json
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database.session import get_db
from app.models.models import (
    Complaint, Incident, Department, Ward, RecordedAction, ResolutionEvidence, AuditLog
)
from app.schemas.schemas import (
    ComplaintCreate, ComplaintDetailOut, ComplaintListItem, ComplaintAssign,
    ComplaintActionCreate, ComplaintResolve, ComplaintStatusUpdate,
    RelatedComplaintItem, RecordedActionOut, ResolutionEvidenceOut, AuditLogOut
)
from app.services.nlp.processor import nlp_engine
from app.services.routing.router import determine_department_recommendation
from app.services.graph.builder import build_civic_graph
from app.services.recurrence.monitor import get_all_recurrence_alerts

router = APIRouter(prefix="/api/complaints", tags=["Complaints"])

def utc_now():
    return datetime.now(timezone.utc)

def generate_complaint_code(db: Session) -> str:
    """Generates sequential civic grievance ID, e.g. JS-2026-0001"""
    year = utc_now().year
    prefix = f"JS-{year}-"
    latest = (
        db.query(Complaint)
        .filter(Complaint.complaint_code.like(f"{prefix}%"))
        .order_by(Complaint.id.desc())
        .first()
    )
    if latest and latest.complaint_code:
        try:
            num = int(latest.complaint_code.split("-")[-1])
            return f"{prefix}{num + 1:04d}"
        except Exception:
            pass
    count = db.query(Complaint).count() + 1
    return f"{prefix}{count:04d}"

def generate_incident_code(db: Session, category: str) -> str:
    """Generates incident tracking code, e.g. INC-2026-0001"""
    year = utc_now().year
    prefix = f"INC-{year}-"
    latest = (
        db.query(Incident)
        .filter(Incident.incident_code.like(f"{prefix}%"))
        .order_by(Incident.id.desc())
        .first()
    )
    if latest and latest.incident_code:
        try:
            num = int(latest.incident_code.split("-")[-1])
            return f"{prefix}{num + 1:04d}"
        except Exception:
            pass
    count = db.query(Incident).count() + 1
    return f"{prefix}{count:04d}"

@router.post("", response_model=ComplaintDetailOut)
def create_complaint(payload: ComplaintCreate, db: Session = Depends(get_db)):
    """
    Submits a citizen complaint.
    Executes multilingual NLP pipeline:
    Language detection -> text normalisation -> issue extraction -> multilingual embedding
    -> semantic related search -> smart department routing -> incident connection.
    """
    # 1. Dynamic ID
    complaint_code = generate_complaint_code(db)

    # 2. Multilingual NLP Pipeline
    detected_lang = nlp_engine.detect_language(payload.description)
    lang = payload.original_language or detected_lang
    normalized_desc = nlp_engine.normalize_text(payload.description)
    extracted_issue, category = nlp_engine.extract_issue_and_category(normalized_desc, payload.category)

    # Generate multilingual embedding
    embedding = nlp_engine.generate_embedding(normalized_desc)
    embedding_json = json.dumps(embedding)

    # 3. Transparent Department Routing
    rec_dept_id, supp_dept_id, routing_reason, ward_mapping = determine_department_recommendation(
        db=db,
        category=category,
        ward_id=payload.ward_id,
        locality=payload.locality
    )

    # 4. Check for related complaints to link to possible incident
    candidates = db.query(Complaint).all()
    related_matches = nlp_engine.find_related_complaints(
        target_text=normalized_desc,
        target_category=category,
        candidate_complaints=candidates,
        threshold=0.75
    )

    linked_incident_id = None
    if related_matches and len(related_matches) > 0:
        top_match = related_matches[0]
        # If top candidate is connected to an incident, connect to it
        top_comp = db.query(Complaint).filter(Complaint.id == top_match["id"]).first()
        if top_comp and top_comp.incident_id:
            linked_incident_id = top_comp.incident_id
            # Update incident last_reported_at
            inc = db.query(Incident).filter(Incident.id == linked_incident_id).first()
            if inc:
                inc.last_reported_at = utc_now()

    # If confident match exists (>= 0.75) but has no incident yet, create aggregated incident
    if not linked_incident_id and related_matches and related_matches[0]["similarity_score"] >= 0.75:
        top_comp = db.query(Complaint).filter(Complaint.id == related_matches[0]["id"]).first()
        new_inc = Incident(
            incident_code=generate_incident_code(db, category),
            title=f"Aggregated {category} Issue in {payload.locality}",
            category=category,
            locality=payload.locality,
            ward_id=payload.ward_id,
            status="Under Investigation",
            first_reported_at=top_comp.created_at if top_comp else utc_now(),
            last_reported_at=utc_now()
        )
        db.add(new_inc)
        db.flush()
        linked_incident_id = new_inc.id
        if top_comp and not top_comp.incident_id:
            top_comp.incident_id = new_inc.id

    # 5. Create Complaint record
    complaint = Complaint(
        complaint_code=complaint_code,
        title=payload.title,
        description=normalized_desc,
        original_language=lang,
        category=category,
        locality=payload.locality,
        ward_id=payload.ward_id,
        latitude=payload.latitude,
        longitude=payload.longitude,
        status="Submitted",
        citizen_name=payload.citizen_name or "Citizen",
        citizen_phone=payload.citizen_phone,
        audio_url=payload.audio_url,
        audio_transcript=payload.audio_transcript,
        image_url=payload.image_url,
        recommended_department_id=rec_dept_id,
        routing_reason=routing_reason,
        incident_id=linked_incident_id,
        embedding_json=embedding_json,
        ai_processing_mode=nlp_engine.processing_mode,
        is_demo_data=False
    )
    db.add(complaint)
    db.flush()

    # Get recommended department name for human-readable audit
    rec_dept = db.query(Department).filter(Department.id == rec_dept_id).first() if rec_dept_id else None
    rec_name = rec_dept.name if rec_dept else "Municipal Authority"

    # 6. Audit Log
    audit = AuditLog(
        complaint_id=complaint.id,
        action_type="Submitted",
        previous_value=None,
        new_value="Submitted",
        performed_by="Citizen Portal",
        notes=f"Complaint registered via citizen interface in {lang.upper()}. Department routed to {rec_name}."
    )
    db.add(audit)
    db.commit()
    db.refresh(complaint)

    return get_complaint_detail(complaint.id, db)

@router.get("", response_model=List[ComplaintListItem])
def list_complaints(
    language: Optional[str] = None,
    category: Optional[str] = None,
    department_id: Optional[int] = None,
    ward_id: Optional[int] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Lists complaints with comprehensive civic filtering, search, and dynamic recurrence alerts."""
    query = db.query(Complaint)

    if language:
        query = query.filter(Complaint.original_language == language.lower())
    if category:
        query = query.filter(Complaint.category == category)
    if department_id:
        query = query.filter(
            or_(
                Complaint.assigned_department_id == department_id,
                Complaint.recommended_department_id == department_id
            )
        )
    if ward_id:
        query = query.filter(Complaint.ward_id == ward_id)
    if status:
        query = query.filter(Complaint.status == status)
    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Complaint.complaint_code.ilike(search_fmt),
                Complaint.title.ilike(search_fmt),
                Complaint.description.ilike(search_fmt),
                Complaint.locality.ilike(search_fmt),
                Complaint.citizen_name.ilike(search_fmt)
            )
        )

    complaints = query.order_by(Complaint.created_at.desc()).all()

    # Dynamically compute complaints with recurrence alerts
    recurrence_alerts = get_all_recurrence_alerts(db)
    recurrence_complaint_ids = {a["id"] for a in recurrence_alerts}

    result = []
    for c in complaints:
        result.append(ComplaintListItem(
            id=c.id,
            complaint_code=c.complaint_code,
            title=c.title,
            original_language=c.original_language,
            category=c.category,
            locality=c.locality,
            ward_name=c.ward.name if c.ward else None,
            ward_number=c.ward.ward_number if c.ward else None,
            status=c.status,
            assigned_department_name=c.assigned_department.name if c.assigned_department else None,
            recommended_department_name=c.recommended_department.name if c.recommended_department else None,
            has_recurrence_alert=(c.id in recurrence_complaint_ids),
            created_at=c.created_at
        ))
    return result

@router.get("/{complaint_id}", response_model=ComplaintDetailOut)
def get_complaint_detail(complaint_id: int, db: Session = Depends(get_db)):
    """Retrieves single complaint details, NLP similarity results, routing reason, and timeline."""
    c = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Complaint not found")

    # Find related complaints
    candidates = db.query(Complaint).filter(Complaint.id != c.id).all()
    related = nlp_engine.find_related_complaints(
        target_text=c.description,
        target_category=c.category,
        candidate_complaints=candidates,
        threshold=0.65
    )

    related_items = [
        RelatedComplaintItem(
            id=r["id"],
            complaint_code=r["complaint_code"],
            title=r["title"],
            description=r["description"],
            original_language=r["original_language"],
            category=r["category"],
            locality=r["locality"],
            similarity_score=r["similarity_score"],
            matching_status=r["matching_status"],
            matching_explanation=r["matching_explanation"]
        ) for r in related[:6]
    ]

    actions_sorted = sorted(c.actions, key=lambda a: a.action_date, reverse=True)
    actions_out = [
        RecordedActionOut(
            id=a.id,
            officer_name=a.officer_name,
            officer_id=a.officer_id,
            action_type=a.action_type,
            action_description=a.action_description,
            action_date=a.action_date,
            status_after=a.status_after,
            department_name=a.department.name if a.department else None,
            evidence_url=a.evidence_url
        ) for a in actions_sorted
    ]

    evidence_out = [
        ResolutionEvidenceOut(
            id=e.id,
            file_name=e.file_name,
            file_url=e.file_url,
            file_type=e.file_type,
            description=e.description,
            verified_by=e.verified_by,
            verification_status=e.verification_status,
            uploaded_at=e.uploaded_at
        ) for e in c.evidence
    ]

    audit_sorted = sorted(c.audit_logs, key=lambda al: al.created_at, reverse=True)
    audit_out = [
        AuditLogOut(
            id=al.id,
            action_type=al.action_type,
            previous_value=al.previous_value,
            new_value=al.new_value,
            performed_by=al.performed_by,
            notes=al.notes,
            created_at=al.created_at
        ) for al in audit_sorted
    ]

    return ComplaintDetailOut(
        id=c.id,
        complaint_code=c.complaint_code,
        title=c.title,
        description=c.description,
        original_language=c.original_language,
        translated_text=c.translated_text,
        category=c.category,
        locality=c.locality,
        ward_id=c.ward_id,
        ward_name=c.ward.name if c.ward else None,
        ward_number=c.ward.ward_number if c.ward else None,
        latitude=c.latitude,
        longitude=c.longitude,
        status=c.status,
        citizen_name=c.citizen_name,
        citizen_phone=c.citizen_phone,
        audio_url=c.audio_url,
        audio_transcript=c.audio_transcript,
        image_url=c.image_url,
        assigned_department_id=c.assigned_department_id,
        assigned_department_name=c.assigned_department.name if c.assigned_department else None,
        recommended_department_id=c.recommended_department_id,
        recommended_department_name=c.recommended_department.name if c.recommended_department else None,
        routing_reason=c.routing_reason,
        officer_notes=c.officer_notes,
        incident_id=c.incident_id,
        incident_code=c.incident.incident_code if c.incident else None,
        ai_processing_mode=c.ai_processing_mode,
        is_demo_data=c.is_demo_data,
        created_at=c.created_at,
        updated_at=c.updated_at or c.created_at or utc_now(),
        related_complaints=related_items,
        actions=actions_out,
        evidence=evidence_out,
        audit_logs=audit_out
    )

@router.get("/{complaint_id}/related", response_model=List[RelatedComplaintItem])
def get_related_complaints(
    complaint_id: int,
    threshold: float = Query(0.65, ge=0.0, le=1.0),
    db: Session = Depends(get_db)
):
    """Retrieves cross-lingual semantically related complaints with similarity scores."""
    c = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Complaint not found")

    candidates = db.query(Complaint).filter(Complaint.id != c.id).all()
    matches = nlp_engine.find_related_complaints(
        target_text=c.description,
        target_category=c.category,
        candidate_complaints=candidates,
        threshold=threshold
    )

    return [
        RelatedComplaintItem(
            id=r["id"],
            complaint_code=r["complaint_code"],
            title=r["title"],
            description=r["description"],
            original_language=r["original_language"],
            category=r["category"],
            locality=r["locality"],
            similarity_score=r["similarity_score"],
            matching_status=r["matching_status"],
            matching_explanation=r["matching_explanation"]
        ) for r in matches
    ]

@router.get("/{complaint_id}/graph")
def get_complaint_subgraph(complaint_id: int, db: Session = Depends(get_db)):
    """Returns React Flow subgraph centered on this specific complaint and related incident."""
    c = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return build_civic_graph(db, complaint_id_filter=complaint_id)

@router.post("/{complaint_id}/assign")
def assign_department(complaint_id: int, payload: ComplaintAssign, db: Session = Depends(get_db)):
    """
    Officer assigns or corrects the department routing.
    Maintains complete audit history and updates status.
    """
    c = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Complaint not found")

    dept = db.query(Department).filter(Department.id == payload.department_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")

    prev_dept_name = c.assigned_department.name if c.assigned_department else (
        f"Recommended: {c.recommended_department.name}" if c.recommended_department else "Unassigned"
    )

    c.assigned_department_id = dept.id
    c.officer_notes = payload.officer_notes
    c.updated_at = utc_now()
    if c.status == "Submitted":
        c.status = "Assigned"

    audit = AuditLog(
        complaint_id=c.id,
        action_type="Department Assignment",
        previous_value=prev_dept_name,
        new_value=dept.name,
        performed_by=payload.officer_name,
        notes=payload.officer_notes or f"Assigned to {dept.name} by officer."
    )
    db.add(audit)
    db.commit()
    db.refresh(c)
    return {"status": "success", "message": f"Complaint assigned to {dept.name}", "complaint_status": c.status}

@router.post("/{complaint_id}/action")
def record_officer_action(complaint_id: int, payload: ComplaintActionCreate, db: Session = Depends(get_db)):
    """
    Records an official municipal action with evidence reference and status update.
    Crucial step for recurrence tracking.
    """
    c = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Complaint not found")

    dept = db.query(Department).filter(Department.id == payload.department_id).first()
    dept_id = dept.id if dept else (c.assigned_department_id or c.recommended_department_id or payload.department_id)

    action = RecordedAction(
        complaint_id=c.id,
        incident_id=c.incident_id,
        department_id=dept_id,
        officer_name=payload.officer_name,
        officer_id=payload.officer_id or "OFF-FIELD",
        action_type=payload.action_type,
        action_description=payload.action_description,
        action_date=utc_now(),
        status_after=payload.status_after or "Action Taken",
        evidence_url=payload.evidence_url
    )
    db.add(action)
    db.flush()

    # Update complaint status and department if unset
    old_status = c.status
    c.status = payload.status_after or "Action Taken"
    if not c.assigned_department_id:
        c.assigned_department_id = dept_id
    c.updated_at = utc_now()

    # If action resolves the complaint, check incident status
    if c.status == "Resolved" and c.incident_id:
        unresolved_count = db.query(Complaint).filter(
            Complaint.incident_id == c.incident_id,
            Complaint.id != c.id,
            Complaint.status != "Resolved"
        ).count()
        if unresolved_count == 0:
            inc = db.query(Incident).filter(Incident.id == c.incident_id).first()
            if inc:
                inc.status = "Resolved"

    # Add audit log
    audit = AuditLog(
        complaint_id=c.id,
        action_type="Action Recorded",
        previous_value=old_status,
        new_value=c.status,
        performed_by=payload.officer_name,
        notes=f"{payload.action_type}: {payload.action_description}"
    )
    db.add(audit)

    # If evidence url provided, record ResolutionEvidence
    if payload.evidence_url:
        evidence = ResolutionEvidence(
            complaint_id=c.id,
            recorded_action_id=action.id,
            file_name=payload.evidence_url.split("/")[-1] or "inspection_evidence.jpg",
            file_url=payload.evidence_url,
            file_type="image",
            description=f"Field action documentation for {payload.action_type}",
            verified_by=payload.officer_name,
            verification_status="Verified"
        )
        db.add(evidence)

    db.commit()
    return {"status": "success", "action_id": action.id, "complaint_status": c.status}

@router.post("/{complaint_id}/resolve")
def resolve_complaint(complaint_id: int, payload: ComplaintResolve, db: Session = Depends(get_db)):
    """Marks complaint as Resolved with verified resolution notes, action record, and evidence."""
    c = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Complaint not found")

    old_status = c.status
    c.status = "Resolved"
    c.updated_at = utc_now()

    # 1. Create a RecordedAction so that the resolution is recorded in the action timeline & graph
    action = RecordedAction(
        complaint_id=c.id,
        incident_id=c.incident_id,
        department_id=c.assigned_department_id or c.recommended_department_id or 1,
        officer_name=payload.officer_name,
        officer_id="OFF-RESOLVE",
        action_type="Resolution Completed",
        action_description=payload.resolution_notes,
        action_date=utc_now(),
        status_after="Resolved",
        evidence_url=payload.evidence_url
    )
    db.add(action)
    db.flush()

    # 2. Record Resolution Evidence
    evidence = ResolutionEvidence(
        complaint_id=c.id,
        recorded_action_id=action.id,
        file_name=payload.evidence_file_name or (payload.evidence_url.split("/")[-1] if payload.evidence_url else "resolution_verification.jpg"),
        file_url=payload.evidence_url or "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80",
        file_type="image",
        description=f"Field verification proof: {payload.resolution_notes}",
        verified_by=payload.officer_name,
        verification_status="Verified"
    )
    db.add(evidence)

    # 3. Update Incident status if all complaints for this incident are resolved
    if c.incident_id:
        unresolved_count = db.query(Complaint).filter(
            Complaint.incident_id == c.incident_id,
            Complaint.id != c.id,
            Complaint.status != "Resolved"
        ).count()
        if unresolved_count == 0:
            inc = db.query(Incident).filter(Incident.id == c.incident_id).first()
            if inc:
                inc.status = "Resolved"

    # 4. Audit Log
    audit = AuditLog(
        complaint_id=c.id,
        action_type="Resolved",
        previous_value=old_status,
        new_value="Resolved",
        performed_by=payload.officer_name,
        notes=payload.resolution_notes
    )
    db.add(audit)
    db.commit()
    return {"status": "success", "message": "Complaint resolved successfully", "complaint_status": "Resolved"}

@router.patch("/{complaint_id}/status")
def update_complaint_status(complaint_id: int, payload: ComplaintStatusUpdate, db: Session = Depends(get_db)):
    """Transitions complaint status with full officer audit logging."""
    c = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Complaint not found")

    old_status = c.status
    c.status = payload.status
    if payload.officer_notes:
        c.officer_notes = payload.officer_notes
    c.updated_at = utc_now()

    audit = AuditLog(
        complaint_id=c.id,
        action_type="Status Change",
        previous_value=old_status,
        new_value=payload.status,
        performed_by=payload.officer_name,
        notes=payload.officer_notes or f"Status transitioned from {old_status} to {payload.status}."
    )
    db.add(audit)
    db.commit()
    db.refresh(c)
    return {"status": "success", "complaint_status": c.status, "message": f"Status updated to {c.status}"}
