import type { ReactNode } from 'react';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (item: T, index: number) => ReactNode;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
}

export const Table = <T extends object>({
  columns,
  data,
  onRowClick,
  emptyMessage = '데이터가 없습니다.',
}: TableProps<T>) => {
  return (
    <div className="w-full overflow-x-auto bg-white rounded-xl border border-gray-200">
      <table className="w-full border-collapse">
        <thead className="bg-gray-100">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className="p-4 text-left text-sm font-semibold text-gray-700 border-b border-gray-200 whitespace-nowrap"
                style={{ width: column.width }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="p-12 text-center text-sm text-[#767676]">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr
                key={index}
                className={`transition-colors duration-200 ease-in-out hover:bg-gray-100 [&:last-child_td]:border-b-0 ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column) => (
                  <td key={String(column.key)} className="p-4 text-sm text-gray-900 border-b border-gray-200">
                    {column.render
                      ? column.render(item, index)
                      : String(item[column.key as keyof T] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
