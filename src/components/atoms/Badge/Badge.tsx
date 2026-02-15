import type { ReactNode } from 'react';

export interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'small' | 'medium';
}

const variantStyles = {
  default: 'bg-gray-100 text-gray-700',
  success: 'bg-[#dcfce7] text-[#166534]',
  warning: 'bg-[#fef3c7] text-[#92400e]',
  error: 'bg-[#fee2e2] text-[#991b1b]',
  info: 'bg-[#dbeafe] text-[#1e40af]',
};

const sizeStyles = {
  small: 'px-2 py-0.5 text-xs',
  medium: 'px-3 py-1 text-sm',
};

export const Badge = ({
  children,
  variant = 'default',
  size = 'medium',
}: BadgeProps) => {
  return (
    <span className={`inline-flex items-center justify-center rounded-full font-medium whitespace-nowrap ${variantStyles[variant]} ${sizeStyles[size]}`}>
      {children}
    </span>
  );
};
