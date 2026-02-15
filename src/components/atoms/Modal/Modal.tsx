import { useEffect, type ReactNode } from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  width?: number;
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  actions,
  width = 800,
}: ModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-[1000]" onClick={onClose}>
      <div
        className="bg-white border border-primary-900 rounded-[20px] px-5 py-4 flex flex-col gap-2.5 max-h-[90vh] overflow-hidden"
        style={{ width: `${width}px` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center w-full">
          <h2 className="text-xl font-normal text-[#111827] m-0">{title}</h2>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
        {actions && <div className="flex gap-2 items-center justify-center w-full pt-1.5">{actions}</div>}
      </div>
    </div>
  );
};
