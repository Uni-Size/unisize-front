import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  children: ReactNode;
}

const variantStyles = {
  primary: 'bg-primary-900 text-bg-050 hover:not-disabled:bg-primary-700',
  secondary: 'bg-neutral-500 text-white hover:not-disabled:bg-neutral-600',
  outline: 'bg-transparent border border-primary-500 text-blue-700 hover:not-disabled:bg-primary-500/10',
};

const sizeStyles = {
  small: 'w-auto h-auto px-3 py-1.5 text-xs',
  medium: 'w-86 h-13.5 p-3 text-17',
  large: 'w-full h-13.5 px-7 py-3.5 text-17',
};

export const Button = ({
  variant = 'primary',
  size = 'medium',
  children,
  className = '',
  ...props
}: ButtonProps) => {
  return (
    <button
      className={`flex items-center justify-center border-none rounded-lg cursor-pointer font-normal leading-none transition-all duration-200 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
