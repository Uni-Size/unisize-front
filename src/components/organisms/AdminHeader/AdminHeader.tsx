import type { ReactNode } from 'react';

interface AdminHeaderProps {
  title: string;
  buttonLabel?: string;
  onButtonClick?: () => void;
  actions?: ReactNode;
}

export const AdminHeader = ({
  title,
  buttonLabel,
  onButtonClick,
  actions,
}: AdminHeaderProps) => {
  return (
    <header className="flex items-center justify-between w-full">
      <h1 className="text-xl font-normal text-[#111827] leading-none m-0">{title}</h1>
      <div className="flex items-center gap-2">
        {actions}
        {buttonLabel && (
          <button
            type="button"
            className="flex items-center justify-center w-auto h-8.5 px-4 bg-primary-900 border-none rounded-lg text-[15px] font-normal text-[#f9fafb] cursor-pointer transition-opacity duration-200 hover:opacity-90 whitespace-nowrap"
            onClick={onButtonClick}
          >
            {buttonLabel}
          </button>
        )}
      </div>
    </header>
  );
};
