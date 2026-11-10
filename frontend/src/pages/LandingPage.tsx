import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Search,
  Languages,
  Network,
  ShieldCheck,
  ArrowRight,
  Droplets,
  Road,
  Zap,
  Trash2,
  Waves,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import { CivicEmblem } from '../components/CivicEmblem';

export const LandingPage: React.FC = () => {
  const [selectedDemoLang, setSelectedDemoLang] = useState<'en' | 'kn' | 'hi'>('en');

  const demoPhrases = {
    en: {
      lang: 'English',
      sample: 'There is no proper water supply in our locality since yesterday.',
      badge: 'Water Supply Issue',
      matchText: 'Connected to Incident INC-2026-0001 via Semantic Embedding'
    },
    kn: {
      lang: 'ಕನ್ನಡ (Kannada)',
      sample: 'ನಮ್ಮ ಪ್ರದೇಶದಲ್ಲಿ ನೀರು ಸರಿಯಾಗಿ ಬರುತ್ತಿಲ್ಲ, ದಯವಿಟ್ಟು ಗಮನಿಸಿ.',
      badge: 'ನೀರು ಸರಬರಾಜು ಸಮಸ್ಯೆ',
      matchText: 'Cross-Lingual Semantic Match with 89% Cosine Similarity'
    },
    hi: {
      lang: 'हिन्दी (Hindi)',
      sample: 'हमारे इलाके में पानी की सप्लाई नहीं हो रही है, बहुत परेशानी है।',
      badge: 'पानी की आपूर्ति समस्या',
      matchText: 'Cross-Lingual Semantic Match with 91% Cosine Similarity'
    }
  };

  const services = [
    { name: 'Water Supply & Sewerage', icon: Droplets, dept: 'Water Department (BWSSB)', sla: '24 hrs', color: 'text-blue-600 bg-blue-50' },
    { name: 'Roads & Infrastructure', icon: Road, dept: 'Public Works Department (PWD)', sla: '48 hrs', color: 'text-amber-600 bg-amber-50' },
    { name: 'Electricity & Street Lights', icon: Zap, dept: 'Electricity Supply (BESCOM)', sla: '12 hrs', color: 'text-yellow-600 bg-yellow-50' },
    { name: 'Solid Waste Management', icon: Trash2, dept: 'Sanitation & SWM Board', sla: '24 hrs', color: 'text-emerald-600 bg-emerald-50' },
    { name: 'Stormwater Drainage', icon: Waves, dept: 'Drainage & Flood Management', sla: '36 hrs', color: 'text-cyan-600 bg-cyan-50' },
    { name: 'Public Safety & Vigilance', icon: ShieldAlert, dept: 'City Safety & Vigilance', sla: '24 hrs', color: 'text-rose-600 bg-rose-50' },
  ];

  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      {/* Hero Section */}
      <section className="bg-white border-b border-[#E2E8F0] py-14 sm:py-20 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 bg-[#EAF2FA] text-[#315B8A] px-3 py-1 rounded-full text-xs font-semibold border border-[#C2DBF2]">
                <CivicEmblem size={16} />
                <span>Next-Gen Municipal Public Grievance Intelligence</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold text-[#263445] tracking-tight leading-tight">
                Your Voice. Your City. <br />
                <span className="text-[#315B8A]">Your Solution.</span>
              </h1>

              <p className="text-base sm:text-lg text-[#64748B] leading-relaxed max-w-xl">
                Report civic issues in your preferred language—English, हिन्दी or ಕನ್ನಡ.
                Our Civic Responsibility Graph connects related complaints, eliminates duplicate work,
                and flags recurring problems for accountable municipal action.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/submit"
                  className="flex items-center gap-2 bg-[#315B8A] hover:bg-[#25476D] text-white font-semibold text-sm px-6 py-3 rounded-md transition-all shadow-sm hover:shadow"
                >
                  <FileText className="w-4 h-4" />
                  <span>Submit a Complaint</span>
                </Link>

                <Link
                  to="/track"
                  className="flex items-center gap-2 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#334155] font-semibold text-sm px-5 py-3 rounded-md border border-[#CBD5E1] transition-all"
                >
                  <Search className="w-4 h-4 text-slate-500" />
                  <span>Track Your Complaint</span>
                </Link>

                <Link
                  to="/officer"
                  className="flex items-center gap-2 bg-white hover:bg-slate-50 text-[#315B8A] font-semibold text-sm px-5 py-3 rounded-md border border-[#315B8A]/30 transition-all"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Officer Portal</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-[#64748B]">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Verified Jurisdiction Routing</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Languages className="w-4 h-4 text-govblue" />
                  <span>Cross-Lingual AI Fusion</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Recurrence Tracking</span>
                </div>
              </div>
            </div>

            {/* Interactive Hero Preview Card */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-xl border-2 border-[#CBD5E1] shadow-gov-md p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-govblue" />
                    <span className="text-xs font-bold text-slate-800">Cross-Lingual Civic Fusion</span>
                  </div>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-mono font-semibold">
                    LIVE PREVIEW
                  </span>
                </div>

                <p className="text-xs text-slate-600">
                  Citizens submit reports in different regional scripts. Samadhan-Graph connects them to the same incident:
                </p>

                {/* Language Switcher Tabs */}
                <div className="flex items-center gap-1.5 bg-[#F8FAFC] p-1 rounded-md border border-[#E2E8F0]">
                  {(['en', 'kn', 'hi'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setSelectedDemoLang(lang)}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded transition-colors ${
                        selectedDemoLang === lang
                          ? 'bg-white text-govblue shadow-xs border border-[#CBD5E1]'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {demoPhrases[lang].lang}
                    </button>
                  ))}
                </div>

                {/* Live Card */}
                <div className="p-4 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-2.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-[#315B8A]">{demoPhrases[selectedDemoLang].badge}</span>
                    <span className="text-slate-500 font-mono">JS-2026-DEMO</span>
                  </div>
                  <p className="text-xs font-medium text-slate-800 bg-white p-2.5 rounded border border-slate-200">
                    "{demoPhrases[selectedDemoLang].sample}"
                  </p>
                  <div className="flex items-center gap-1.5 text-[11px] text-govteal font-medium bg-[#DDF3EF] px-2.5 py-1.5 rounded">
                    <Network className="w-3.5 h-3.5 shrink-0" />
                    <span>{demoPhrases[selectedDemoLang].matchText}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Routing: <strong>Water Department</strong></span>
                  <span className="text-emerald-700 font-semibold">Verified Rule Engine</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 sm:px-8 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase text-govblue tracking-wider bg-[#EAF2FA] px-3 py-1 rounded-full">
            Transparent Municipal Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-3">
            How Samadhan-Graph Resolves Grievances
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Transforming isolated citizen voice and text complaints into connected civic intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Multilingual Submission',
              desc: 'Citizens submit text or voice grievances in Kannada, Hindi, or English with GPS location and photo evidence.'
            },
            {
              step: '02',
              title: 'Semantic Incident Fusion',
              desc: 'Cross-lingual multilingual embeddings identify semantically identical reports without merging separate citizen records.'
            },
            {
              step: '03',
              title: 'Responsibility Graph',
              desc: 'Rule-based jurisdiction maps link complaints to responsible departments, municipal wards, and historical actions.'
            },
            {
              step: '04',
              title: 'Recurrence Monitoring',
              desc: 'If a similar issue resurfaces after previous inspection, automated review alerts trigger for field officers.'
            }
          ].map((item) => (
            <div key={item.step} className="bg-white p-6 rounded-lg border border-[#E2E8F0] shadow-gov relative">
              <span className="text-3xl font-black text-[#E2E8F0] absolute top-4 right-4">
                {item.step}
              </span>
              <div className="w-8 h-8 rounded-full bg-[#EAF2FA] text-govblue font-bold flex items-center justify-center text-xs mb-4">
                {item.step}
              </div>
              <h3 className="font-bold text-slate-800 text-sm mb-2">{item.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Civic Services Grid */}
      <section className="bg-white border-y border-[#E2E8F0] py-16 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Integrated Civic Services & Jurisdictions
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Configured municipal departments with service-level agreements (SLAs).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.name} className="p-5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-white hover:border-[#CBD5E1] transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2.5 rounded-md ${s.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                      SLA: {s.sla}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm">{s.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{s.dept}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Live Call to Action */}
      <section className="py-16 px-4 sm:px-8 max-w-4xl mx-auto text-center">
        <div className="bg-[#EAF2FA] border border-[#B9D7F2] p-8 sm:p-10 rounded-xl space-y-4">
          <CivicEmblem size={44} className="mx-auto" />
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Have a civic issue in your neighborhood?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
            Submit your grievance in seconds. Receive a tracking ID and follow real-time inspection and resolution evidence.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/submit"
              className="bg-[#315B8A] hover:bg-[#25476D] text-white font-semibold text-xs px-6 py-3 rounded-md transition-colors"
            >
              Report Grievance Now
            </Link>
            <Link
              to="/officer"
              className="bg-white text-[#315B8A] hover:bg-slate-50 font-semibold text-xs px-5 py-3 rounded-md border border-[#315B8A]/40 transition-colors"
            >
              Access Officer Console
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

