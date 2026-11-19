import React from 'react';

interface StatusDotProps {
  status: 'online' | 'offline' | 'waking' | 'neutral';
  label: string;
}

export const StatusDot: React.FC<StatusDotProps> = ({ status, label }) => {
  const dotColor = {
    online: 'bg-emerald-500',
    offline: 'bg-red-500',
    waking: 'bg-amber-400 animate-pulse',
    neutral: 'bg-slate-400',
  }[status];

  return (
    <div className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-mono">
      <span className={`w-2 h-2 rounded-full ${dotColor}`} />
      <span>{label}</span>
    </div>
  );
};
