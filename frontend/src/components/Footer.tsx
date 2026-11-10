import React from 'react';
import { CivicEmblem } from './CivicEmblem';
import { Shield, Info, HeartHandshake, PhoneCall } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#FFFFFF] border-t border-[#E2E8F0] text-[#64748B] text-xs pt-8 pb-6 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-[#F1F5F9]">
          {/* Col 1 */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <CivicEmblem size={32} />
              <span className="text-base font-bold text-[#315B8A]">
                JAN SETU — SAMADHAN-GRAPH
              </span>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed max-w-md">
              A multilingual civic intelligence and grievance redressal platform connecting citizens,
              incidents, and municipal authorities through semantic NLP and the Civic Responsibility Graph.
            </p>
            <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Supported Regional Languages: English • हिन्दी (Hindi) • ಕನ್ನಡ (Kannada)</span>
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-800 uppercase tracking-wider text-[11px]">
              Civic Services
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li>• Water Supply & Sewerage</li>
              <li>• Road Infrastructure & Potholes</li>
              <li>• Solid Waste Management</li>
              <li>• Stormwater Drainage Maintenance</li>
              <li>• Street Lighting & Electricity</li>
              <li>• Public Pedestrian Safety</li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-800 uppercase tracking-wider text-[11px]">
              Citizen Assurance
            </h4>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-[#F8FAFC] rounded border border-[#E2E8F0] space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                  <Shield className="w-3.5 h-3.5 text-govblue" />
                  <span>Data Protection</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Citizen grievance submission is 100% free. Personal information is protected and never monetized.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Disclaimer & Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <span className="bg-[#FFF4D6] text-[#945B03] px-2 py-0.5 rounded border border-[#FFE299] font-medium text-[10px]">
              DEMO DATASET ACTIVE
            </span>
            <span>All synthetic complaint records are strictly for demonstration and hackathon evaluation.</span>
          </div>
          <div>
            © 2026 Jan Setu Civic Redressal Initiative. Designed for Municipal Corporations & Urban Local Bodies.
          </div>
        </div>
      </div>
    </footer>
  );
};

