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
    orange: 'bg-orange-100 text-[#f15a22]',
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
              {title}
            </p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
            {description && (
              <p className="mt-1 text-sm text-gray-500">{description}</p>
            )}
            {trend && (
              <div className="mt-2 flex items-center text-sm">
                <span className={trend.isPositive ? 'text-green-600' : 'text-red-600'}>
                  {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                </span>
                <span className="ml-2 text-gray-500">from last month</span>
              </div>
            )}
          </div>
          {icon && (
            <div className={`p-3 rounded-full ${colorClasses[color]}`}>
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
