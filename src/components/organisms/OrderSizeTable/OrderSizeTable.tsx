import { useState } from "react";
import { SIZES } from "./constants";

export interface StockData {
  stock: number;
  ordered: number;
}

export interface StudentOrderRow {
  studentName: string;
  sizes: Record<string, { name: string; reserved: boolean }>;
}

export interface ProductSection {
  name: string;
  sizes?: string[];
  sizeStocks: Record<string, StockData>;
  rows: StudentOrderRow[];
}

interface OrderSizeTableProps {
  section: ProductSection;
}

export const OrderSizeTable = ({ section }: OrderSizeTableProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const sizes = section.sizes ?? SIZES;

  // 사이즈별로 주문한 학생 목록 (위에서 아래 순서로)
  const sizeOrders: Record<string, { name: string; reserved: boolean }[]> = {};
  sizes.forEach((size) => {
    sizeOrders[size] = section.rows
      .filter((row) => !!row.sizes[size])
      .map((row) => row.sizes[size]);
  });

  // 전체 행 수 = max(재고수, 사이즈별 최대 주문수) 기준
  const maxStock = Math.max(
    ...sizes.map((size) => section.sizeStocks[size]?.stock ?? 0),
  );
  const maxOrdered = Math.max(...sizes.map((size) => sizeOrders[size].length));
  const maxRows = Math.max(maxStock, maxOrdered);

  const hasOverflow = sizes.some((size) => {
    const data = section.sizeStocks[size];
    return data && data.ordered > data.stock;
  });

  // 집계 행 렌더 (항상 표시)
  const summaryRow = (
    <tr className="bg-gray-50 font-medium">
      {sizes.map((size) => {
        const data = section.sizeStocks[size] || { stock: 0, ordered: 0 };
        const remaining = data.stock - data.ordered;
        return (
          <td
            key={size}
            className="border border-gray-200 px-2 py-1.5 text-center text-[13px]"
          >
            <div>
              {size} ({data.ordered}/{data.stock})
            </div>
            {remaining !== 0 && (
              <div
                className={
                  remaining < 0
                    ? "text-red-600 font-bold"
                    : "text-blue-600 font-bold"
                }
              >
                잔여 {remaining}
              </div>
            )}
          </td>
        );
      })}
    </tr>
  );

  return (
    <div className="mb-3 border-t border-gray-200 overflow-hidden">
      {/* 품목명 + 토글 버튼 */}
      <div className="bg-gray-50">
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-100 transition-colors"
        onClick={() => setIsOpen((v) => !v)}
      >
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-medium text-gray-700">
            {section.name}
          </span>
          {hasOverflow && (
            <span className="text-[11px] text-red-500 font-medium bg-red-50 border border-red-200 rounded px-1.5 py-0.5">
              재고 부족
            </span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      </div>

      {/* 항상 보이는 집계 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <tbody>
            {/* 펼쳤을 때: 헤더 + 주문 내역 행 */}
            {isOpen && (
              <>
                <tr className="bg-gray-100">
                  {sizes.map((size) => {
                    const stock = section.sizeStocks[size];
                    return (
                      <th
                        key={size}
                        className="border border-gray-200 px-2 py-2 text-center font-medium min-w-17.5"
                      >
                        {size} ({stock?.stock ?? 0})
                      </th>
                    );
                  })}
                </tr>
                {Array.from({ length: maxRows }).map((_, rowIdx) => (
                  <tr key={rowIdx} className="h-9">
                    {sizes.map((size) => {
                      const stock = section.sizeStocks[size]?.stock ?? 0;
                      const cell = sizeOrders[size][rowIdx];
                      const inStock = rowIdx < stock;
                      const isOverflow = cell !== undefined && rowIdx >= stock;

                      if (!inStock && !cell) {
                        return <td key={size} />;
                      }

                      return (
                        <td
                          key={size}
                          className={[
                            "px-2 py-1.5 text-center text-[13px]",
                            isOverflow
                              ? "border border-red-400 outline outline-red-400"
                              : "border border-gray-200",
                          ].join(" ")}
                        >
                          {cell && (
                            <span
                              className={
                                isOverflow
                                  ? "text-red-600 font-bold"
                                  : undefined
                              }
                            >
                              {cell.name}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {/* 여백 행 */}
                <tr>
                  {sizes.map((size) => (
                    <td key={size} className="py-2" />
                  ))}
                </tr>
              </>
            )}
            {summaryRow}
          </tbody>
        </table>
      </div>
    </div>
  );
};
