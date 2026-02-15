import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  children: ReactNode;
}

const variantStyles = {
  primary: 'bg-primary-900 text-[#f9fafb] hover:not-disabled:bg-[#2a2f5a]',
  secondary: 'bg-[#6c757d] text-white hover:not-disabled:bg-[#545b62]',
  outline: 'bg-transparent border border-primary-500 text-[#1e40af] hover:not-disabled:bg-primary-500/10',
};

const sizeStyles = {
  small: 'w-auto h-auto px-3 py-1.5 text-xs',
  medium: 'w-[343px] h-[54px] p-3 text-[17px]',
  large: 'w-full h-[54px] px-7 py-3.5 text-[17px]',
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
