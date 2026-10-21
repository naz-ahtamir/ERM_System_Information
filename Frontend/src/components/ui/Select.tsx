import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#4B5563] mb-1.5">
            {label}
            {props.required && <span className="text-[#FF6B1A] ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          className={`
            w-full px-3.5 py-2 text-sm text-[#1F2937] bg-white border rounded-lg shadow-xs
            transition-colors duration-150
            focus:outline-none focus:ring-2 focus:ring-[#FF6B1A]/20 focus:border-[#FF6B1A]
            disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed disabled:border-gray-200
            ${error ? 'border-red-400 focus:ring-red-400/20 focus:border-red-500' : 'border-[#E5E7EB]'}
            ${className}
          `}
          {...props}
        >
          <option value="">Pilih {label || 'opsi'}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1.5 text-xs text-red-600 font-medium">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-xs text-[#6B7280]">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
