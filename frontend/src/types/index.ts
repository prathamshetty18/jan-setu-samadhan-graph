export type ComplaintStatus = 'Submitted' | 'Under Review' | 'Assigned' | 'Action Taken' | 'Resolved' | 'Reopened';

export interface Department {
  id: number;
  name: string;
  code: string;
  description?: string;
  contact_email?: string;
  phone?: string;
  head_officer?: string;
  sla_hours: number;
  created_at: string;
}

export interface Ward {
  id: number;
  ward_number: number;
  name: string;
  zone: string;
  center_lat: number;
  center_lng: number;
  boundary_geojson?: string;
  created_at: string;
}

export interface RelatedComplaint {
  id: number;
  complaint_code: string;
  title: string;
  description: string;
  original_language: string;
  category: string;
  locality: string;
  similarity_score: number;
  matching_status: string;
  matching_explanation: string;
}

export interface RecordedAction {
  id: number;
  officer_name: string;
  officer_id: string;
  action_type: string;
  action_description: string;
  action_date: string;
  status_after: string;
  department_name?: string;
  evidence_url?: string;
}

export interface ResolutionEvidence {
  id: number;
  file_name: string;
  file_url: string;
  file_type: string;
  description?: string;
  verified_by?: string;
  verification_status: string;
  uploaded_at: string;
}

export interface AuditLog {
  id: number;
  action_type: string;
  previous_value?: string;
  new_value?: string;
  performed_by: string;
  notes?: string;
  created_at: string;
}

export interface ComplaintListItem {
  id: number;
  complaint_code: string;
  title: string;
  original_language: string;
  category: string;
  locality: string;
  ward_name?: string;
  ward_number?: number;
  status: ComplaintStatus;
  assigned_department_name?: string;
  recommended_department_name?: string;
  has_recurrence_alert: boolean;
  created_at: string;
}

export interface ComplaintDetail {
  id: number;
  complaint_code: string;
  title: string;
  description: string;
  original_language: string;
  translated_text?: string;
  category: string;
  locality: string;
  ward_id?: number;
  ward_name?: string;
  ward_number?: number;
  latitude?: number;
  longitude?: number;
  status: ComplaintStatus;
  citizen_name?: string;
  citizen_phone?: string;
  audio_url?: string;
  audio_transcript?: string;
  image_url?: string;
  assigned_department_id?: number;
  assigned_department_name?: string;
  recommended_department_id?: number;
  recommended_department_name?: string;
  routing_reason?: string;
  officer_notes?: string;
  incident_id?: number;
  incident_code?: string;
  ai_processing_mode: string;
  is_demo_data: boolean;
  created_at: string;
  updated_at: string;
  related_complaints: RelatedComplaint[];
  actions: RecordedAction[];
  evidence: ResolutionEvidence[];
  audit_logs: AuditLog[];
}

export interface DashboardSummary {
  total_complaints: number;
  pending_complaints: number;
  under_review: number;
  resolved_complaints: number;
  related_complaint_groups: number;
  recurrence_alerts: number;
}

export interface CategoryAnalytics {
  category: string;
  count: number;
  resolved_count: number;
  percentage: number;
}

export interface WardAnalytics {
  ward_number: number;
  ward_name: string;
  count: number;
  top_category: string;
}

export interface RecurrenceAlert {
  id: number;
  incident_id?: number;
  incident_code: string;
  incident_title: string;
  category: string;
  locality: string;
  ward_name?: string;
  latest_complaint_code: string;
  latest_complaint_title: string;
  latest_complaint_date: string;
  previous_action_description: string;
  previous_action_date: string;
  previous_officer: string;
  department_name: string;
  related_complaints_count: number;
  alert_message: string;
}

export interface GraphNodeData {
  id: string;
  type: string;
  data: {
    label: string;
    code: string;
    nodeType: string;
    details: string;
    status: string;
    language?: string;
    locality?: string;
    category?: string;
  };
  position: { x: number; y: number };
}

export interface GraphEdgeData {
  id: string;
  source: string;
  target: string;
  label?: string;
  data?: {
    relation: string;
    confidence: number;
    verification: string;
  };
}

export interface GraphResponse {
  nodes: GraphNodeData[];
  edges: GraphEdgeData[];
  stats: Record<string, number>;
}
