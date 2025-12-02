import { RegisterStudent } from "@/api/studentApi";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";

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
      columnHelper.accessor("id", {
        header: "No.",
        cell: (info) => info.getValue(),
        enableSorting: false,
      }),
      columnHelper.accessor("checked_in_at", {
        header: "접수시간",
        cell: (info) => info.getValue(),
        enableSorting: false,
      }),
      columnHelper.accessor("name", {
        header: "학생이름",
        cell: (info) => info.getValue(),
        enableSorting: false,
      }),
      columnHelper.accessor("gender", {
        header: "성별",
        cell: (info) => (info.getValue() === "M" ? "남" : "여"),
        enableSorting: true,
      }),
      columnHelper.display({
        id: "schools",
        header: "출신학교 → 입학학교",
        cell: (info) => (
          <span>
            {info.row.original.previous_school} →{" "}
            {info.row.original.school_name}
          </span>
        ),
      }),
      columnHelper.accessor("grade", {
        header: "분류",
        cell: (info) => (info.getValue() === 1 ? "신입" : "재학"),
        enableSorting: false,
      }),
      columnHelper.display({
        id: "actions",
        header: "상세",
        cell: (info) => (
          <button
            className="text-blue-600 hover:text-blue-800 hover:underline"
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
    <div className="overflow-x-auto">
      <div className="text-sm text-gray-600 pt-4 pb-2">총 {total}명 대기중</div>

      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      )}

      {error && (
        <div className="flex justify-center items-center py-12">
          <div className="text-red-500">{error}</div>
        </div>
      )}

      {!isLoading && !error && students.length === 0 && (
        <div className="flex justify-center items-center py-12">
          {" "}
          in November
          <div className="text-gray-500">대기 중인 학생이 없습니다.</div>
        </div>
      )}

      {!isLoading && !error && students.length > 0 && (
        <table className="w-full">
          <thead className="bg-gray-50 border-b-2 border-gray-200">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={`px-4 py-3 text-left text-sm font-semibold text-gray-700 ${
                      header.id === "schools" ? "min-w-[280px]" : ""
                    }`}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.getCanSort()
                            ? "cursor-pointer hover:bg-gray-100 flex items-center gap-1"
                            : "flex items-center gap-1"
                        }
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getCanSort() && (
                          <span>
                            {{
                              asc: "🔼",
                              desc: "🔽",
                            }[header.column.getIsSorted() as string] ?? "↕️"}
                          </span>
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-200">
            {table.getRowModel().rows.map((row, index) => (
              <tr
                key={row.id}
                ref={index === students.length - 1 ? lastElementRef : null}
                className="hover:bg-gray-50 transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 text-sm text-gray-900">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {isFetchingMore && (
        <div className="flex justify-center items-center py-6">
          <div className="text-gray-500">더 많은 데이터를 불러오는 중...</div>
        </div>
      )}
    </div>
  );
}
