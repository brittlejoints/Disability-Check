import * as React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

const Input: React.FC<InputProps> = ({ label, error, helperText, id, className = '', ...props }) => {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={inputId} className="text-sm font-semibold text-burgundy">
        {label}
      </label>
      <input
        id={inputId}
        className={`px-4 py-3 rounded-xl border bg-white text-charcoal placeholder-slate/50 
          focus:outline-none focus:ring-2 focus:ring-coral focus:border-coral transition-colors
          ${error ? 'border-red-500 focus:ring-red-500' : 'border-taupe'}
        `}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
        {...props}
      />
      {helperText && !error && (
        <p id={`${inputId}-helper`} className="text-xs text-slate">
          {helperText}
        </p>
      )}
      {error && (
        <p id={`${inputId}-error`} className="text-xs text-red-600 font-medium">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;