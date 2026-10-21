import React from 'react';
import { Card, CardContent } from '../ui/Card';

interface StatCardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'orange' | 'blue' | 'green' | 'red';
}

export function StatCard({ 
  title, 
  value, 
  icon, 
  description, 
  trend,
  color = 'orange' 
}: StatCardProps) {
  const colorClasses = {
    orange: 'bg-[#FFF1E8] text-[#FF6B1A]',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-emerald-50 text-emerald-600',
    red: 'bg-rose-50 text-rose-600',
  };

  return (
    <Card className="rounded-xl border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:border-[#FF6B1A]/40 transition-all">
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
              {title}
            </p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-[#1F2937]">{value}</p>
            {description && (
              <p className="mt-1 text-xs text-[#6B7280]">{description}</p>
            )}
            {trend && (
              <div className="mt-2.5 flex items-center text-xs font-medium">
                <span className={trend.isPositive ? 'text-emerald-600' : 'text-rose-600'}>
                  {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                </span>
                <span className="ml-1.5 text-[#9CA3AF]">from last month</span>
              </div>
            )}
          </div>
          {icon && (
            <div className={`p-3 rounded-xl flex-shrink-0 ${colorClasses[color]}`}>
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
