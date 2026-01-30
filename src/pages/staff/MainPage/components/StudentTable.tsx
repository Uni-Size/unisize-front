import type { RegisterStudent } from '../../../../api/student';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  getSortedRowModel,
  type SortingState,
} from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import './StudentTable.css';

interface StudentTableProps {
  students: RegisterStudent[];
  total: number;
  isLoading: boolean;
  error: string | null;
  isFetchingMore: boolean;
  lastElementRef: (node: HTMLTableRowElement | null) => void;
  onDetailClick: (student: RegisterStudent) => void;
}

const columnHelper = createColumnHelper<RegisterStudent>();

export default function StudentTable({
  students,
  total,
  isLoading,
  error,
  isFetchingMore,
  lastElementRef,
  onDetailClick,
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
        cell: (info) => info.getValue(),
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
            {info.row.original.school_name}
          </span>
        ),
      }),
      columnHelper.accessor('grade', {
        header: '분류',
        cell: (info) => (info.getValue() === 1 ? '신입' : '재학'),
        enableSorting: false,
      }),
      columnHelper.display({
        id: 'actions',
        header: '상세',
        cell: (info) => (
          <button
            className="student-table__action-button"
            onClick={() => onDetailClick(info.row.original)}
          >
            ↗
          </button>
        ),
      }),
    ],
    [onDetailClick]
  );

  const table = useReactTable({
    data: students,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    enableSorting: true,
    enableSortingRemoval: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="student-table">
      <div className="student-table__header">총 {total}명 대기중</div>

      {isLoading && (
        <div className="student-table__status">
          <span className="student-table__status-text">로딩 중...</span>
        </div>
      )}

      {error && (
        <div className="student-table__status">
          <span className="student-table__status-text student-table__status-text--error">
            {error}
          </span>
        </div>
      )}

      {!isLoading && !error && students.length === 0 && (
        <div className="student-table__status">
          <span className="student-table__status-text">
            대기 중인 학생이 없습니다.
          </span>
        </div>
      )}

      {!isLoading && !error && students.length > 0 && (
        <table className="student-table__table">
          <thead className="student-table__thead">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={`student-table__th ${
                      header.id === 'schools' ? 'student-table__th--wide' : ''
                    }`}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={`student-table__th-content ${
                          header.column.getCanSort()
                            ? 'student-table__th-content--sortable'
                            : ''
                        }`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getCanSort() && (
                          <span className="student-table__sort-icon">
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
          <tbody className="student-table__tbody">
            {table.getRowModel().rows.map((row, index) => (
              <tr
                key={row.id}
                ref={index === students.length - 1 ? lastElementRef : null}
                className="student-table__tr"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="student-table__td">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {isFetchingMore && (
        <div className="student-table__loading-more">
          더 많은 데이터를 불러오는 중...
        </div>
      )}
    </div>
  );
}
