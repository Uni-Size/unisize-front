import './AdminHeader.css';

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
    <header className="admin-header">
      <h1 className="admin-header__title">{title}</h1>
      {buttonLabel && (
        <button
          type="button"
          className="admin-header__button"
          onClick={onButtonClick}
        >
          {buttonLabel}
        </button>
      )}
    </header>
  );
};
