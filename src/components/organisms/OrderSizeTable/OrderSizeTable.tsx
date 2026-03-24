import { useState } from "react";
import type { InventoryProduct } from "@/api/order";

interface OrderSizeTableProps {
  product: InventoryProduct;
}

const EXCLUDED_STATUSES = new Set(['receipt', 'delivered', 'shipped']);

export const OrderSizeTable = ({ product }: OrderSizeTableProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // receipt/delivered/shipped 제외, 각 사이즈별 표시할 orders 필터링
  const sizesWithOrders = product.size_stats.map((stat) => ({
    ...stat,
    visibleOrders: stat.orders.filter((o) => !EXCLUDED_STATUSES.has(o.status)),
  }));

  const hasOverflow = sizesWithOrders.some((s) => s.remaining < 0);

  // 학생 행 수 = 사이즈별 visibleOrders 최대 길이
  const maxOrderRows = Math.max(0, ...sizesWithOrders.map((s) => s.visibleOrders.length));

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
            <span className="text-14 font-medium text-gray-700">
              {product.display_name}
            </span>
            {hasOverflow && (
              <span className="text-11 text-red-500 font-medium bg-red-50 border border-red-200 rounded px-1.5 py-0.5">
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

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-13">
          <tbody>
            {isOpen && (
              <>
                {/* 헤더 행: 사이즈 (재고) */}
                <tr className="bg-gray-100">
                  {sizesWithOrders.map((stat) => (
                    <th
                      key={stat.size}
                      className="border border-gray-200 px-2 py-2 text-center font-medium min-w-17.5"
                    >
                      {stat.size} ({stat.stock})
                    </th>
                  ))}
                </tr>

                {/* 학생 행 */}
                {Array.from({ length: maxOrderRows }).map((_, rowIdx) => (
                  <tr key={rowIdx} className="h-9">
                    {sizesWithOrders.map((stat) => {
                      const order = stat.visibleOrders[rowIdx];
                      if (!order) {
                        // 이 사이즈에 더 이상 주문 없으면 '-' 표시 (다른 열보다 짧은 경우)
                        const hasAnyRemaining = sizesWithOrders.some(
                          (s) => s.visibleOrders[rowIdx] !== undefined,
                        );
                        return (
                          <td
                            key={stat.size}
                            className="border border-gray-200 px-2 py-1.5 text-center text-gray-400"
                          >
                            {hasAnyRemaining ? "-" : ""}
                          </td>
                        );
                      }

                      const isOutOfStock = order.status === 'out_of_stock';
                      const isReserved = order.status === 'reserved';

                      return (
                        <td
                          key={stat.size}
                          className={[
                            "px-2 py-1.5 text-center text-13 border",
                            isOutOfStock
                              ? "border-red-400 bg-red-50"
                              : "border-gray-200",
                          ].join(" ")}
                        >
                          <span
                            className={
                              isOutOfStock
                                ? "text-red-600 font-bold"
                                : undefined
                            }
                          >
                            {order.name}
                            {isReserved && (
                              <span className="ml-1 text-11 text-blue-500 font-medium">
                                예약
                              </span>
                            )}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* 여백 행 */}
                <tr>
                  {sizesWithOrders.map((stat) => (
                    <td key={stat.size} className="py-2" />
                  ))}
                </tr>
              </>
            )}

            {/* 집계 행 (항상 표시) */}
            <tr className="bg-gray-50 font-medium">
              {sizesWithOrders.map((stat) => (
                <td
                  key={stat.size}
                  className="border border-gray-200 px-2 py-1.5 text-center text-13"
                >
                  <div>
                    {stat.size} ({stat.ordered}/{stat.stock})
                  </div>
                  {stat.remaining !== 0 && (
                    <div
                      className={
                        stat.remaining < 0
                          ? "text-red-600 font-bold"
                          : "text-blue-600 font-bold"
                      }
                    >
                      잔여 {stat.remaining}
                    </div>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
