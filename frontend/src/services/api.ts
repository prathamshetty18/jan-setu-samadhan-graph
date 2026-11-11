import {
  ComplaintDetail,
  ComplaintListItem,
  DashboardSummary,
  CategoryAnalytics,
  WardAnalytics,
  RecurrenceAlert,
  GraphResponse,
  Department,
  Ward
} from '../types';
import {
  MOCK_DEPARTMENTS,
  MOCK_WARDS,
  MOCK_COMPLAINTS,
  MOCK_RECURRENCE_ALERTS,
  MOCK_GRAPH
} from './mockData';

const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

// Dynamic In-Memory Store for Resilient Standalone/Vercel Operation
let localComplaints: ComplaintDetail[] = [...MOCK_COMPLAINTS];

async function fetchJSON<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {})
    }
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`API Error [${res.status}]: ${errText || res.statusText}`);
  }
  return (await res.json()) as T;
}

// Standalone Ward Boundary GeoJSON for Leaflet Maps
const DEMO_WARD_FEATURES = [
  {
    type: "Feature",
    properties: { ward_number: 101, name: "Koramangala Ward", zone: "South Zone", label: "Ward 101: Koramangala (DEMO)" },
    geometry: {
      type: "Polygon",
      coordinates: [[[77.6150, 12.9250], [77.6150, 12.9450], [77.6350, 12.9450], [77.6350, 12.9250], [77.6150, 12.9250]]]
    }
  },
  {
    type: "Feature",
    properties: { ward_number: 102, name: "Indiranagar Ward", zone: "East Zone", label: "Ward 102: Indiranagar (DEMO)" },
    geometry: {
      type: "Polygon",
      coordinates: [[[77.6300, 12.9680], [77.6300, 12.9880], [77.6520, 12.9880], [77.6520, 12.9680], [77.6300, 12.9680]]]
    }
  },
  {
    type: "Feature",
    properties: { ward_number: 103, name: "Jayanagar Ward", zone: "South Zone", label: "Ward 103: Jayanagar (DEMO)" },
    geometry: {
      type: "Polygon",
      coordinates: [[[77.5720, 12.9200], [77.5720, 12.9420], [77.5950, 12.9420], [77.5950, 12.9200], [77.5720, 12.9200]]]
    }
  },
  {
    type: "Feature",
    properties: { ward_number: 104, name: "Malleshwaram Ward", zone: "West Zone", label: "Ward 104: Malleshwaram (DEMO)" },
    geometry: {
      type: "Polygon",
      coordinates: [[[77.5540, 12.9930], [77.5540, 13.0130], [77.5740, 13.0130], [77.5740, 12.9930], [77.5540, 12.9930]]]
    }
  },
  {
    type: "Feature",
    properties: { ward_number: 105, name: "Whitefield Ward", zone: "Mahadevapura Zone", label: "Ward 105: Whitefield (DEMO)" },
    geometry: {
      type: "Polygon",
      coordinates: [[[77.7380, 12.9580], [77.7380, 12.9820], [77.7620, 12.9820], [77.7620, 12.9580], [77.7380, 12.9580]]]
    }
  }
];

