import React from 'react';

export const LanguageBadge: React.FC<{ language: string; size?: 'sm' | 'md' }> = ({ language, size = 'sm' }) => {
  const code = (language || 'en').toLowerCase();
  
  const getLabel = () => {
    switch (code) {
      case 'kn':
        return { short: 'KN', full: 'ಕನ್ನಡ (Kannada)' };
      case 'hi':
        return { short: 'HI', full: 'हिन्दी (Hindi)' };
      case 'en':
      default:
        return { short: 'EN', full: 'English' };
    }
  };

  const info = getLabel();
  const cls = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0] ${cls}`}
      title={info.full}
    >
      <span className="text-[10px] text-govblue font-bold tracking-wider">{info.short}</span>
      <span className="font-normal text-slate-500">•</span>
      <span className="font-medium text-[11px]">{info.full.split(' ')[0]}</span>
    </span>
  );
};

