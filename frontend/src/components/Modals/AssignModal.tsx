import React, { useState } from 'react';
import { Department } from '../../types';
import { Building2, X } from 'lucide-react';

interface AssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  departments: Department[];
  currentDeptId?: number;
  onAssign: (deptId: number, notes: string) => Promise<void>;
}

export const AssignModal: React.FC<AssignModalProps> = ({
  isOpen,
  onClose,
  departments,
  currentDeptId,
  onAssign
}) => {
  const [selectedDeptId, setSelectedDeptId] = useState<number>(currentDeptId || (departments[0]?.id || 1));
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await onAssign(Number(selectedDeptId), notes);
      onClose();
    } catch (err) {
      alert("Error assigning department");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-lg shadow-xl border border-[#CBD5E1] w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-govblue" />
            <h3 className="font-bold text-slate-800 text-sm">Assign / Reassign Department</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Responsible Municipal Department <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(Number(e.target.value))}
              className="w-full text-xs p-2.5 bg-white border border-[#CBD5E1] rounded focus:ring-1 focus:ring-govblue focus:outline-none"
              required
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code}) — SLA: {d.sla_hours}h
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Officer Correction / Reassignment Note
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="State operational reason for jurisdiction assignment or override..."
              className="w-full text-xs p-2.5 bg-white border border-[#CBD5E1] rounded focus:ring-1 focus:ring-govblue focus:outline-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#F1F5F9]">
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
              className="px-4 py-1.5 text-xs font-semibold text-white bg-govblue hover:bg-govblue-hover rounded transition-colors"
            >
              {loading ? 'Saving...' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

