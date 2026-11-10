import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CivicEmblem } from './CivicEmblem';
import { ShieldCheck, PhoneCall, PlusCircle, Search, HelpCircle } from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path
      ? 'text-govblue font-semibold border-b-2 border-govblue'
      : 'text-slate-600 hover:text-govblue font-medium';
  };

  return (
    <header className="w-full bg-white border-b border-[#E2E8F0] sticky top-0 z-50 shadow-sm">
      {/* Top Official Civic Strip */}
      <div className="bg-[#315B8A] text-white text-xs py-1 px-4 sm:px-8 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <span className="font-semibold tracking-wider uppercase text-[11px]">
            Municipal Corporation Civic Intelligence Gateway
          </span>
          <span className="hidden md:inline text-blue-200">|</span>
          <span className="hidden md:inline text-blue-100 text-[11px]">
            Official Public Grievance Redressal System
          </span>
        </div>
        <div className="flex items-center space-x-4 text-[11px]">
          <div className="flex items-center gap-1.5 text-blue-100">
            <PhoneCall className="w-3 h-3 text-emerald-300" />
            <span>Toll-Free Helpline: <strong className="text-white">1916</strong></span>
          </div>
          <span className="text-blue-300">|</span>
          <span className="hidden sm:inline bg-[#25476D] px-2 py-0.5 rounded text-[10px] text-blue-100 font-mono">
            EN / हिन्दी / ಕನ್ನಡ
          </span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Portal Branding */}
        <Link to="/" className="flex items-center gap-3 group">
          <CivicEmblem size={42} />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-[#315B8A] tracking-tight group-hover:text-govblue-hover transition-colors">
                JAN SETU
              </span>
              <span className="bg-[#EAF2FA] text-[#315B8A] text-[10px] font-bold px-1.5 py-0.5 rounded border border-[#C2DBF2]">
                SAMADHAN-GRAPH
              </span>
            </div>
            <p className="text-[11px] text-[#64748B] font-medium leading-none mt-0.5">
              From Citizen Complaints to Connected Civic Intelligence
            </p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-6 text-sm">
          <Link to="/" className={`pb-1 transition-colors ${isActive('/')}`}>
            Home
          </Link>
          <Link to="/submit" className={`pb-1 flex items-center gap-1.5 transition-colors ${isActive('/submit')}`}>
            <PlusCircle className="w-4 h-4 text-govteal" />
            <span>Submit Complaint</span>
          </Link>
          <Link to="/track" className={`pb-1 flex items-center gap-1.5 transition-colors ${isActive('/track')}`}>
            <Search className="w-4 h-4 text-slate-500" />
            <span>Track Status</span>
          </Link>
          <Link
            to="/officer"
            className="flex items-center gap-1.5 bg-[#EAF2FA] hover:bg-[#D7E8F7] text-[#315B8A] font-semibold text-xs px-3.5 py-2 rounded-md border border-[#B9D7F2] transition-all shadow-sm"
          >
            <ShieldCheck className="w-4 h-4 text-govblue" />
            <span>Officer Portal</span>
          </Link>
        </nav>
      </div>
    </header>
  );
};

