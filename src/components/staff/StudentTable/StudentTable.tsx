import type { RegisterStudent } from '../../../api/student';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  getSortedRowModel,
  type SortingState,
} from '@tanstack/react-table';
import { useMemo, useState } from 'react';

interface StudentTableProps {
  students: RegisterStudent[];
  total: number;
  isLoading: boolean;
  error?: string | null;
  isFetchingMore?: boolean;
  lastElementRef?: (node: HTMLTableRowElement | null) => void;
  onDetailClick: (student: RegisterStudent) => void;
  emptyMessage?: string;
}

const columnHelper = createColumnHelper<RegisterStudent>();

function getStudentType(admission_year: number, admission_grade: number) {
  const currentYear = new Date().getFullYear();
  const isCurrentYear = admission_year === currentYear;
  const isFirstGrade = admission_grade === 1;
  if (isCurrentYear && isFirstGrade) return '신입';
  if (isCurrentYear && !isFirstGrade) return '전학';
  return '재학';
}

export function StudentTable({
  students,
  total,
  isLoading,
  error,
  isFetchingMore,
  lastElementRef,
  onDetailClick,
  emptyMessage = '대기 중인 학생이 없습니다.',
}: StudentTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'number',
        header: 'No.',
        cell: (info) => info.row.index + 1,
      }),
      columnHelper.accessor('checked_in_at', {
        header: '접수시간',
        cell: (info) => <span className="break-keep">{info.getValue()}</span>,
        enableSorting: false,
      }),
      columnHelper.accessor('name', {
        header: '학생이름',
        cell: (info) => info.getValue(),
        enableSorting: false,
      }),
      columnHelper.accessor('gender', {
        header: '성별',
        cell: (info) => (info.getValue() === 'M' ? '남' : '여'),
        enableSorting: true,
      }),
      columnHelper.display({
        id: 'schools',
        header: '출신학교 → 입학학교',
        cell: (info) => (
          <span>
            {info.row.original.previous_school} →{' '}
            <span className="font-bold">{info.row.original.admission_school}</span>
          </span>
        ),
      }),
      columnHelper.display({
        id: 'student_type',
        header: '분류',
        cell: (info) => {
          const { admission_year, admission_grade } = info.row.original;
          return getStudentType(admission_year, admission_grade);
        },
        enableSorting: false,
      }),
      columnHelper.display({
        id: 'actions',
        header: '상세',
        cell: (info) => (
          <button
            className="text-blue-600 bg-none border-none cursor-pointer text-base px-2 py-1 transition-colors duration-150 hover:text-blue-700 hover:underline"
            onClick={() => onDetailClick(info.row.original)}
          >
            ↗
          </button>
        ),
      }),
    ],
    [onDetailClick],
  );

  const table = useReactTable({
    data: students,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    enableSorting: true,
    enableSortingRemoval: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="overflow-x-auto">
      <div className="text-sm text-gray-600 pt-4 pb-2">총 {total}명 대기중</div>

      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <span className="text-gray-500">로딩 중...</span>
        </div>
      )}

      {error && (
        <div className="flex justify-center items-center py-12">
          <span className="text-red-500">{error}</span>
        </div>
      )}

      {!isLoading && !error && students.length === 0 && (
        <div className="flex justify-center items-center py-12">
          <span className="text-gray-500">{emptyMessage}</span>
        </div>
      )}

      {!isLoading && !error && students.length > 0 && (
        <table className="w-full border-collapse table-fixed">
          <thead className="bg-gray-50 border-b-2 border-gray-200">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={`px-2 py-3 text-center text-sm font-semibold text-gray-700 ${
                      header.id === 'number' ? 'w-6' : ''
                    } ${header.id === 'checked_in_at' ? 'w-28' : ''} ${
                      header.id === 'name' ? 'w-16' : ''
                    } ${header.id === 'gender' ? 'w-10' : ''} ${
                      header.id === 'schools' ? 'w-32' : ''
                    } ${header.id === 'student_type' ? 'w-12' : ''} ${
                      header.id === 'actions' ? 'w-10' : ''
                    }`}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={`flex items-center justify-center gap-1 ${
                          header.column.getCanSort()
                            ? 'cursor-pointer hover:bg-gray-100'
                            : ''
                        }`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {header.column.getCanSort() && (
                          <span className="text-xs text-gray-400">
                            {{
                              asc: ' ▲',
                              desc: ' ▼',
                            }[header.column.getIsSorted() as string] ?? ' ↕'}
                          </span>
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="border-t border-gray-200">
            {table.getRowModel().rows.map((row, index) => (
              <tr
                key={row.id}
                ref={
                  lastElementRef && index === students.length - 1
                    ? lastElementRef
                    : null
                }
                className="transition-colors duration-150 hover:bg-gray-50"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-2 py-3 text-sm text-gray-900 border-b border-gray-200 text-center"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {isFetchingMore && (
        <div className="flex justify-center items-center py-6 text-gray-500">
          더 많은 데이터를 불러오는 중...
        </div>
      )}
    </div>
  );
}
