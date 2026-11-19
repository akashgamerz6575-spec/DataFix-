import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  borderLeftColor?: 'emerald' | 'amber' | 'indigo' | 'slate' | 'none';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  borderLeftColor = 'none',
}) => {
  const borderStyles = {
    none: '',
    emerald: 'border-l-4 border-l-emerald-500',
    amber: 'border-l-4 border-l-amber-500',
    indigo: 'border-l-4 border-l-indigo-600',
    slate: 'border-l-4 border-l-slate-400',
  }[borderLeftColor];

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-200/90 shadow-xs ${borderStyles} ${
        onClick ? 'cursor-pointer hover:border-slate-300 transition-colors' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
