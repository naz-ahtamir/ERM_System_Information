import React from 'react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ title, message, description, icon, action }: EmptyStateProps) {
  const content = description || message || '';
  
  return (
    <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-[#FFF1E8] flex items-center justify-center mb-4 text-[#FF6B1A]">
        {icon ? (
          icon
        ) : (
          <svg
            className="h-7 w-7 text-[#FF6B1A]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        )}
      </div>
      {title && <h3 className="text-base font-semibold text-[#1F2937] mb-1.5">{title}</h3>}
      {content && <p className="text-xs text-[#6B7280] max-w-sm leading-relaxed">{content}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-5 px-4 py-2 bg-[#FF6B1A] text-white font-medium text-xs rounded-lg hover:bg-[#E85D0F] transition-colors shadow-xs"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