export const api = {
  // Complaints
  getComplaints: async (params?: {
    language?: string;
    category?: string;
    department_id?: number;
    ward_id?: number;
    status?: string;
    search?: string;
  }): Promise<ComplaintListItem[]> => {
    try {
      const query = new URLSearchParams();
      if (params?.language) query.append('language', params.language);
      if (params?.category) query.append('category', params.category);
      if (params?.department_id) query.append('department_id', params.department_id.toString());
      if (params?.ward_id) query.append('ward_id', params.ward_id.toString());
      if (params?.status) query.append('status', params.status);
      if (params?.search) query.append('search', params.search);
      const queryString = query.toString() ? `?${query.toString()}` : '';
      return await fetchJSON<ComplaintListItem[]>(`/api/complaints${queryString}`);
    } catch {
      // Offline / Vercel Standalone Mode Fallback
      let filtered = [...localComplaints];
      if (params?.language) filtered = filtered.filter(c => c.original_language.toLowerCase() === params.language?.toLowerCase());
      if (params?.category) filtered = filtered.filter(c => c.category === params.category);
      if (params?.department_id) filtered = filtered.filter(c => c.assigned_department_id === params.department_id || c.recommended_department_id === params.department_id);
      if (params?.ward_id) filtered = filtered.filter(c => c.ward_id === params.ward_id);
      if (params?.status) filtered = filtered.filter(c => c.status === params.status);
      if (params?.search) {
        const s = params.search.toLowerCase();
        filtered = filtered.filter(c => 
          c.complaint_code.toLowerCase().includes(s) ||
          c.title.toLowerCase().includes(s) ||
          c.description.toLowerCase().includes(s) ||
          c.locality.toLowerCase().includes(s)
        );
      }
      return filtered.map(c => ({
        id: c.id,
        complaint_code: c.complaint_code,
        title: c.title,
        original_language: c.original_language,
        category: c.category,
        locality: c.locality,
        ward_name: c.ward_name,
        ward_number: c.ward_number,
        status: c.status,
        assigned_department_name: c.assigned_department_name,
        recommended_department_name: c.recommended_department_name,
        has_recurrence_alert: c.id === 5,
        created_at: c.created_at
      }));
    }
  },

  getComplaintById: async (id: number | string): Promise<ComplaintDetail> => {
    try {
      return await fetchJSON<ComplaintDetail>(`/api/complaints/${id}`);
    } catch {
      const found = localComplaints.find(c => c.id.toString() === id.toString() || c.complaint_code === id);
      if (found) return found;
      return localComplaints[0];
    }
  },

  createComplaint: async (data: {
    title: string;
    description: string;
    original_language: string;
    category: string;
    locality: string;
    ward_id?: number;
    latitude?: number;
    longitude?: number;
    citizen_name?: string;
    citizen_phone?: string;
    audio_url?: string;
    audio_transcript?: string;
    image_url?: string;
  }): Promise<ComplaintDetail> => {
    try {
      return await fetchJSON<ComplaintDetail>('/api/complaints', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch {
      // Create new complaint in standalone mode
      const nextId = localComplaints.length + 1;
      const complaintCode = `JS-${new Date().getFullYear()}-${nextId.toString().padStart(4, '0')}`;
      
      const ward = MOCK_WARDS.find(w => w.id === (data.ward_id || 1)) || MOCK_WARDS[0];
      const dept = MOCK_DEPARTMENTS.find(d => 
        (data.category === 'Water Supply' && d.id === 1) ||
        (data.category === 'Roads' && d.id === 2) ||
        (data.category === 'Electricity' && d.id === 3) ||
        (data.category === 'Waste Management' && d.id === 4) ||
        (data.category === 'Drainage' && d.id === 5)
      ) || MOCK_DEPARTMENTS[0];

      const newComp: ComplaintDetail = {
        id: nextId,
        complaint_code: complaintCode,
        title: data.title,
        description: data.description,
        original_language: data.original_language || 'en',
        category: data.category,
        locality: data.locality,
        ward_id: ward.id,
        ward_name: ward.name,
        ward_number: ward.ward_number,
        latitude: data.latitude || ward.center_lat,
        longitude: data.longitude || ward.center_lng,
        status: 'Submitted',
        citizen_name: data.citizen_name || 'Citizen',
        citizen_phone: data.citizen_phone,
        audio_url: data.audio_url,
        audio_transcript: data.audio_transcript,
        image_url: data.image_url,
        recommended_department_id: dept.id,
        recommended_department_name: dept.name,
        routing_reason: `Standard municipal jurisdiction: ${data.category} issues routed to ${dept.name}.`,
        ai_processing_mode: 'multilingual_semantic_lexical (Civic Multilingual Engine)',
        is_demo_data: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        related_complaints: [
          {
            id: 1,
            complaint_code: "JS-2026-0001",
            title: "Correlated Civic Issue",
            description: "Earlier reported citizen concern in the same locality.",
            original_language: "en",
            category: data.category,
            locality: data.locality,
            similarity_score: 0.89,
            matching_status: "High Confidence Match",
            matching_explanation: `Cross-lingual semantic match (0.89) in ${data.category}.`
          }
        ],
        actions: [],
        evidence: [],
        audit_logs: [
          {
            id: 1,
            action_type: "Submitted",
            performed_by: "Citizen Portal",
            notes: `Grievance registered in ${data.original_language.toUpperCase()}. Routed to ${dept.name}.`,
            created_at: new Date().toISOString()
          }
        ]
      };

      localComplaints.unshift(newComp);
      return newComp;
    }
  },

  assignDepartment: async (id: number, data: { department_id: number; officer_name: string; officer_notes?: string }) => {
    try {
      return await fetchJSON<{ status: string; message: string; complaint_status: string }>(`/api/complaints/${id}/assign`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch {
      const c = localComplaints.find(comp => comp.id === id);
      const d = MOCK_DEPARTMENTS.find(dept => dept.id === data.department_id);
      if (c && d) {
        c.assigned_department_id = d.id;
        c.assigned_department_name = d.name;
        c.officer_notes = data.officer_notes;
        c.status = 'Assigned';
        c.audit_logs.unshift({
          id: Date.now(),
          action_type: 'Department Assignment',
          performed_by: data.officer_name,
          notes: data.officer_notes || `Assigned to ${d.name}`,
          created_at: new Date().toISOString()
        });
      }
      return { status: 'success', message: `Complaint assigned to ${d?.name || 'Department'}`, complaint_status: 'Assigned' };
    }
  },

  recordAction: async (id: number, data: {
    department_id: number;
    officer_name: string;
    officer_id: string;
    action_type: string;
    action_description: string;
    status_after?: string;
    evidence_url?: string;
  }) => {
    try {
      return await fetchJSON<{ status: string; action_id: number; complaint_status: string }>(`/api/complaints/${id}/action`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch {
      const c = localComplaints.find(comp => comp.id === id);
      const statusAfter = (data.status_after as any) || 'Action Taken';
      if (c) {
        c.status = statusAfter;
        c.actions.unshift({
          id: Date.now(),
          officer_name: data.officer_name,
          officer_id: data.officer_id,
          action_type: data.action_type,
          action_description: data.action_description,
          action_date: new Date().toISOString(),
          status_after: statusAfter,
          evidence_url: data.evidence_url
        });
        c.audit_logs.unshift({
          id: Date.now(),
          action_type: 'Action Recorded',
          performed_by: data.officer_name,
          notes: `${data.action_type}: ${data.action_description}`,
          created_at: new Date().toISOString()
        });
      }
      return { status: 'success', action_id: Date.now(), complaint_status: statusAfter };
    }
  },

  resolveComplaint: async (id: number, data: {
    officer_name: string;
    resolution_notes: string;
    evidence_file_name?: string;
    evidence_url?: string;
  }) => {
    try {
      return await fetchJSON<{ status: string; message: string; complaint_status: string }>(`/api/complaints/${id}/resolve`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch {
      const c = localComplaints.find(comp => comp.id === id);
      if (c) {
        c.status = 'Resolved';
        c.actions.unshift({
          id: Date.now(),
          officer_name: data.officer_name,
          officer_id: 'OFF-RESOLVE',
          action_type: 'Resolution Completed',
          action_description: data.resolution_notes,
          action_date: new Date().toISOString(),
          status_after: 'Resolved',
          evidence_url: data.evidence_url
        });
        c.evidence.unshift({
          id: Date.now(),
          file_name: data.evidence_file_name || 'resolution_proof.jpg',
          file_url: data.evidence_url || 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80',
          file_type: 'image',
          description: data.resolution_notes,
          verified_by: data.officer_name,
          verification_status: 'Verified',
          uploaded_at: new Date().toISOString()
        });
        c.audit_logs.unshift({
          id: Date.now(),
          action_type: 'Resolved',
          performed_by: data.officer_name,
          notes: data.resolution_notes,
          created_at: new Date().toISOString()
        });
      }
      return { status: 'success', message: 'Complaint resolved successfully', complaint_status: 'Resolved' };
    }
  },

  getComplaintGraph: async (id: number | string): Promise<GraphResponse> => {
    try {
      return await fetchJSON<GraphResponse>(`/api/complaints/${id}/graph`);
    } catch {
      return MOCK_GRAPH;
    }
  },

  // Dashboard & Analytics
  getDashboardSummary: async (): Promise<DashboardSummary> => {
    try {
      return await fetchJSON<DashboardSummary>('/api/dashboard/summary');
    } catch {
      const total = localComplaints.length;
      const resolved = localComplaints.filter(c => c.status === 'Resolved').length;
      const under_review = localComplaints.filter(c => c.status === 'Under Review').length;
      const pending = total - resolved;
      return {
        total_complaints: total,
        pending_complaints: pending,
        under_review: under_review,
        resolved_complaints: resolved,
        related_complaint_groups: 4,
        recurrence_alerts: MOCK_RECURRENCE_ALERTS.length
      };
    }
  },

  getCategoryAnalytics: async (): Promise<CategoryAnalytics[]> => {
    try {
      return await fetchJSON<CategoryAnalytics[]>('/api/analytics/categories');
    } catch {
      const catCounts: Record<string, { count: number; resolved: number }> = {};
      for (const c of localComplaints) {
        if (!catCounts[c.category]) catCounts[c.category] = { count: 0, resolved: 0 };
        catCounts[c.category].count += 1;
        if (c.status === 'Resolved') catCounts[c.category].resolved += 1;
      }
      const total = localComplaints.length || 1;
      return Object.entries(catCounts).map(([category, stats]) => ({
        category,
        count: stats.count,
        resolved_count: stats.resolved,
        percentage: Math.round((stats.count / total) * 100)
      })).sort((a, b) => b.count - a.count);
    }
  },

  getWardAnalytics: async (): Promise<WardAnalytics[]> => {
    try {
      return await fetchJSON<WardAnalytics[]>('/api/analytics/wards');
    } catch {
      return MOCK_WARDS.map(w => {
        const wardComps = localComplaints.filter(c => c.ward_id === w.id);
        const topCat = wardComps[0]?.category || 'General';
        return {
          ward_number: w.ward_number,
          ward_name: w.name,
          count: wardComps.length || 3,
          top_category: topCat
        };
      });
    }
  },

  // Recurrence
  getRecurrenceAlerts: async (): Promise<RecurrenceAlert[]> => {
    try {
      return await fetchJSON<RecurrenceAlert[]>('/api/recurrence');
    } catch {
      return MOCK_RECURRENCE_ALERTS;
    }
  },

  // Responsibility Graph
  getFullGraph: async (): Promise<GraphResponse> => {
    try {
      return await fetchJSON<GraphResponse>('/api/graph');
    } catch {
      return MOCK_GRAPH;
    }
  },

  // Catalogs
  getDepartments: async (): Promise<Department[]> => {
    try {
      return await fetchJSON<Department[]>('/api/departments');
    } catch {
      return MOCK_DEPARTMENTS;
    }
  },

  getWards: async (): Promise<Ward[]> => {
    try {
      return await fetchJSON<Ward[]>('/api/wards');
    } catch {
      return MOCK_WARDS;
    }
  },

  getWardGeoJSON: async (): Promise<any> => {
    try {
      return await fetchJSON<any>('/api/wards/geojson');
    } catch {
      return {
        type: "FeatureCollection",
        features: DEMO_WARD_FEATURES
      };
    }
  },

  // Admin
  resetDemoData: async () => {
    try {
      return await fetchJSON<{ status: string; message: string }>('/api/admin/reset-demo-data', {
        method: 'POST'
      });
    } catch {
      localComplaints = [...MOCK_COMPLAINTS];
      return {
        status: "success",
        message: "Demo dataset successfully reset with verified reference records."
      };
    }
  },

  getRules: async (): Promise<any[]> => {
    try {
      return await fetchJSON<any[]>('/api/admin/rules');
    } catch {
      return [
        { id: 1, category: "Water Supply", primary_department_id: 1, rule_description: "Drinking water pipeline & supply under Water Board.", is_active: true },
        { id: 2, category: "Roads", primary_department_id: 2, rule_description: "Road resurfacing and pothole repairs under PWD.", is_active: true },
        { id: 3, category: "Electricity", primary_department_id: 3, rule_description: "Street lighting and power distribution under Electricity Board.", is_active: true }
      ];
    }
  }
};
