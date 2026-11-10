import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Clock,
  Building2,
  MapPin,
  ArrowRight,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { api } from '../../services/api';
import { RecurrenceAlert } from '../../types';

export const RecurrenceMonitoringPage: React.FC = () => {
  const [alerts, setAlerts] = useState<RecurrenceAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const data = await api.getRecurrenceAlerts();
      setAlerts(data);
    } catch (err) {
      console.error("Failed to load recurrence alerts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Recurrence Monitoring & Investigation Queue
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated detection of citizen complaints arriving after previous municipal actions were recorded.
          </p>
        </div>
        <button
          onClick={loadAlerts}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#CBD5E1] rounded text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Operational Policy Banner */}
      <div className="p-4 bg-[#FFF4D6] rounded-lg border border-[#FFE299] text-xs space-y-1 shadow-2xs">
        <p className="font-bold text-amber-900 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-amber-700" />
          <span>Municipal Operational Principle:</span>
        </p>
        <p className="text-amber-800 leading-relaxed">
          A potential recurrence alert flags that a new complaint has arrived in a locality after an earlier inspection or repair action was logged.
          <strong> Recurrence is a signal for field investigation, not proof of negligence or failed resolution.</strong>
        </p>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white p-12 text-center text-xs text-slate-500 rounded-lg border border-slate-200">
            Checking incident logs for post-action recurrence signals...
          </div>
        ) : alerts.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-lg border border-slate-200 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h3 className="font-bold text-slate-800 text-sm">No Active Recurrence Alerts</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No new citizen complaints have arrived on previously serviced incidents.
            </p>
          </div>
        ) : (
          alerts.map((al) => (
            <div
              key={al.id}
              className="bg-white rounded-lg border-2 border-amber-300 shadow-gov p-5 space-y-4 text-xs"
            >
              {/* Alert Title Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F1F5F9] pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-amber-800 bg-[#FFF4D6] px-2 py-0.5 rounded border border-[#FFE299] text-[11px]">
                    POTENTIAL RECURRENCE
                  </span>
                  <span className="font-mono font-bold text-slate-700">
                    Incident: {al.incident_code}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  Reported: {new Date(al.latest_complaint_date).toLocaleString('en-GB')}
                </span>
              </div>

              {/* Alert Message */}
              <p className="text-xs font-semibold text-slate-900 bg-amber-50/70 p-3 rounded border border-amber-200">
                {al.alert_message}
              </p>

              {/* Comparison Grid: Previous Action vs New Complaint */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Previous Action */}
                <div className="p-3.5 bg-[#F8FAFC] rounded-lg border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-600 uppercase">Prior Action Record</span>
                    <span className="font-mono text-slate-500">
                      {new Date(al.previous_action_date).toLocaleDateString('en-GB')}
                    </span>
                  </div>
                  <p className="text-slate-800 font-medium">"{al.previous_action_description}"</p>
                  <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200 flex justify-between">
                    <span>Officer: <strong>{al.previous_officer}</strong></span>
                    <span>Dept: <strong>{al.department_name}</strong></span>
                  </div>
                </div>

                {/* New Complaint */}
                <div className="p-3.5 bg-[#EAF2FA] rounded-lg border border-[#C2DBF2] space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-govblue uppercase">New Trigger Complaint</span>
                    <span className="font-mono text-govblue font-bold">{al.latest_complaint_code}</span>
                  </div>
                  <p className="text-slate-800 font-semibold">"{al.latest_complaint_title}"</p>
                  <div className="text-[11px] text-slate-600 pt-1 border-t border-[#C2DBF2]/60 flex justify-between">
                    <span>Locality: <strong>{al.locality}</strong></span>
                    <span>Ward: <strong>{al.ward_name}</strong></span>
                  </div>
                </div>
              </div>

              {/* Action Link */}
              <div className="pt-2 flex items-center justify-between border-t border-[#F1F5F9]">
                <span className="text-[11px] text-slate-500">
                  Shared category: <strong>{al.category}</strong>
                </span>
                <Link
                  to={`/officer/complaints/${al.id}`}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-govblue hover:bg-govblue-hover text-white text-xs font-semibold rounded transition-colors shadow-2xs"
                >
                  <span>Open Grievance for Review</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

