from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, Enum as SQLEnum
)
from sqlalchemy.orm import relationship
from app.database.session import Base

def utc_now():
    return datetime.now(timezone.utc)

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    code = Column(String(20), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    contact_email = Column(String(100), nullable=True)
    phone = Column(String(20), nullable=True)
    head_officer = Column(String(100), nullable=True)
    sla_hours = Column(Integer, default=48)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    complaints_assigned = relationship("Complaint", foreign_keys="Complaint.assigned_department_id", back_populates="assigned_department")
    complaints_recommended = relationship("Complaint", foreign_keys="Complaint.recommended_department_id", back_populates="recommended_department")
    actions = relationship("RecordedAction", back_populates="department")

class Ward(Base):
    __tablename__ = "wards"

    id = Column(Integer, primary_key=True, index=True)
    ward_number = Column(Integer, nullable=False, unique=True)
    name = Column(String(100), nullable=False)
    zone = Column(String(50), nullable=False)
    center_lat = Column(Float, nullable=False)
    center_lng = Column(Float, nullable=False)
    boundary_geojson = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    complaints = relationship("Complaint", back_populates="ward")
    incidents = relationship("Incident", back_populates="ward")

class JurisdictionRule(Base):
    __tablename__ = "jurisdiction_rules"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(50), nullable=False)
    ward_id = Column(Integer, ForeignKey("wards.id"), nullable=True)
    primary_department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    supporting_department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    rule_description = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)

    ward = relationship("Ward")
    primary_department = relationship("Department", foreign_keys=[primary_department_id])
    supporting_department = relationship("Department", foreign_keys=[supporting_department_id])

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    incident_code = Column(String(30), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    category = Column(String(50), nullable=False)
    locality = Column(String(100), nullable=False)
    ward_id = Column(Integer, ForeignKey("wards.id"), nullable=True)
    status = Column(String(50), default="Investigating")
    first_reported_at = Column(DateTime(timezone=True), default=utc_now)
    last_reported_at = Column(DateTime(timezone=True), default=utc_now)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    ward = relationship("Ward", back_populates="incidents")
    complaints = relationship("Complaint", back_populates="incident")
    actions = relationship("RecordedAction", back_populates="incident")

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    complaint_code = Column(String(30), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    original_language = Column(String(20), default="en") # en, kn, hi, etc.
    translated_text = Column(Text, nullable=True)
    category = Column(String(50), nullable=False) # Water Supply, Roads, Electricity, etc.
    locality = Column(String(100), nullable=False)
    ward_id = Column(Integer, ForeignKey("wards.id"), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    # Status: Submitted, Under Review, Assigned, Action Taken, Resolved, Reopened
    status = Column(String(50), default="Submitted", nullable=False)
    
    citizen_name = Column(String(100), nullable=True)
    citizen_phone = Column(String(20), nullable=True)
    audio_url = Column(String(255), nullable=True)
    audio_transcript = Column(Text, nullable=True)
    image_url = Column(String(255), nullable=True)

    assigned_department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    recommended_department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    routing_reason = Column(Text, nullable=True)
    officer_notes = Column(Text, nullable=True)

    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=True)
    embedding_json = Column(Text, nullable=True) # JSON serialized embedding vector
    ai_processing_mode = Column(String(50), default="multilingual_transformer")
    is_demo_data = Column(Boolean, default=True)

    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    ward = relationship("Ward", back_populates="complaints")
    assigned_department = relationship("Department", foreign_keys=[assigned_department_id], back_populates="complaints_assigned")
    recommended_department = relationship("Department", foreign_keys=[recommended_department_id], back_populates="complaints_recommended")
    incident = relationship("Incident", back_populates="complaints")
    actions = relationship("RecordedAction", back_populates="complaint")
    evidence = relationship("ResolutionEvidence", back_populates="complaint")
    audit_logs = relationship("AuditLog", back_populates="complaint")

class RecordedAction(Base):
    __tablename__ = "recorded_actions"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"), nullable=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    officer_name = Column(String(100), nullable=False)
    officer_id = Column(String(50), nullable=False)
    action_type = Column(String(100), nullable=False)
    action_description = Column(Text, nullable=False)
    action_date = Column(DateTime(timezone=True), default=utc_now)
    status_after = Column(String(50), nullable=False)
    evidence_url = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    complaint = relationship("Complaint", back_populates="actions")
    incident = relationship("Incident", back_populates="actions")
    department = relationship("Department", back_populates="actions")
    evidences = relationship("ResolutionEvidence", back_populates="recorded_action")

class ResolutionEvidence(Base):
    __tablename__ = "resolution_evidence"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"), nullable=False)
    recorded_action_id = Column(Integer, ForeignKey("recorded_actions.id"), nullable=True)
    file_name = Column(String(255), nullable=False)
    file_url = Column(String(255), nullable=False)
    file_type = Column(String(50), default="image") # image, document, report
    description = Column(Text, nullable=True)
    verified_by = Column(String(100), nullable=True)
    verification_status = Column(String(50), default="Verified") # Pending, Verified, Rejected
    uploaded_at = Column(DateTime(timezone=True), default=utc_now)

    complaint = relationship("Complaint", back_populates="evidence")
    recorded_action = relationship("RecordedAction", back_populates="evidences")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"), nullable=False)
    action_type = Column(String(50), nullable=False) # Department Assignment, Status Change, Officer Correction, Action Recorded
    previous_value = Column(String(255), nullable=True)
    new_value = Column(String(255), nullable=True)
    performed_by = Column(String(100), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    complaint = relationship("Complaint", back_populates="audit_logs")
