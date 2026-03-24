import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

export interface SelectOption {
  value: string;
  label: string;
  group?: string;
}

export interface SelectOptionGroup {
  label: string;
  options: SelectOption[];
}

export interface SelectProps {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  groups?: SelectOptionGroup[];
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  fullWidth?: boolean;
}

export const Select = ({
  label,
  placeholder = '선택하세요',
  options,
  groups,
  value,
  onChange,
  disabled = false,
  fullWidth = false,
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  const allOptions = groups ? groups.flatMap((g) => g.options) : options;
  const selectedOption = allOptions.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpen = () => {
    if (disabled) return;
    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownStyle({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }
    setIsOpen((prev) => !prev);
  };

  const handleSelect = (optionValue: string) => {
    onChange?.(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={`flex flex-col gap-2 ${fullWidth ? 'w-full' : ''}`}>
      {label && <span className="text-15 font-normal text-gray-700">{label}</span>}
      <div
        ref={triggerRef}
        className={`relative flex items-center justify-between h-12.5 px-4 border border-gray-200 rounded-lg bg-white cursor-pointer transition-colors duration-200 ease-in-out hover:border-bg-400 ${isOpen ? 'border-bg-400' : ''} ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        onClick={handleOpen}
      >
        <span className={`flex-1 text-15 font-normal whitespace-nowrap overflow-hidden text-ellipsis ${!selectedOption ? 'text-bg-400' : 'text-gray-700'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={`shrink-0 transition-transform duration-200 ease-in-out ${isOpen ? 'rotate-180' : ''}`}
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M7 10L12 15L17 10H7Z" fill="#c6c6c6" />
        </svg>
      </div>
      {isOpen && createPortal(
        <div
          className="fixed max-h-50 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-md z-9999"
          style={{ top: dropdownStyle.top, left: dropdownStyle.left, width: dropdownStyle.width }}
        >
          <ul className="m-0 p-0 list-none">
            {groups
              ? groups.map((group) => (
                  <li key={group.label}>
                    <div className="px-4 py-1.5 text-xs font-semibold text-gray-400 bg-gray-50 border-b border-gray-100">
                      {group.label}
                    </div>
                    <ul className="m-0 p-0 list-none">
                      {group.options.map((option) => (
                        <li
                          key={option.value}
                          className={`px-4 py-3 text-15 font-normal cursor-pointer transition-colors duration-200 ease-in-out hover:bg-primary-050 ${option.value === value ? 'bg-primary-050 text-primary-900 font-medium' : 'text-gray-700'}`}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleSelect(option.value);
                          }}
                        >
                          {option.label}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))
              : options.map((option) => (
                  <li
                    key={option.value}
                    className={`px-4 py-3 text-15 font-normal cursor-pointer transition-colors duration-200 ease-in-out hover:bg-primary-050 ${option.value === value ? 'bg-primary-050 text-primary-900 font-medium' : 'text-gray-700'}`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelect(option.value);
                    }}
                  >
                    {option.label}
                  </li>
                ))}
          </ul>
        </div>,
        document.body
      )}
    </div>
  );
};
