import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, RotateCcw, FileText, ArrowRight, Building2, MapPin } from 'lucide-react';
import { api } from '../../services/api';
import { ComplaintListItem, Department, Ward } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { LanguageBadge } from '../../components/LanguageBadge';

export const ComplaintsListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [complaints, setComplaints] = useState<ComplaintListItem[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedLang, setSelectedLang] = useState(searchParams.get('language') || '');
  const [selectedCat, setSelectedCat] = useState(searchParams.get('category') || '');
  const [selectedDept, setSelectedDept] = useState(searchParams.get('department_id') || '');
  const [selectedWard, setSelectedWard] = useState(searchParams.get('ward_id') || '');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || '');

  const loadData = async () => {
    try {
      setLoading(true);
      const [list, depts, wardList] = await Promise.all([
        api.getComplaints({
          search: search || undefined,
          language: selectedLang || undefined,
          category: selectedCat || undefined,
          department_id: selectedDept ? Number(selectedDept) : undefined,
          ward_id: selectedWard ? Number(selectedWard) : undefined,
          status: selectedStatus || undefined
        }),
        api.getDepartments(),
        api.getWards()
      ]);
      setComplaints(list);
      setDepartments(depts);
      setWards(wardList);
    } catch (err) {
      console.error("Failed to load complaints table", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedLang, selectedCat, selectedDept, selectedWard, selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedLang('');
    setSelectedCat('');
    setSelectedDept('');
    setSelectedWard('');
    setSelectedStatus('');
    setSearchParams({});
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Municipal Grievance Register
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Full repository of multilingual citizen complaints with verified routing status.
          </p>
        </div>
        <div className="text-xs font-semibold text-slate-500 bg-white px-3 py-1.5 rounded border border-slate-200 shadow-2xs">
          Total Filtered Records: <strong className="text-govblue">{complaints.length}</strong>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-lg border border-[#CBD5E1] shadow-gov space-y-3">
        {/* Search row */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Complaint ID (e.g. JS-2026-0001) or description..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-[#F8FAFC] border border-[#CBD5E1] rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-govblue"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-[#315B8A] hover:bg-[#25476D] text-white text-xs font-semibold rounded shrink-0 shadow-2xs"
          >
            Apply Search
          </button>
          <button
            type="button"
            onClick={handleClearFilters}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded border border-slate-300 flex items-center gap-1.5 shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Filters</span>
          </button>
        </form>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2 border-t border-slate-100 text-xs">
          {/* Language */}
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="p-1.5 bg-white border border-[#CBD5E1] rounded text-slate-700 font-medium"
          >
            <option value="">Language: All</option>
            <option value="en">English (EN)</option>
            <option value="kn">ಕನ್ನಡ (KN)</option>
            <option value="hi">हिन्दी (HI)</option>
          </select>

          {/* Category */}
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="p-1.5 bg-white border border-[#CBD5E1] rounded text-slate-700 font-medium"
          >
            <option value="">Category: All</option>
            <option value="Water Supply">Water Supply</option>
            <option value="Roads">Roads & Footpaths</option>
            <option value="Electricity">Electricity</option>
            <option value="Waste Management">Waste Management</option>
            <option value="Drainage">Drainage</option>
            <option value="Public Safety">Public Safety</option>
          </select>

          {/* Department */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="p-1.5 bg-white border border-[#CBD5E1] rounded text-slate-700 font-medium truncate"
          >
            <option value="">Department: All</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name.split(' ')[0]} ({d.code})
              </option>
            ))}
          </select>

          {/* Ward */}
          <select
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            className="p-1.5 bg-white border border-[#CBD5E1] rounded text-slate-700 font-medium"
          >
            <option value="">Ward: All</option>
            {wards.map((w) => (
              <option key={w.id} value={w.id}>
                Ward {w.ward_number}: {w.name}
              </option>
            ))}
          </select>

          {/* Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="p-1.5 bg-white border border-[#CBD5E1] rounded text-slate-700 font-medium"
          >
            <option value="">Status: All</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Assigned">Assigned</option>
            <option value="Action Taken">Action Taken</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-gov overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-slate-700 border-b border-[#E2E8F0]">
              <tr>
                <th className="py-3 px-3.5 font-bold">Complaint ID</th>
                <th className="py-3 px-3.5 font-bold">Title</th>
                <th className="py-3 px-3.5 font-bold">Language</th>
                <th className="py-3 px-3.5 font-bold">Category</th>
                <th className="py-3 px-3.5 font-bold">Locality / Ward</th>
                <th className="py-3 px-3.5 font-bold">Department</th>
                <th className="py-3 px-3.5 font-bold">Date</th>
                <th className="py-3 px-3.5 font-bold">Status</th>
                <th className="py-3 px-3.5 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    Loading complaints...
                  </td>
                </tr>
              ) : complaints.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No complaints matching the selected filters.
                  </td>
                </tr>
              ) : (
                complaints.map((c) => (
                  <tr key={c.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3 px-3.5 font-mono font-bold text-govblue whitespace-nowrap">
                      <Link to={`/officer/complaints/${c.id}`} className="hover:underline">
                        {c.complaint_code}
                      </Link>
                    </td>
                    <td className="py-3 px-3.5 font-semibold text-slate-800 max-w-xs truncate" title={c.title}>
                      {c.title}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <LanguageBadge language={c.original_language} size="sm" />
                    </td>
                    <td className="py-3 px-3.5 font-medium text-slate-700 whitespace-nowrap">
                      {c.category}
                    </td>
                    <td className="py-3 px-3.5 text-slate-600 max-w-[150px] truncate" title={c.locality}>
                      <span>{c.locality}</span>
                      {c.ward_number && (
                        <span className="text-[10px] text-slate-400 block font-mono">
                          Ward {c.ward_number}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3.5 text-slate-700 max-w-[150px] truncate">
                      {c.assigned_department_name || c.recommended_department_name || 'Unassigned'}
                    </td>
                    <td className="py-3 px-3.5 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                      {new Date(c.created_at).toLocaleDateString('en-GB')}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <StatusBadge status={c.status} size="sm" />
                    </td>
                    <td className="py-3 px-3.5 text-right whitespace-nowrap">
                      <Link
                        to={`/officer/complaints/${c.id}`}
                        className="font-bold text-govblue hover:text-govblue-hover hover:underline"
                      >
                        Inspect →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

