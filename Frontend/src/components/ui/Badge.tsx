import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-700 border border-gray-200/80',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200',
    info: 'bg-blue-50 text-blue-700 border border-blue-200',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium tracking-tight ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

interface StatusBadgeProps {
  status: 'OPEN' | 'INPG' | 'CLSD';
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const statusConfig = {
    OPEN: { label: 'Open', color: 'bg-[#FFF1E8] text-[#FF6B1A] border border-[#FF6B1A]/30', dot: 'bg-[#FF6B1A]' },
    INPG: { label: 'In Progress', color: 'bg-amber-50 text-amber-700 border border-amber-200', dot: 'bg-amber-500' },
    CLSD: { label: 'Closed', color: 'bg-emerald-50 text-emerald-700 border border-emerald-200', dot: 'bg-emerald-500' },
  };

  const config = statusConfig[status] || statusConfig.OPEN;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
