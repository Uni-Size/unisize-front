"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table";
import MeasurementSheet from "../../components/MeasurementSheet";
import { usePaymentPending } from "@/hooks/usePaymentPending";
import type { PaymentPendingStudent } from "@/api/paymentApi";
import {
  getStaffOrderDetail,
  type StartMeasurementResponse,
} from "@/api/studentApi";

const columnHelper = createColumnHelper<PaymentPendingStudent>();

export default function PaymentList() {
  const {
    students,
    isLoading,
    error,
    total,
    hasMore,
    isFetchingMore,
    loadMore,
    refresh,
  } = usePaymentPending();
  const [isMeasurementSheetOpen, setIsMeasurementSheetOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] =
    useState<PaymentPendingStudent | null>(null);
  const [measurementData, setMeasurementData] =
    useState<StartMeasurementResponse | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);

  const handleDetailClick = async (student: PaymentPendingStudent) => {
    try {
      const data = await getStaffOrderDetail(student.order_id);
      setMeasurementData(data);
      setSelectedStudent(student);
      setIsMeasurementSheetOpen(true);
    } catch (error) {
      console.error("Failed to fetch measurement page info:", error);
      alert("측정 정보를 불러오는데 실패했습니다.");
    }
  };

  const handleSheetClose = () => {
    setIsMeasurementSheetOpen(false);
    setMeasurementData(null);
    setSelectedStudent(null);
    refresh();
  };

  // Infinite scroll observer
  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback(
    (node: HTMLTableRowElement | null) => {
      if (isLoading || isFetchingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading, isFetchingMore, hasMore, loadMore]
  );

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "number",
        header: "No.",
        cell: (info) => info.row.index + 1,
      }),
      columnHelper.accessor("order_number", {
        header: "주문번호",
        cell: (info) => info.getValue(),
        enableSorting: false,
      }),
      columnHelper.accessor("student_name", {
        header: "학생이름",
        cell: (info) => info.getValue(),
        enableSorting: false,
      }),
      columnHelper.accessor("gender", {
        header: "성별",
        cell: (info) => (info.getValue() === "M" ? "남" : "여"),
        enableSorting: true,
      }),
      columnHelper.accessor("school_name", {
        header: "학교",
        cell: (info) => info.getValue(),
        enableSorting: false,
      }),
      columnHelper.accessor("measurement_end_time", {
        header: "측정완료시간",
        cell: (info) => info.getValue(),
        enableSorting: false,
      }),
      columnHelper.accessor("total_amount", {
        header: "총 금액",
        cell: (info) => `${info.getValue().toLocaleString()}원`,
        enableSorting: true,
      }),
      columnHelper.accessor("remaining_amount", {
        header: "미결제 금액",
        cell: (info) => `${info.getValue().toLocaleString()}원`,
        enableSorting: true,
      }),
      columnHelper.display({
        id: "actions",
        header: "상세",
        cell: (info) => (
          <button
            className="text-blue-600 hover:text-blue-800 hover:underline"
            onClick={() => handleDetailClick(info.row.original)}
          >
            ↗
          </button>
        ),
      }),
    ],
    []
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

  useEffect(() => {
    if (isMeasurementSheetOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMeasurementSheetOpen]);

  return (
    <div className="relative">
      {isMeasurementSheetOpen && selectedStudent && measurementData && (
        <section className="fixed inset-0 z-50">
          <div
            className="absolute top-0 left-0 w-full h-full bg-black/40 backdrop-blur-sm"
            onClick={handleSheetClose}
          ></div>
          <MeasurementSheet
            setIsMeasurementSheetOpen={handleSheetClose}
            studentId={selectedStudent.student_id}
            measurementData={measurementData}
            mode="edit"
            orderId={selectedStudent.order_id}
            onSuccess={handleSheetClose}
          />
        </section>
      )}

      <div className="overflow-x-auto">
        <div className="text-sm text-gray-600 pt-4 pb-2">총 {total}건</div>

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
            <div className="text-gray-500">결제 대기 중인 주문이 없습니다.</div>
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
                      className="px-4 py-3 text-left text-sm font-semibold text-gray-700"
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
                    <td
                      key={cell.id}
                      className="px-4 py-3 text-sm text-gray-900"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {isFetchingMore && (
          <div className="flex justify-center items-center py-6">
            <div className="text-gray-500">더 많은 데이터...</div>
          </div>
        )}
      </div>
    </div>
  );
}
