import React from 'react';
import { ComplaintStatus } from '../types';

interface StatusBadgeProps {
  status: ComplaintStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStyles = () => {
    switch (status) {
      case 'Submitted':
        return 'bg-[#EAF2FA] text-[#315B8A] border-[#C2DBF2]';
      case 'Under Review':
        return 'bg-[#FFF4D6] text-[#945B03] border-[#FFE299]';
      case 'Assigned':
        return 'bg-[#EEF2F6] text-[#475569] border-[#CBD5E1]';
      case 'Action Taken':
        return 'bg-[#DDF3EF] text-[#206358] border-[#AEE4DB]';
      case 'Resolved':
        return 'bg-[#E8F5EC] text-[#1B6A34] border-[#B9E6C5]';
      case 'Reopened':
        return 'bg-[#FCE8E8] text-[#A82525] border-[#F8BABA]';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const pad = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${getStyles()} ${pad}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
      {status}
    </span>
  );
};

