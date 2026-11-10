import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Network,
  MapPin,
  AlertTriangle,
  Settings,
  ArrowLeft,
  ShieldCheck
} from 'lucide-react';
import { CivicEmblem } from './CivicEmblem';

interface OfficerSidebarProps {
  recurrenceCount?: number;
}

export const OfficerSidebar: React.FC<OfficerSidebarProps> = ({ recurrenceCount = 0 }) => {
  const navItems = [
    { name: 'Overview', to: '/officer', icon: LayoutDashboard, exact: true },
    { name: 'Complaints', to: '/officer/complaints', icon: FileText },
    { name: 'Responsibility Graph', to: '/officer/graph', icon: Network },
    { name: 'Geospatial Map', to: '/officer/map', icon: MapPin },
    {
      name: 'Recurrence Monitoring',
      to: '/officer/recurrence',
      icon: AlertTriangle,
      badge: recurrenceCount > 0 ? recurrenceCount : undefined,
      badgeColor: 'bg-[#FFF4D6] text-[#945B03] border border-[#FFE299]'
    },
    { name: 'Administration & Rules', to: '/officer/admin', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-[#E2E8F0] min-h-screen flex flex-col justify-between shrink-0">
      <div>
        {/* Officer Branding Header */}
        <div className="p-5 border-b border-[#E2E8F0] flex items-center gap-3">
          <CivicEmblem size={34} />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[#315B8A] text-sm tracking-tight">JAN SETU</span>
              <span className="text-[10px] font-semibold bg-[#EAF2FA] text-[#315B8A] px-1 rounded">
                OFFICER
              </span>
            </div>
            <p className="text-[11px] text-[#64748B]">Municipal Authority Console</p>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-[#EAF2FA] text-[#315B8A] font-semibold border-l-4 border-govblue'
                    : 'text-slate-600 hover:bg-[#F8FAFC] hover:text-[#315B8A]'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <item.icon className="w-4 h-4 text-slate-500" />
                <span>{item.name}</span>
              </div>
              {item.badge !== undefined && (
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom return to Citizen Portal */}
      <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC]">
        <div className="flex items-center gap-2 mb-3 px-1">
          <ShieldCheck className="w-4 h-4 text-govteal" />
          <div className="text-[11px]">
            <p className="font-semibold text-slate-800">Auth: Officer Console</p>
            <p className="text-slate-500 text-[10px]">Ward Jurisdiction Access</p>
          </div>
        </div>
        <NavLink
          to="/"
          className="flex items-center justify-center gap-1.5 w-full py-2 px-3 text-xs font-medium text-slate-700 bg-white border border-[#CBD5E1] rounded hover:bg-slate-50 transition-colors shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit to Public Portal</span>
        </NavLink>
      </div>
    </aside>
  );
};

