import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  CheckCircle2,
  Clock,
  Building2,
  MapPin,
  Calendar,
  AlertCircle,
  FileText,
  Camera,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { api } from '../services/api';
import { ComplaintDetail } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { LanguageBadge } from '../components/LanguageBadge';

export const TrackComplaintPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialId = searchParams.get('id') || '';

  const [searchCode, setSearchCode] = useState(initialId);
  const [loading, setLoading] = useState(false);
  const [complaint, setComplaint] = useState<ComplaintDetail | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchComplaint = async (code: string) => {
    if (!code.trim()) return;
    try {
      setLoading(true);
      setErrorMsg('');
      setComplaint(null);

      // Search complaints by code
      const list = await api.getComplaints({ search: code.trim() });
      if (list && list.length > 0) {
        const full = await api.getComplaintById(list[0].id);
        setComplaint(full);
      } else {
        setErrorMsg(`No complaint record found matching ID "${code}". Please verify your grievance code.`);
      }
    } catch (err: any) {
      setErrorMsg("Failed to query grievance database. Please check your network connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      fetchComplaint(initialId);
    }
  }, [initialId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchComplaint(searchCode);
  };

  // Steps for visual progress timeline
  const getTimelineSteps = () => {
    if (!complaint) return [];
    const status = complaint.status;

    return [
      {
        title: 'Submitted',
        desc: `Logged on ${new Date(complaint.created_at).toLocaleDateString('en-GB')}`,
        completed: true,
        active: status === 'Submitted'
      },
      {
        title: 'Department Assigned',
        desc: complaint.assigned_department_name || complaint.recommended_department_name || 'Jurisdiction Rule Routing',
        completed: status !== 'Submitted',
        active: status === 'Assigned' || status === 'Under Review'
      },
      {
        title: 'Field Action Taken',
        desc: complaint.actions && complaint.actions.length > 0
          ? `${complaint.actions[0].action_type} by ${complaint.actions[0].officer_name}`
          : 'Pending Field Investigation',
        completed: status === 'Action Taken' || status === 'Resolved',
        active: status === 'Action Taken'
      },
      {
        title: 'Resolved & Closed',
        desc: status === 'Resolved' ? 'Verified by Municipal Authority' : 'Pending Verification',
        completed: status === 'Resolved',
        active: status === 'Resolved'
      }
    ];
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] py-10 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <span className="text-xs font-bold uppercase text-govblue tracking-wider bg-[#EAF2FA] px-2.5 py-1 rounded">
            Public Grievance Tracking
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            Track Grievance Redressal Status
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Real-time status, assigned municipal department, and recorded field resolution evidence.
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-white p-6 rounded-xl border border-[#CBD5E1] shadow-gov">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder="Enter Grievance Code (e.g. JS-2026-0001, JS-2026-0004)"
                className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm bg-white border border-[#CBD5E1] rounded-md focus:ring-1 focus:ring-govblue focus:border-govblue focus:outline-none font-mono"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#315B8A] hover:bg-[#25476D] text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-md transition-colors shrink-0 shadow-2xs"
            >
              {loading ? 'Searching...' : 'Track Grievance'}
            </button>
          </form>

          {/* Quick Demo ID pills */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>Demo Grievance IDs:</span>
            {['JS-2026-0001', 'JS-2026-0002', 'JS-2026-0003', 'JS-2026-0004', 'JS-2026-0005'].map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setSearchCode(id);
                  fetchComplaint(id);
                }}
                className="font-mono text-xs text-govblue bg-[#EAF2FA] hover:bg-[#D7E8F7] px-2 py-0.5 rounded border border-[#C2DBF2]"
              >
                {id}
              </button>
            ))}
          </div>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-start gap-3 text-xs sm:text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
            <p>{errorMsg}</p>
          </div>
        )}

        {/* Complaint Result View */}
        {complaint && (
          <div className="bg-white rounded-xl border border-[#CBD5E1] shadow-gov overflow-hidden space-y-6 p-6 sm:p-8">
            
            {/* Top Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-[#E2E8F0]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold font-mono text-govblue tracking-tight">
                    {complaint.complaint_code}
                  </span>
                  <StatusBadge status={complaint.status} />
                  <LanguageBadge language={complaint.original_language} />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                  {complaint.title}
                </h2>
              </div>
              <div className="text-right text-xs text-slate-500">
                <p>Submitted: <strong>{new Date(complaint.created_at).toLocaleDateString('en-GB')}</strong></p>
                <p className="mt-0.5 font-mono text-[11px]">Category: {complaint.category}</p>
              </div>
            </div>

            {/* 4-Step Visual Progress Bar */}
            <div className="py-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
                Redressal Progress Timeline
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 relative">
                {getTimelineSteps().map((step, idx) => (
                  <div
                    key={step.title}
                    className={`p-3.5 rounded-lg border text-left transition-all ${
                      step.completed
                        ? 'bg-[#E8F5EC] border-[#B9E6C5] text-[#1B6A34]'
                        : step.active
                        ? 'bg-[#EAF2FA] border-[#C2DBF2] text-[#315B8A]'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      {step.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-[#1B6A34]" />
                      ) : (
                        <Clock className="w-4 h-4 text-slate-400" />
                      )}
                      <span className="text-xs font-bold">{step.title}</span>
                    </div>
                    <p className="text-[11px] leading-tight text-slate-600 line-clamp-2">
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Complaint Text & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-[#F1F5F9]">
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Original Citizen Grievance
                </h4>
                <div className="p-3.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] text-xs sm:text-sm text-slate-800 leading-relaxed">
                  "{complaint.description}"
                </div>
                {complaint.audio_transcript && (
                  <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded border border-slate-200">
                    <strong>Speech-to-Text Transcript:</strong> "{complaint.audio_transcript}"
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Municipal Assignment Details
                </h4>
                <div className="p-3.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Responsible Department:</span>
                    <strong className="text-slate-800 text-right">
                      {complaint.assigned_department_name || complaint.recommended_department_name}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Locality & Ward:</span>
                    <strong className="text-slate-800">
                      {complaint.locality} (Ward {complaint.ward_number || '101'})
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Jurisdiction Rule:</span>
                    <span className="text-slate-700 italic text-right max-w-[200px]">
                      {complaint.routing_reason || 'Standard Municipal Allocation'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Official Field Actions & Resolution Evidence */}
            {complaint.actions && complaint.actions.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-[#E2E8F0]">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-govteal" />
                  <span>Recorded Field Actions & Inspection Documentation</span>
                </h4>
                <div className="space-y-2.5">
                  {complaint.actions.map((act) => (
                    <div key={act.id} className="p-4 bg-[#F8FAFC] rounded-lg border border-[#CBD5E1] space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-xs sm:text-sm">
                          {act.action_type}
                        </span>
                        <span className="text-slate-500 font-mono text-[11px]">
                          {new Date(act.action_date).toLocaleDateString('en-GB')}
                        </span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{act.action_description}</p>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                        <span>Logged By: <strong>{act.officer_name}</strong> ({act.officer_id})</span>
                        <span className="text-govteal font-semibold">Status: {act.status_after}</span>
                      </div>
                      {act.evidence_url && (
                        <div className="pt-2">
                          <img
                            src={act.evidence_url}
                            alt="Inspection evidence"
                            className="w-48 h-28 object-cover rounded border border-slate-300"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Back link */}
            <div className="pt-4 flex justify-between items-center text-xs text-slate-500 border-t border-[#F1F5F9]">
              <Link to="/submit" className="text-govblue hover:underline font-semibold">
                ← Submit Another Complaint
              </Link>
              <Link to="/officer" className="text-slate-600 hover:text-govblue flex items-center gap-1 font-medium">
                <span>View on Officer Graph</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

