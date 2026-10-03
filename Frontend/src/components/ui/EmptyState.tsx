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
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {icon ? (
        <div className="mb-4 text-gray-400">{icon}</div>
      ) : (
        <svg
          className="h-16 w-16 text-gray-400 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      )}
      {title && <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>}
      {content && <p className="text-sm text-gray-500 text-center max-w-md">{content}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-6 px-4 py-2 bg-[#f15a22] text-white rounded-lg hover:bg-[#d14d1c] transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
