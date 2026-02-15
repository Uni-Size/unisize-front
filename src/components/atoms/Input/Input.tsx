import type { InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Input = ({
  label,
  error,
  fullWidth = false,
  className = '',
  id,
  ...props
}: InputProps) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`flex flex-col gap-2 ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label htmlFor={inputId} className="text-[15px] font-normal text-gray-700">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`flex items-center ${fullWidth ? 'w-full' : 'w-[343px]'} h-[50px] px-4 border border-gray-200 rounded-lg text-[15px] font-normal leading-none text-gray-700 bg-transparent transition-[border-color] duration-200 ease-in-out focus:outline-none focus:border-bg-400 placeholder:text-bg-400 ${error ? 'border-error focus:border-error' : ''} ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-error">{error}</span>}
    </div>
  );
};
