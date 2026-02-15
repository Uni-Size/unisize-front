import { useState, useRef, useEffect } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  fullWidth?: boolean;
}

export const Select = ({
  label,
  placeholder = '선택하세요',
  options,
  value,
  onChange,
  disabled = false,
  fullWidth = false,
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange?.(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={`flex flex-col gap-1 ${fullWidth ? 'w-full' : ''}`}>
      {label && <span className="px-2 text-base font-normal text-bg-800">{label}</span>}
      <div
        ref={selectRef}
        className={`relative flex items-center justify-between h-[50px] px-4 border border-gray-200 rounded-lg bg-white cursor-pointer transition-[border-color] duration-200 ease-in-out hover:border-bg-400 ${isOpen ? 'border-bg-400' : ''} ${disabled ? 'bg-[#f5f5f5] cursor-not-allowed' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={`flex-1 text-[15px] font-normal whitespace-nowrap overflow-hidden text-ellipsis ${!selectedOption ? 'text-bg-400' : 'text-gray-700'}`}>
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
        {isOpen && (
          <ul className="absolute top-[calc(100%+4px)] left-0 right-0 max-h-[200px] overflow-y-auto m-0 p-0 list-none bg-white border border-gray-200 rounded-lg shadow-md z-[100]">
            {options.map((option) => (
              <li
                key={option.value}
                className={`px-4 py-3 text-[15px] font-normal cursor-pointer transition-colors duration-200 ease-in-out hover:bg-primary-050 ${option.value === value ? 'bg-primary-050 text-primary-900 font-medium' : 'text-gray-700'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(option.value);
                }}
              >
                {option.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
