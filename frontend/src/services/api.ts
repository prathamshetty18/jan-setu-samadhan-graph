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

const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

async function fetchJSON<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
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
  } catch (error: any) {
    console.error(`Failed request to ${url}:`, error);
    throw error;
  }
}

export const api = {
  // Complaints
  getComplaints: (params?: {
    language?: string;
    category?: string;
    department_id?: number;
    ward_id?: number;
    status?: string;
    search?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.language) query.append('language', params.language);
    if (params?.category) query.append('category', params.category);
    if (params?.department_id) query.append('department_id', params.department_id.toString());
    if (params?.ward_id) query.append('ward_id', params.ward_id.toString());
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return fetchJSON<ComplaintListItem[]>(`/api/complaints${queryString}`);
  },

  getComplaintById: (id: number | string) => {
    return fetchJSON<ComplaintDetail>(`/api/complaints/${id}`);
  },

  createComplaint: (data: {
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
  }) => {
    return fetchJSON<ComplaintDetail>('/api/complaints', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  assignDepartment: (id: number, data: { department_id: number; officer_name: string; officer_notes?: string }) => {
    return fetchJSON<{ status: string; message: string; complaint_status: string }>(`/api/complaints/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  recordAction: (id: number, data: {
    department_id: number;
    officer_name: string;
    officer_id: string;
    action_type: string;
    action_description: string;
    status_after?: string;
    evidence_url?: string;
  }) => {
    return fetchJSON<{ status: string; action_id: number; complaint_status: string }>(`/api/complaints/${id}/action`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  resolveComplaint: (id: number, data: {
    officer_name: string;
    resolution_notes: string;
    evidence_file_name?: string;
    evidence_url?: string;
  }) => {
    return fetchJSON<{ status: string; message: string; complaint_status: string }>(`/api/complaints/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  getComplaintGraph: (id: number | string) => {
    return fetchJSON<GraphResponse>(`/api/complaints/${id}/graph`);
  },

  // Dashboard & Analytics
  getDashboardSummary: () => {
    return fetchJSON<DashboardSummary>('/api/dashboard/summary');
  },

  getCategoryAnalytics: () => {
    return fetchJSON<CategoryAnalytics[]>('/api/analytics/categories');
  },

  getWardAnalytics: () => {
    return fetchJSON<WardAnalytics[]>('/api/analytics/wards');
  },

  // Recurrence
  getRecurrenceAlerts: () => {
    return fetchJSON<RecurrenceAlert[]>('/api/recurrence');
  },

  // Responsibility Graph
  getFullGraph: () => {
    return fetchJSON<GraphResponse>('/api/graph');
  },

  // Catalogs
  getDepartments: () => {
    return fetchJSON<Department[]>('/api/departments');
  },

  getWards: () => {
    return fetchJSON<Ward[]>('/api/wards');
  },

  getWardGeoJSON: () => {
    return fetchJSON<any>('/api/wards/geojson');
  },

  // Admin
  resetDemoData: () => {
    return fetchJSON<{ status: string; message: string }>('/api/admin/reset-demo-data', {
      method: 'POST'
    });
  },

  getRules: () => {
    return fetchJSON<any[]>('/api/admin/rules');
  }
};

