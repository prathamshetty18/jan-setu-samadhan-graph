import React, { useState } from 'react';
import { Department } from '../../types';
import { CheckSquare, X, Camera } from 'lucide-react';

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  departments: Department[];
  defaultDeptId?: number;
  onRecordAction: (data: {
    department_id: number;
    officer_name: string;
    officer_id: string;
    action_type: string;
    action_description: string;
    status_after: string;
    evidence_url?: string;
  }) => Promise<void>;
}

export const ActionModal: React.FC<ActionModalProps> = ({
  isOpen,
  onClose,
  departments,
  defaultDeptId,
  onRecordAction
}) => {
  const [deptId, setDeptId] = useState<number>(defaultDeptId || (departments[0]?.id || 1));
  const [officerName, setOfficerName] = useState('Er. S. Meenakshi');
  const [officerId, setOfficerId] = useState('OFF-PWD-8402');
  const [actionType, setActionType] = useState('Field Inspection & Assessment');
  const [description, setDescription] = useState('');
  const [statusAfter, setStatusAfter] = useState('Action Taken');
  const [evidenceUrl, setEvidenceUrl] = useState('https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?w=600');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert("Please provide an action description");
      return;
    }

    try {
      setLoading(true);
      await onRecordAction({
        department_id: Number(deptId),
        officer_name: officerName,
        officer_id: officerId,
        action_type: actionType,
        action_description: description,
        status_after: statusAfter,
        evidence_url: evidenceUrl || undefined
      });
      onClose();
    } catch (err) {
      alert("Failed to record action");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-lg shadow-xl border border-[#CBD5E1] w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-govteal" />
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Record Official Municipal Action</h3>
              <p className="text-[11px] text-slate-500">Creates verifiable activity timeline entry & recurrence checkpoint</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Officer Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={officerName}
                onChange={(e) => setOfficerName(e.target.value)}
                className="w-full text-xs p-2 bg-white border border-[#CBD5E1] rounded"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Officer / Employee ID <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={officerId}
                onChange={(e) => setOfficerId(e.target.value)}
                className="w-full text-xs p-2 bg-white border border-[#CBD5E1] rounded"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Executing Department <span className="text-rose-500">*</span>
              </label>
              <select
                value={deptId}
                onChange={(e) => setDeptId(Number(e.target.value))}
                className="w-full text-xs p-2 bg-white border border-[#CBD5E1] rounded"
                required
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Action Type <span className="text-rose-500">*</span>
              </label>
              <select
                value={actionType}
                onChange={(e) => setActionType(e.target.value)}
                className="w-full text-xs p-2 bg-white border border-[#CBD5E1] rounded"
              >
                <option value="Field Inspection & Assessment">Field Inspection & Assessment</option>
                <option value="Physical Repair Deployed">Physical Repair Deployed</option>
                <option value="Valve & Flow Calibration">Valve & Flow Calibration</option>
                <option value="Debris & Waste Clearance">Debris & Waste Clearance</option>
                <option value="Drain Silt Flushing">Drain Silt Flushing</option>
                <option value="Equipment Replacement">Equipment Replacement</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Action Description / Work Log <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Water supply valve inspection completed. Sub-station pressure adjusted to 2.4 bar and verified."
              className="w-full text-xs p-2.5 bg-white border border-[#CBD5E1] rounded focus:ring-1 focus:ring-govblue focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Resulting Status <span className="text-rose-500">*</span>
              </label>
              <select
                value={statusAfter}
                onChange={(e) => setStatusAfter(e.target.value)}
                className="w-full text-xs p-2 bg-white border border-[#CBD5E1] rounded"
              >
                <option value="Action Taken">Action Taken</option>
                <option value="Under Review">Under Review</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Evidence Photo / Document URL
              </label>
              <div className="relative">
                <Camera className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={evidenceUrl}
                  onChange={(e) => setEvidenceUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full text-xs pl-8 pr-2 py-2 bg-white border border-[#CBD5E1] rounded"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#F1F5F9]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded border border-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-govteal hover:bg-govteal-hover rounded transition-colors shadow-xs"
            >
              {loading ? 'Recording...' : 'Save Official Action'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

