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
  searchable?: boolean;
  size?: 'sm' | 'md';
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
  searchable = false,
  size = 'md',
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [dropdownStyle, setDropdownStyle] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const allOptions = groups ? groups.flatMap((g) => g.options) : options;
  const selectedOption = allOptions.find((opt) => opt.value === value);

  const filterOption = (opt: SelectOption) =>
    !search || opt.label.toLowerCase().includes(search.toLowerCase());

  const filteredGroups = groups
    ? groups.map((g) => ({ ...g, options: g.options.filter(filterOption) })).filter((g) => g.options.length > 0)
    : null;
  const filteredOptions = filteredGroups ? [] : options.filter(filterOption);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openDropdown = () => {
    if (disabled) return;
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownStyle({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
    setIsOpen(true);
  };

  const handleSelect = (optionValue: string) => {
    onChange?.(optionValue);
    setIsOpen(false);
    setSearch('');
  };

  const sizeClass = size === 'sm' ? 'h-9 px-2.5' : 'h-12.5 px-4';
  const textClass = size === 'sm' ? 'text-13' : 'text-15';

  const optionClass = (v: string) =>
    `px-3 py-2 text-13 font-normal cursor-pointer transition-colors duration-200 ease-in-out hover:bg-primary-050 ${v === value ? 'bg-primary-050 text-primary-900 font-medium' : 'text-gray-700'}`;

  return (
    <div ref={containerRef} className={`flex flex-col gap-2 ${fullWidth ? 'w-full' : ''}`}>
      {label && <span className="text-15 font-normal text-gray-700">{label}</span>}
      <div
        className={`relative flex items-center justify-between ${sizeClass} border border-gray-200 rounded-lg bg-white transition-colors duration-200 ease-in-out hover:border-bg-400 ${isOpen ? 'border-bg-400' : ''} ${disabled ? 'bg-gray-100' : 'cursor-pointer'}`}
        onClick={() => { if (!searchable) openDropdown(); }}
      >
        {searchable ? (
          <input
            ref={inputRef}
            className={`flex-1 min-w-0 border-none bg-transparent ${textClass} font-normal text-gray-700 outline-none placeholder:text-bg-400 ${disabled ? 'cursor-not-allowed' : ''}`}
            placeholder={isOpen ? '검색...' : (selectedOption?.label ?? placeholder)}
            value={isOpen ? search : ''}
            readOnly={!isOpen}
            disabled={disabled}
            onFocus={openDropdown}
            onChange={(e) => setSearch(e.target.value)}
            onClick={(e) => { e.stopPropagation(); openDropdown(); }}
          />
        ) : (
          <span className={`flex-1 ${textClass} font-normal whitespace-nowrap overflow-hidden text-ellipsis ${!selectedOption ? 'text-bg-400' : 'text-gray-700'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        )}
        {searchable && !isOpen && selectedOption && (
          <span className={`absolute left-2.5 ${textClass} text-gray-700 pointer-events-none`}>
            {selectedOption.label}
          </span>
        )}
        <svg
          className={`shrink-0 transition-transform duration-200 ease-in-out ${isOpen ? 'rotate-180' : ''}`}
          width="24" height="24" viewBox="0 0 24 24" fill="none"
          onClick={(e) => { e.stopPropagation(); if (isOpen) { setIsOpen(false); setSearch(''); } else openDropdown(); }}
        >
          <path d="M7 10L12 15L17 10H7Z" fill="#c6c6c6" />
        </svg>
      </div>
      {isOpen && createPortal(
        <div
          className="fixed bg-white border border-gray-200 rounded-lg shadow-md z-9999 flex flex-col"
          style={{ top: dropdownStyle.top, left: dropdownStyle.left, width: dropdownStyle.width, maxHeight: 280 }}
        >
          <ul className="m-0 p-0 list-none overflow-y-auto">
            {filteredGroups
              ? filteredGroups.map((group) => (
                  <li key={group.label}>
                    <div className="px-4 py-1.5 text-xs font-semibold text-gray-400 bg-gray-50 border-b border-gray-100">
                      {group.label}
                    </div>
                    <ul className="m-0 p-0 list-none">
                      {group.options.map((option) => (
                        <li
                          key={option.value}
                          className={optionClass(option.value)}
                          onMouseDown={(e) => { e.preventDefault(); handleSelect(option.value); }}
                        >
                          {option.label}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))
              : filteredOptions.map((option) => (
                  <li
                    key={option.value}
                    className={optionClass(option.value)}
                    onMouseDown={(e) => { e.preventDefault(); handleSelect(option.value); }}
                  >
                    {option.label}
                  </li>
                ))}
            {(filteredGroups ? filteredGroups.length === 0 : filteredOptions.length === 0) && (
              <li className="px-4 py-3 text-14 text-gray-400 text-center">결과 없음</li>
            )}
          </ul>
        </div>,
        document.body
      )}
    </div>
  );
};
