import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Network,
  Building2,
  TrendingUp,
  MapPin,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { api } from '../../services/api';
import {
  DashboardSummary,
  CategoryAnalytics,
  WardAnalytics,
  ComplaintListItem,
  RecurrenceAlert
} from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { LanguageBadge } from '../../components/LanguageBadge';

export const OfficerOverview: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [categoryData, setCategoryData] = useState<CategoryAnalytics[]>([]);
  const [wardData, setWardData] = useState<WardAnalytics[]>([]);
  const [recentComplaints, setRecentComplaints] = useState<ComplaintListItem[]>([]);
  const [recurrenceAlerts, setRecurrenceAlerts] = useState<RecurrenceAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [sum, cats, wards, comps, alerts] = await Promise.all([
          api.getDashboardSummary(),
          api.getCategoryAnalytics(),
          api.getWardAnalytics(),
          api.getComplaints(),
          api.getRecurrenceAlerts()
        ]);
        setSummary(sum);
        setCategoryData(cats);
        setWardData(wards);
        setRecentComplaints(comps.slice(0, 8));
        setRecurrenceAlerts(alerts);
      } catch (err) {
        console.error("Failed to load officer dashboard summary", err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const COLORS = ['#315B8A', '#328477', '#D97706', '#0284C7', '#4F46E5', '#E11D48'];

  return (
    <div className="space-y-6">
      
      {/* Overview Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Municipal Civic Intelligence Overview
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time status of cross-lingual grievances, active incident clusters, and recurrence signals.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/officer/graph"
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-[#EAF2FA] text-govblue rounded border border-[#C2DBF2] hover:bg-[#D7E8F7] transition-colors"
          >
            <Network className="w-3.5 h-3.5" />
            <span>Open Civic Graph</span>
          </Link>
          <Link
            to="/officer/complaints"
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-govblue text-white rounded hover:bg-govblue-hover transition-colors shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>View All Complaints</span>
          </Link>
        </div>
      </div>

      {/* Recurrence Alert Banner (High Visibility for Recurrence Monitoring) */}
      {recurrenceAlerts && recurrenceAlerts.length > 0 && (
        <div className="p-4 bg-[#FFF4D6] border-l-4 border-amber-600 rounded-r-lg shadow-gov text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              <span className="font-bold text-amber-900 text-sm">
                Recurrence Alerts Detected ({recurrenceAlerts.length})
              </span>
            </div>
            <Link
              to="/officer/recurrence"
              className="text-xs font-bold text-amber-900 hover:underline flex items-center gap-1"
            >
              <span>Review Alert Queue</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <p className="text-amber-800 leading-relaxed">
            {recurrenceAlerts[0].alert_message}
          </p>
          <p className="text-[11px] text-amber-700/80 italic">
            * Recurrence is an operational signal for investigation, not proof of negligence or failed resolution.
          </p>
        </div>
      )}

      {/* KPI Cards (Values strictly from DB) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {[
          { label: 'Total Complaints', value: summary?.total_complaints ?? 0, icon: FileText, color: 'text-slate-800' },
          { label: 'Pending Action', value: summary?.pending_complaints ?? 0, icon: Clock, color: 'text-amber-700' },
          { label: 'Under Review', value: summary?.under_review ?? 0, icon: TrendingUp, color: 'text-govblue' },
          { label: 'Resolved Complaints', value: summary?.resolved_complaints ?? 0, icon: CheckCircle2, color: 'text-emerald-700' },
          { label: 'Incident Clusters', value: summary?.related_complaint_groups ?? 0, icon: Network, color: 'text-govteal' },
          { label: 'Recurrence Alerts', value: summary?.recurrence_alerts ?? 0, icon: AlertTriangle, color: 'text-rose-700' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white p-4 rounded-lg border border-[#E2E8F0] shadow-gov text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{kpi.label}</span>
              <kpi.icon className={`w-3.5 h-3.5 ${kpi.color}`} />
            </div>
            <p className={`text-2xl font-black ${kpi.color} font-mono tracking-tight`}>
              {loading ? '...' : kpi.value}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">From live records</p>
          </div>
        ))}
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Category Distribution Bar Chart */}
        <div className="lg:col-span-7 bg-white p-5 rounded-lg border border-[#E2E8F0] shadow-gov space-y-4">
          <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Complaints by Civic Category
              </h3>
              <p className="text-[11px] text-slate-500">Total volume vs. resolved resolution rate</p>
            </div>
            <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
              City-Wide
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="category" tick={{ fontSize: 10, fill: '#64748B' }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', fontSize: '12px' }}
                />
                <Bar dataKey="count" name="Total Complaints" fill="#315B8A" radius={[3, 3, 0, 0]} />
                <Bar dataKey="resolved_count" name="Resolved" fill="#328477" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ward Density Distribution */}
        <div className="lg:col-span-5 bg-white p-5 rounded-lg border border-[#E2E8F0] shadow-gov space-y-4">
          <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Grievance Density by Ward
              </h3>
              <p className="text-[11px] text-slate-500">Distribution across municipal zones</p>
            </div>
            <MapPin className="w-4 h-4 text-slate-400" />
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={wardData}
                  dataKey="count"
                  nameKey="ward_name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={45}
                  paddingAngle={3}
                >
                  {wardData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', fontSize: '11px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Recent Complaints Table */}
      <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-gov p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Recent Multilingual Grievances
            </h3>
            <p className="text-[11px] text-slate-500">Incoming text and voice records awaiting officer review</p>
          </div>
          <Link
            to="/officer/complaints"
            className="text-xs font-bold text-govblue hover:underline flex items-center gap-1"
          >
            <span>View All ({summary?.total_complaints || 0})</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-slate-600 border-b border-[#E2E8F0]">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Grievance Code</th>
                <th className="py-2.5 px-3 font-semibold">Title</th>
                <th className="py-2.5 px-3 font-semibold">Lang</th>
                <th className="py-2.5 px-3 font-semibold">Category</th>
                <th className="py-2.5 px-3 font-semibold">Locality / Ward</th>
                <th className="py-2.5 px-3 font-semibold">Assigned Dept</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
                <th className="py-2.5 px-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {recentComplaints.map((c) => (
                <tr key={c.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-govblue">
                    <Link to={`/officer/complaints/${c.id}`} className="hover:underline">
                      {c.complaint_code}
                    </Link>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-800 max-w-xs truncate" title={c.title}>
                    {c.title}
                  </td>
                  <td className="py-2.5 px-3">
                    <LanguageBadge language={c.original_language} size="sm" />
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-700">
                    {c.category}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 truncate max-w-[140px]" title={c.locality}>
                    {c.locality}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 truncate max-w-[140px]">
                    {c.assigned_department_name || c.recommended_department_name || 'Routing...'}
                  </td>
                  <td className="py-2.5 px-3">
                    <StatusBadge status={c.status} size="sm" />
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <Link
                      to={`/officer/complaints/${c.id}`}
                      className="text-xs font-semibold text-govblue hover:text-govblue-hover hover:underline"
                    >
                      Inspect →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

