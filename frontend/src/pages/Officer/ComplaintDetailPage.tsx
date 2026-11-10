import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Network,
  Clock,
  Sparkles,
  FileText,
  User,
  ShieldCheck,
  CheckSquare,
  Camera,
  MapPin,
  HelpCircle
} from 'lucide-react';
import { api } from '../../services/api';
import { ComplaintDetail, Department } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { LanguageBadge } from '../../components/LanguageBadge';
import { AssignModal } from '../../components/Modals/AssignModal';
import { ActionModal } from '../../components/Modals/ActionModal';

export const ComplaintDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [complaint, setComplaint] = useState<ComplaintDetail | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isActionOpen, setIsActionOpen] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  const loadComplaint = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [data, depts] = await Promise.all([
        api.getComplaintById(id),
        api.getDepartments()
      ]);
      setComplaint(data);
      setDepartments(depts);
    } catch (err) {
      console.error("Failed to load complaint detail", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaint();
  }, [id]);

  const handleAcceptRecommendation = async () => {
    if (!complaint || !complaint.recommended_department_id) return;
    try {
      await api.assignDepartment(complaint.id, {
        department_id: complaint.recommended_department_id,
        officer_name: 'Er. S. Meenakshi',
        officer_notes: 'Accepted verified jurisdiction routing recommendation.'
      });
      setActionSuccessMsg('Department recommendation accepted.');
      loadComplaint();
      setTimeout(() => setActionSuccessMsg(''), 4000);
    } catch (err) {
      alert("Failed to accept recommendation");
    }
  };

  const handleAssignDepartment = async (deptId: number, notes: string) => {
    if (!complaint) return;
    await api.assignDepartment(complaint.id, {
      department_id: deptId,
      officer_name: 'Er. S. Meenakshi',
      officer_notes: notes
    });
    setActionSuccessMsg('Department updated successfully.');
    loadComplaint();
    setTimeout(() => setActionSuccessMsg(''), 4000);
  };

  const handleRecordAction = async (data: any) => {
    if (!complaint) return;
    await api.recordAction(complaint.id, data);
    setActionSuccessMsg('Official field action recorded successfully.');
    loadComplaint();
    setTimeout(() => setActionSuccessMsg(''), 4000);
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-500 text-xs">
        Loading complaint records and semantic graph connections...
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="py-16 text-center space-y-3">
        <p className="text-slate-600 text-sm">Complaint record not found.</p>
        <Link to="/officer/complaints" className="text-govblue hover:underline text-xs font-semibold">
          ← Return to Complaints List
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Back button and Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/officer/complaints"
            className="p-1.5 bg-white hover:bg-slate-100 rounded border border-slate-300 text-slate-600 transition-colors shadow-2xs"
            title="Back to complaints"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xl font-extrabold text-govblue tracking-tight">
                {complaint.complaint_code}
              </span>
              <StatusBadge status={complaint.status} />
              <LanguageBadge language={complaint.original_language} size="sm" />
              {complaint.is_demo_data && (
                <span className="text-[10px] font-bold text-amber-800 bg-[#FFF4D6] px-2 py-0.5 rounded border border-[#FFE299]">
                  DEMO RECORD
                </span>
              )}
            </div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
              {complaint.title}
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          {complaint.status !== 'Resolved' && (
            <button
              type="button"
              onClick={() => {
                const notes = window.prompt("Enter resolution notes / field verification statement:");
                if (notes) {
                  api.resolveComplaint(complaint.id, {
                    officer_name: 'Er. S. Meenakshi',
                    resolution_notes: notes
                  }).then(() => {
                    setActionSuccessMsg("Complaint marked as Resolved.");
                    loadComplaint();
                  }).catch(() => alert("Failed to resolve complaint"));
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded shadow-2xs transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark as Resolved</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsActionOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-govteal hover:bg-govteal-hover text-white text-xs font-bold rounded shadow-2xs transition-colors"
          >
            <CheckSquare className="w-4 h-4" />
            <span>Record Official Action</span>
          </button>
          <button
            type="button"
            onClick={() => setIsAssignOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded border border-[#CBD5E1] shadow-2xs transition-colors"
          >
            <Building2 className="w-4 h-4 text-slate-500" />
            <span>Reassign Department</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {actionSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Complaint & Smart Routing */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Card 1: Citizen Complaint Information */}
          <div className="bg-white rounded-lg border border-[#CBD5E1] shadow-gov p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-govblue" />
                <span>Original Citizen Grievance Record</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">
                Logged: {new Date(complaint.created_at).toLocaleString('en-GB')}
              </span>
            </div>

            <div className="p-4 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-2">
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                "{complaint.description}"
              </p>
              {complaint.audio_transcript && (
                <div className="mt-2 pt-2 border-t border-slate-200 text-xs text-slate-600">
                  <span className="font-semibold text-slate-700">Audio Transcript:</span> "{complaint.audio_transcript}"
                </div>
              )}
            </div>

            {/* Metadata Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Category</span>
                <span className="font-bold text-slate-800">{complaint.category}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Locality</span>
                <span className="font-bold text-slate-800 truncate block" title={complaint.locality}>
                  {complaint.locality}
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Ward</span>
                <span className="font-bold text-slate-800">
                  Ward {complaint.ward_number || '101'}: {complaint.ward_name || 'Koramangala'}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: AI Processing & Multilingual Semantic Similarity */}
          <div className="bg-white rounded-lg border border-[#CBD5E1] shadow-gov p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-govblue" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Multilingual AI Semantic Similarity Results
                </h3>
              </div>
              <span className="text-[10px] font-mono font-semibold bg-[#EAF2FA] text-govblue px-2 py-0.5 rounded border border-[#C2DBF2]">
                {complaint.ai_processing_mode}
              </span>
            </div>

            <p className="text-xs text-slate-600">
              Cross-lingual embeddings identify semantically connected citizen grievances across regional languages without merging separate citizen records:
            </p>

            {/* Related complaints table */}
            {complaint.related_complaints && complaint.related_complaints.length > 0 ? (
              <div className="space-y-2.5">
                {complaint.related_complaints.map((rel) => (
                  <div
                    key={rel.id}
                    className="p-3 bg-[#F8FAFC] rounded-lg border border-[#CBD5E1] hover:border-govblue/50 transition-all space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/officer/complaints/${rel.id}`}
                          className="font-mono font-bold text-govblue hover:underline"
                        >
                          {rel.complaint_code}
                        </Link>
                        <LanguageBadge language={rel.original_language} size="sm" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-slate-700">Cosine Score:</span>
                        <span className="font-mono font-bold text-govteal bg-[#DDF3EF] px-2 py-0.5 rounded text-xs">
                          {(rel.similarity_score * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    <p className="text-slate-800 font-medium">"{rel.description}"</p>
                    <p className="text-[11px] text-slate-500 italic">
                      Matching Explanation: {rel.matching_explanation}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded border border-slate-200 text-center text-xs text-slate-500">
                No high-confidence related complaints identified in this locality.
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Smart Routing & Activity Timeline */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Card 3: Smart Department Routing */}
          <div className="bg-white rounded-lg border border-[#CBD5E1] shadow-gov p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-govblue" />
                <span>Smart Department Routing</span>
              </h3>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Rule Engine Verified
              </span>
            </div>

            <div className="p-3.5 bg-[#EAF2FA] rounded-lg border border-[#C2DBF2] space-y-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Recommended Department:</span>
                <p className="font-bold text-sm text-[#315B8A]">
                  {complaint.recommended_department_name || 'Water Department'}
                </p>
              </div>

              {complaint.routing_reason && (
                <div className="text-[11px] text-slate-600 pt-1 border-t border-[#C2DBF2]/60">
                  <strong>Jurisdiction Reason:</strong> {complaint.routing_reason}
                </div>
              )}
            </div>

            {/* Current Assignment Status */}
            <div className="p-3 bg-[#F8FAFC] rounded border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Assigned Department:</span>
                <strong className="text-slate-800">
                  {complaint.assigned_department_name || 'Awaiting Officer Confirmation'}
                </strong>
              </div>
              {complaint.officer_notes && (
                <p className="text-[11px] text-slate-600 italic mt-1">
                  Officer Note: "{complaint.officer_notes}"
                </p>
              )}
            </div>

            {/* Officer Routing Controls */}
            <div className="flex items-center gap-2 pt-1">
              {!complaint.assigned_department_id && complaint.recommended_department_id && (
                <button
                  type="button"
                  onClick={handleAcceptRecommendation}
                  className="flex-1 py-2 px-3 bg-govblue hover:bg-govblue-hover text-white font-semibold text-xs rounded transition-colors shadow-2xs"
                >
                  Accept Recommendation
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsAssignOpen(true)}
                className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded border border-slate-300"
              >
                Change Department
              </button>
            </div>
          </div>

          {/* Card 4: Verifiable Activity Timeline */}
          <div className="bg-white rounded-lg border border-[#CBD5E1] shadow-gov p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-govteal" />
                <span>Verifiable Activity Timeline</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-500">Audit Logged</span>
            </div>

            <div className="space-y-4 relative pl-4 border-l-2 border-slate-200">
              {/* Recorded actions */}
              {complaint.actions && complaint.actions.map((act) => (
                <div key={act.id} className="relative text-xs space-y-1">
                  <div className="w-2.5 h-2.5 bg-govteal rounded-full absolute -left-[21px] top-1 border-2 border-white" />
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-bold text-slate-800">{act.action_type}</span>
                    <span className="font-mono">{new Date(act.action_date).toLocaleDateString('en-GB')}</span>
                  </div>
                  <p className="text-slate-700">{act.action_description}</p>
                  <p className="text-[10px] text-slate-500">By {act.officer_name} ({act.officer_id})</p>
                  {act.evidence_url && (
                    <img
                      src={act.evidence_url}
                      alt="Action evidence"
                      className="w-36 h-20 object-cover rounded mt-1 border border-slate-200"
                    />
                  )}
                </div>
              ))}

              {/* Audit Logs */}
              {complaint.audit_logs && complaint.audit_logs.map((al) => (
                <div key={al.id} className="relative text-xs space-y-0.5">
                  <div className="w-2.5 h-2.5 bg-govblue rounded-full absolute -left-[21px] top-1 border-2 border-white" />
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-800">{al.action_type}</span>
                    <span className="font-mono">{new Date(al.created_at).toLocaleDateString('en-GB')}</span>
                  </div>
                  <p className="text-[11px] text-slate-600">{al.notes}</p>
                  <p className="text-[10px] text-slate-400">Actor: {al.performed_by}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Assign Modal */}
      <AssignModal
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        departments={departments}
        currentDeptId={complaint.assigned_department_id || complaint.recommended_department_id}
        onAssign={handleAssignDepartment}
      />

      {/* Action Modal */}
      <ActionModal
        isOpen={isActionOpen}
        onClose={() => setIsActionOpen(false)}
        departments={departments}
        defaultDeptId={complaint.assigned_department_id || complaint.recommended_department_id}
        onRecordAction={handleRecordAction}
      />

    </div>
  );
};

