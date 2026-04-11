import { useEffect } from 'react';

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastProps {
  message: string;
  variant?: ToastVariant;
  duration?: number;
  onClose: () => void;
}

const variantStyles: Record<ToastVariant, string> = {
  success: 'bg-green-600 text-white',
  error: 'bg-red-600 text-white',
  info: 'bg-gray-800 text-white',
};

const variantIcons: Record<ToastVariant, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
};

export const Toast = ({ message, variant = 'info', duration = 3000, onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] animate-fade-in">
      <div className={`flex items-center gap-2.5 px-5 py-3 rounded-lg shadow-lg text-sm font-medium ${variantStyles[variant]}`}>
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/20 text-xs font-bold shrink-0">
          {variantIcons[variant]}
        </span>
        {message}
        <button
          type="button"
          className="ml-2 text-white/70 hover:text-white transition-colors"
          onClick={onClose}
          aria-label="닫기"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
