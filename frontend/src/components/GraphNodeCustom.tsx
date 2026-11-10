import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { FileText, AlertCircle, Building2, MapPin, CheckSquare, Camera } from 'lucide-react';

export const CivicGraphNode = memo(({ data }: NodeProps<any>) => {
  const nodeType = data.nodeType || 'complaint';

  const getNodeTheme = () => {
    switch (nodeType) {
      case 'incident':
        return {
          bg: 'bg-[#DDF3EF]',
          border: 'border-[#328477]',
          text: 'text-[#206358]',
          badgeBg: 'bg-[#C2EAE3]',
          icon: AlertCircle,
          label: 'POSSIBLE INCIDENT'
        };
      case 'department':
        return {
          bg: 'bg-[#FFF4D6]',
          border: 'border-[#D97706]',
          text: 'text-[#945B03]',
          badgeBg: 'bg-[#FDE68A]',
          icon: Building2,
          label: 'DEPARTMENT'
        };
      case 'ward':
        return {
          bg: 'bg-[#E8F5EC]',
          border: 'border-[#1B6A34]',
          text: 'text-[#166534]',
          badgeBg: 'bg-[#C6EBD0]',
          icon: MapPin,
          label: 'MUNICIPAL WARD'
        };
      case 'action':
        return {
          bg: 'bg-[#F1F5F9]',
          border: 'border-[#64748B]',
          text: 'text-[#334155]',
          badgeBg: 'bg-[#E2E8F0]',
          icon: CheckSquare,
          label: 'RECORDED ACTION'
        };
      case 'evidence':
        return {
          bg: 'bg-[#EEF2F6]',
          border: 'border-[#3B82F6]',
          text: 'text-[#1E40AF]',
          badgeBg: 'bg-[#DBEAFE]',
          icon: Camera,
          label: 'RESOLUTION EVIDENCE'
        };
      case 'complaint':
      default:
        return {
          bg: 'bg-[#EAF2FA]',
          border: 'border-[#315B8A]',
          text: 'text-[#25476D]',
          badgeBg: 'bg-[#C2DBF2]',
          icon: FileText,
          label: 'CITIZEN COMPLAINT'
        };
    }
  };

  const theme = getNodeTheme();
  const Icon = theme.icon;

  return (
    <div
      className={`px-3.5 py-2.5 rounded-lg border-2 ${theme.bg} ${theme.border} shadow-sm w-56 text-left transition-all hover:shadow-md cursor-pointer`}
    >
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-slate-400" />

      {/* Header Tag */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <Icon className={`w-3.5 h-3.5 ${theme.text}`} />
          <span className={`text-[9px] font-bold tracking-wider px-1.5 py-0.2 rounded ${theme.badgeBg} ${theme.text}`}>
            {theme.label}
          </span>
        </div>
        {data.language && (
          <span className="text-[9px] font-bold uppercase text-slate-500 bg-white/70 px-1 rounded border border-slate-200">
            {data.language}
          </span>
        )}
      </div>

      {/* Code & Label */}
      <p className="text-xs font-bold text-slate-900 truncate" title={data.label}>
        {data.label}
      </p>

      {/* Details */}
      {data.details && (
        <p className="text-[11px] text-slate-600 line-clamp-2 mt-1 leading-snug">
          {data.details}
        </p>
      )}

      {/* Bottom Status / Category */}
      <div className="mt-2 pt-1.5 border-t border-black/10 flex items-center justify-between text-[10px]">
        <span className="font-semibold text-slate-700 truncate max-w-[110px]">
          {data.category || data.locality || data.code}
        </span>
        <span className="font-medium text-slate-500">{data.status || 'Active'}</span>
      </div>

      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-slate-400" />
    </div>
  );
});

CivicGraphNode.displayName = 'CivicGraphNode';

