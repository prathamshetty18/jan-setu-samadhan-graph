import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, RotateCcw, CheckCircle2, User } from 'lucide-react';
import { api } from '../services/api';

interface OfficerHeaderProps {
  onSearch?: (query: string) => void;
  recurrenceCount?: number;
}

export const OfficerHeader: React.FC<OfficerHeaderProps> = ({ onSearch, recurrenceCount = 0 }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm);
    } else {
      navigate(`/officer/complaints?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleResetData = async () => {
    if (window.confirm("Reset demonstration data to standard 23 synthetic multilingual complaints?")) {
      try {
        setIsResetting(true);
        await api.resetDemoData();
        setResetSuccess(true);
        setTimeout(() => {
          setResetSuccess(false);
          window.location.reload();
        }, 1200);
      } catch (err) {
        alert("Failed to reset data");
      } finally {
        setIsResetting(false);
      }
    }
  };

  return (
    <header className="h-16 bg-white border-b border-[#E2E8F0] px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="relative w-80 max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by ID (JS-2026-...) or issue keyword..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-1.5 text-xs bg-[#F8FAFC] border border-[#CBD5E1] rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-govblue focus:border-govblue"
        />
      </form>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Reset Demo Data Button */}
        <button
          onClick={handleResetData}
          disabled={isResetting}
          title="Reset database with 23 synthetic multilingual complaints"
          className="flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-[#F1F5F9] hover:bg-[#E2E8F0] px-3 py-1.5 rounded border border-[#CBD5E1] transition-colors"
        >
          {resetSuccess ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700 font-semibold">Demo Data Reset!</span>
            </>
          ) : (
            <>
              <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : 'text-slate-500'}`} />
              <span>Reset Demo Data</span>
            </>
          )}
        </button>

        {/* Recurrence Notification Icon */}
        <button
          onClick={() => navigate('/officer/recurrence')}
          className="relative p-2 text-slate-500 hover:text-govblue rounded-full hover:bg-slate-100 transition-colors"
          title="Recurrence Review Queue"
        >
          <Bell className="w-4 h-4" />
          {recurrenceCount > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse border-2 border-white" />
          )}
        </button>

        <div className="h-6 w-px bg-slate-200" />

        {/* Officer Profile Badge */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#EAF2FA] text-govblue border border-[#C2DBF2] flex items-center justify-center font-bold text-xs">
            ER
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-bold text-slate-800 leading-tight">Er. S. Meenakshi</p>
            <p className="text-[10px] text-slate-500">Superintending Engineer (Zone 2)</p>
          </div>
        </div>
      </div>
    </header>
  );
};

