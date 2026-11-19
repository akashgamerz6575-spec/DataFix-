import React from 'react';
import { ShieldCheck, Hand, ShieldBan, AlertCircle, Info, Check, X } from 'lucide-react';
import type { GateDecisionType } from '../../lib/contract-types';

interface BadgeProps {
  variant:
    | GateDecisionType
    | 'user_approved'
    | 'user_rejected'
    | 'pending_approval'
    | 'system_err'
    | 'neutral'
    | 'diff_before'
    | 'diff_after'
    | 'rule'
    | 'stat'
    | 'llm';
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ variant, children, className = '', size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-1.5 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  let variantStyles = 'bg-slate-100 text-slate-700 border-slate-200';
  let IconComponent: React.ComponentType<{ className?: string }> | null = null;

  switch (variant) {
    case 'auto_apply':
      variantStyles = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      IconComponent = ShieldCheck;
      break;
    case 'needs_approval':
    case 'pending_approval':
      variantStyles = 'bg-amber-50 text-amber-800 border-amber-200';
      IconComponent = Hand;
      break;
    case 'user_approved':
      variantStyles = 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold';
      IconComponent = Check;
      break;
    case 'user_rejected':
      variantStyles = 'bg-rose-50 text-rose-800 border-rose-200';
      IconComponent = X;
      break;
    case 'refused':
      variantStyles = 'bg-indigo-50 text-indigo-900 border-indigo-200';
      IconComponent = ShieldBan;
      break;
    case 'system_err':
      variantStyles = 'bg-red-50 text-red-800 border-red-200';
      IconComponent = AlertCircle;
      break;
    case 'diff_before':
      variantStyles = 'bg-slate-100 text-slate-500 line-through border-slate-200 font-mono';
      break;
    case 'diff_after':
      variantStyles = 'bg-sky-50 text-sky-800 border-sky-200 font-mono font-semibold';
      break;
    case 'llm':
      variantStyles = 'bg-purple-50 text-purple-700 border-purple-200';
      IconComponent = Info;
      break;
    case 'rule':
    case 'stat':
      variantStyles = 'bg-slate-100 text-slate-700 border-slate-200';
      break;
    default:
      variantStyles = 'bg-slate-100 text-slate-700 border-slate-200';
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${sizeClasses} ${variantStyles} ${className}`}
    >
      {IconComponent && <IconComponent className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
      <span>{children}</span>
    </span>
  );
};
