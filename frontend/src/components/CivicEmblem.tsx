import React from 'react';

export const CivicEmblem: React.FC<{ size?: number; className?: string }> = ({ size = 36, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="24" cy="24" r="22" fill="#315B8A" />
      <circle cx="24" cy="24" r="19" stroke="#FFFFFF" strokeWidth="1.5" fill="none" />
      <circle cx="24" cy="24" r="16" fill="#EAF2FA" />
      {/* Central Civic Pillar / Gateway */}
      <path d="M24 10 L33 18 L27 18 L27 34 L21 34 L21 18 L15 18 Z" fill="#315B8A" />
      <circle cx="24" cy="24" r="3" fill="#328477" />
      <path d="M13 36 C18 33, 30 33, 35 36" stroke="#328477" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
};

