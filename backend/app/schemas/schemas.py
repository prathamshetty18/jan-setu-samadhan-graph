
from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

# Departments
class DepartmentBase(BaseModel):
    name: str
    code: str
    description: Optional[str] = None
    contact_email: Optional[str] = None
    phone: Optional[str] = None
    head_officer: Optional[str] = None
    sla_hours: int = 48

class DepartmentOut(DepartmentBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Wards
class WardBase(BaseModel):
    ward_number: int
    name: str
    zone: str
    center_lat: float
    center_lng: float
    boundary_geojson: Optional[str] = None

class WardOut(WardBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Complaints
class ComplaintCreate(BaseModel):
    title: str
    description: str
    original_language: str = "en"
    category: str
    locality: str
    ward_id: Optional[int] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    citizen_name: Optional[str] = "Citizen"
    citizen_phone: Optional[str] = None
    audio_url: Optional[str] = None
    audio_transcript: Optional[str] = None
    image_url: Optional[str] = None

class ComplaintAssign(BaseModel):
    department_id: int
    officer_name: str
    officer_notes: Optional[str] = None

class ComplaintActionCreate(BaseModel):
    department_id: int
    officer_name: str
    officer_id: str
    action_type: str
    action_description: str
    status_after: str = "Action Taken"
    evidence_url: Optional[str] = None

class ComplaintResolve(BaseModel):
    officer_name: str
    resolution_notes: str
    evidence_file_name: Optional[str] = None
    evidence_url: Optional[str] = None

class ComplaintStatusUpdate(BaseModel):
    status: str
    officer_name: str = "Officer"
    officer_notes: Optional[str] = None

class RelatedComplaintItem(BaseModel):
    id: int
    complaint_code: str
    title: str
    description: str
    original_language: str
    category: str
    locality: str
    similarity_score: float
    matching_status: str # "High Confidence Match", "Potential Match", "Review Needed"
    matching_explanation: str

class RecordedActionOut(BaseModel):
    id: int
    officer_name: str
    officer_id: str
    action_type: str
    action_description: str
    action_date: datetime
    status_after: str
    department_name: Optional[str] = None
    evidence_url: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class ResolutionEvidenceOut(BaseModel):
    id: int
    file_name: str
    file_url: str
    file_type: str
    description: Optional[str] = None
    verified_by: Optional[str] = None
    verification_status: str
    uploaded_at: datetime
    model_config = ConfigDict(from_attributes=True)

class AuditLogOut(BaseModel):
    id: int
    action_type: str
    previous_value: Optional[str] = None
    new_value: Optional[str] = None
    performed_by: str
    notes: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class ComplaintListItem(BaseModel):
    id: int
    complaint_code: str
    title: str
    original_language: str
    category: str
    locality: str
    ward_name: Optional[str] = None
    ward_number: Optional[int] = None
    status: str
    assigned_department_name: Optional[str] = None
    recommended_department_name: Optional[str] = None
    has_recurrence_alert: bool = False
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class ComplaintDetailOut(BaseModel):
    id: int
    complaint_code: str
    title: str
    description: str
    original_language: str
    translated_text: Optional[str] = None
    category: str
    locality: str
    ward_id: Optional[int] = None
    ward_name: Optional[str] = None
    ward_number: Optional[int] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status: str
    citizen_name: Optional[str] = None
    citizen_phone: Optional[str] = None
    audio_url: Optional[str] = None
    audio_transcript: Optional[str] = None
    image_url: Optional[str] = None
    
    assigned_department_id: Optional[int] = None
    assigned_department_name: Optional[str] = None
    recommended_department_id: Optional[int] = None
    recommended_department_name: Optional[str] = None
    routing_reason: Optional[str] = None
    officer_notes: Optional[str] = None
    
    incident_id: Optional[int] = None
    incident_code: Optional[str] = None
    ai_processing_mode: str
    is_demo_data: bool
    created_at: datetime
    updated_at: datetime

    related_complaints: List[RelatedComplaintItem] = []
    actions: List[RecordedActionOut] = []
    evidence: List[ResolutionEvidenceOut] = []
    audit_logs: List[AuditLogOut] = []

    model_config = ConfigDict(from_attributes=True)

# Dashboard & Analytics
class DashboardSummaryOut(BaseModel):
    total_complaints: int
    pending_complaints: int
    under_review: int
    resolved_complaints: int
    related_complaint_groups: int
    recurrence_alerts: int

class CategoryAnalyticsItem(BaseModel):
    category: str
    count: int
    resolved_count: int
    percentage: float

class WardAnalyticsItem(BaseModel):
    ward_number: int
    ward_name: str
    count: int
    top_category: str

class RecurrenceAlertOut(BaseModel):
    id: int
    incident_id: Optional[int] = None
    incident_code: str
    incident_title: str
    category: str
    locality: str
    ward_name: Optional[str] = None
    latest_complaint_code: str
    latest_complaint_title: str
    latest_complaint_date: datetime
    previous_action_description: str
    previous_action_date: datetime
    previous_officer: str
    department_name: str
    related_complaints_count: int
    alert_message: str

# Graph Nodes and Edges for React Flow
class GraphNode(BaseModel):
    id: str
    type: str # complaint, incident, category, locality, ward, department, action, evidence
    data: Dict[str, Any] # label, code, details, status, etc.
    position: Dict[str, float]

class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    label: Optional[str] = None
    data: Optional[Dict[str, Any]] = None

class GraphDataOut(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]
    stats: Dict[str, int]
