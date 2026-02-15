interface AdminHeaderProps {
  title: string;
  buttonLabel?: string;
  onButtonClick?: () => void;
}

export const AdminHeader = ({
  title,
  buttonLabel,
  onButtonClick,
}: AdminHeaderProps) => {
  return (
    <header className="flex items-center justify-between w-full">
      <h1 className="text-xl font-normal text-[#111827] leading-none m-0">{title}</h1>
      {buttonLabel && (
        <button
          type="button"
          className="flex items-center justify-center w-[100px] h-[34px] p-3 bg-primary-900 border-none rounded-lg text-[17px] font-normal text-[#f9fafb] cursor-pointer transition-opacity duration-200 hover:opacity-90"
          onClick={onButtonClick}
        >
          {buttonLabel}
        </button>
      )}
    </header>
  );
};
