import React, { useState, useEffect } from 'react';
import {
  Settings,
  Building2,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  Cpu,
  Layers,
  Database,
  Info
} from 'lucide-react';
import { api } from '../../services/api';
import { Department, Ward } from '../../types';

export const AdminPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    api.getDepartments().then(setDepartments).catch(console.error);
    api.getWards().then(setWards).catch(console.error);
    api.getRules().then(setRules).catch(console.error);
  }, []);

  const handleResetData = async () => {
    if (window.confirm("Confirm: Reset entire database to standard 23 synthetic multilingual complaints, incidents, actions, and recurrence alerts?")) {
      try {
        setIsResetting(true);
        await api.resetDemoData();
        setResetSuccess(true);
        setTimeout(() => {
          setResetSuccess(false);
          window.location.reload();
        }, 1200);
      } catch (err) {
        alert("Failed to reset demo dataset");
      } finally {
        setIsResetting(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-govblue" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Municipal Administration & Jurisdiction Mappings
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure municipal departments, SLA thresholds, routing charters, and demo simulation datasets.
          </p>
        </div>

        {/* Reset Demo Button */}
        <button
          onClick={handleResetData}
          disabled={isResetting}
          className="flex items-center gap-2 px-4 py-2 bg-govblue hover:bg-govblue-hover text-white text-xs font-bold rounded shadow-2xs transition-colors"
        >
          {resetSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Dataset Reset Complete!</span>
            </>
          ) : (
            <>
              <RotateCcw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
              <span>Reset Demo Civic Dataset</span>
            </>
          )}
        </button>
      </div>

      {/* System Engine Status */}
      <div className="bg-white rounded-lg border border-[#CBD5E1] shadow-gov p-5 space-y-4">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Cpu className="w-4 h-4 text-govblue" />
          <span>Active Technology Stack & Processing Pipeline</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-[#F8FAFC] rounded border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase block font-semibold">AI NLP Engine</span>
            <span className="font-bold text-slate-800">Multilingual Embedding Engine</span>
            <span className="text-[10px] text-emerald-700 block mt-1">Cosine Similarity (0.75 threshold)</span>
          </div>

          <div className="p-3 bg-[#F8FAFC] rounded border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase block font-semibold">Graph Topography</span>
            <span className="font-bold text-slate-800">NetworkX DiGraph</span>
            <span className="text-[10px] text-govblue block mt-1">Connected Civic Intelligence</span>
          </div>

          <div className="p-3 bg-[#F8FAFC] rounded border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase block font-semibold">Database Engine</span>
            <span className="font-bold text-slate-800">PostgreSQL / SQLite</span>
            <span className="text-[10px] text-govteal block mt-1">SQLAlchemy ORM + PostGIS</span>
          </div>

          <div className="p-3 bg-[#F8FAFC] rounded border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase block font-semibold">Frontend Visuals</span>
            <span className="font-bold text-slate-800">React + Leaflet + Flow</span>
            <span className="text-[10px] text-slate-600 block mt-1">Light Government Civic UI</span>
          </div>
        </div>
      </div>

      {/* Configured Departments Table */}
      <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-gov p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-govblue" />
              <span>Configured Municipal Departments & SLAs</span>
            </h3>
            <p className="text-[11px] text-slate-500">Authorized agencies in civic jurisdiction registry</p>
          </div>
          <span className="text-[11px] font-semibold text-slate-600 font-mono">
            {departments.length} Agencies
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-slate-700 border-b border-[#E2E8F0]">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Agency Name</th>
                <th className="py-2.5 px-3 font-semibold">Code</th>
                <th className="py-2.5 px-3 font-semibold">Head Officer</th>
                <th className="py-2.5 px-3 font-semibold">Contact Email</th>
                <th className="py-2.5 px-3 font-semibold">SLA Window</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {departments.map((d) => (
                <tr key={d.id} className="hover:bg-[#F8FAFC]">
                  <td className="py-2.5 px-3 font-bold text-slate-800">{d.name}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-govblue">{d.code}</td>
                  <td className="py-2.5 px-3 text-slate-700">{d.head_officer || 'Municipal Commissioner'}</td>
                  <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">{d.contact_email}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {d.sla_hours} Hours
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Jurisdiction Rules Table */}
      <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-gov p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-govteal" />
              <span>Verified Category Jurisdiction Routing Rules</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Rules evaluated strictly before AI recommendation output
            </p>
          </div>
          <span className="text-[11px] font-semibold text-slate-600 font-mono">
            {rules.length} Rules Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-slate-700 border-b border-[#E2E8F0]">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Grievance Category</th>
                <th className="py-2.5 px-3 font-semibold">Primary Department</th>
                <th className="py-2.5 px-3 font-semibold">Supporting Department</th>
                <th className="py-2.5 px-3 font-semibold">Rule Rationale</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {rules.map((r) => {
                const prim = departments.find((d) => d.id === r.primary_department_id);
                const supp = departments.find((d) => d.id === r.supporting_department_id);
                return (
                  <tr key={r.id} className="hover:bg-[#F8FAFC]">
                    <td className="py-2.5 px-3 font-bold text-slate-800">{r.category}</td>
                    <td className="py-2.5 px-3 font-semibold text-govblue">{prim?.name || `Dept #${r.primary_department_id}`}</td>
                    <td className="py-2.5 px-3 text-slate-600">{supp ? supp.name : '—'}</td>
                    <td className="py-2.5 px-3 text-slate-600 italic">{r.rule_description}</td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Active Charter
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

