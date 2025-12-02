import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";

export interface MeasurementData {
  id: number;
  completedAt: string;
  studentName: string;
  gender: string;
  school: string;
  category: string;
  expectedAmount: string;
}

interface MeasurementWaitingTableProps {
  data: MeasurementData[];
  onDetailClick?: (id: number) => void;
}

const columnHelper = createColumnHelper<MeasurementData>();

export default function MeasurementWaitingTable({
  data,
  onDetailClick,
}: MeasurementWaitingTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: "No.",
        cell: (info) => info.getValue(),
        enableSorting: false,
      }),
      columnHelper.accessor("completedAt", {
        header: "측정완료",
        cell: (info) => info.getValue(),
        enableSorting: false,
      }),
      columnHelper.accessor("studentName", {
        header: "학생이름",
        cell: (info) => info.getValue(),
        enableSorting: false,
      }),
      columnHelper.accessor("gender", {
        header: "성별",
        cell: (info) => info.getValue(),
        enableSorting: true,
      }),
      columnHelper.accessor("school", {
        header: "입학학교",
        cell: (info) => info.getValue(),
        enableSorting: false,
      }),
      columnHelper.accessor("category", {
        header: "분류",
        cell: (info) => info.getValue(),
        enableSorting: false,
      }),
      columnHelper.accessor("expectedAmount", {
        header: "결제 예정 금액",
        cell: (info) => info.getValue(),
        enableSorting: false,
      }),
      columnHelper.display({
        id: "actions",
        header: "상세",
        cell: (info) => (
          <button
            onClick={() => onDetailClick?.(info.row.original.id)}
            className="text-blue-600 hover:text-blue-800"
          >
            🔍
          </button>
        ),
      }),
    ],
    [onDetailClick]
  );

  const table = useReactTable({
    data,
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
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">결제 대기자</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.getCanSort()
                            ? "cursor-pointer select-none flex items-center gap-2"
                            : ""
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
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
