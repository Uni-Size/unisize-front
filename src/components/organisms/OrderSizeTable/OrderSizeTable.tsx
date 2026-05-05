import { useState } from "react";
import type { InventoryProduct } from "@/api/order";

interface OrderSizeTableProps {
  product: InventoryProduct;
}

const EXCLUDED_STATUSES = new Set(['receipt', 'delivered', 'shipped']);

export const OrderSizeTable = ({ product }: OrderSizeTableProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // receipt/delivered/shipped 제외, 각 사이즈별 표시할 orders 필터링
  const sizesWithOrders = product.size_stats.map((stat) => {
    const visible = stat.orders.filter((o) => !EXCLUDED_STATUSES.has(o.status));
    const normal = visible.filter((o) => o.status !== 'out_of_stock' && o.status !== 'reserved');
    const reserved = visible.filter((o) => o.status === 'reserved');
    const outOfStock = visible.filter((o) => o.status === 'out_of_stock');
    const visibleOrders = [...normal, ...reserved, ...outOfStock];
    const actualSold = visibleOrders.length;
    return { ...stat, visibleOrders, actualSold };
  });

  const hasOverflow = sizesWithOrders.some((s) => s.remaining < 0);

  // 학생 행 수 = 사이즈별 visibleOrders 최대 길이
  const maxOrderRows = Math.max(0, ...sizesWithOrders.map((s) => s.visibleOrders.length));

  return (
    <div className="mb-3 border-t border-gray-100 overflow-hidden">
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
                      className={[
                        "px-2 py-2 text-center font-medium min-w-17.5",
                        stat.stock > 0
                          ? "border-[0.5px] border-gray-200"
                          : "text-gray-300",
                      ].join(" ")}
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
                        const withinStock = rowIdx < stat.stock;
                        const hasAnyRemaining = sizesWithOrders.some(
                          (s) => s.visibleOrders[rowIdx] !== undefined,
                        );
                        return (
                          <td
                            key={stat.size}
                            className={[
                              "px-2 py-1.5 text-center text-gray-400",
                              withinStock ? "border-[0.5px] border-gray-200" : "border-0",
                            ].join(" ")}
                          >
                            {withinStock && hasAnyRemaining ? "-" : ""}
                          </td>
                        );
                      }

                      const isOutOfStock = order.status === 'out_of_stock';
                      const isReserved = order.status === 'reserved';

                      return (
                        <td
                          key={stat.size}
                          className={[
                            "px-2 py-1.5 text-center text-13",
                            isOutOfStock
                              ? "border-[0.5px] border-gray-200 outline-1 outline-red-400 bg-red-50 relative z-10"
                              : "border-[0.5px] border-gray-200",
                          ].join(" ")}
                        >
                          <span
                            className={[
                              "inline-flex items-center gap-1 whitespace-nowrap",
                              isOutOfStock ? "text-red-600 font-bold" : "",
                            ].join(" ")}
                          >
                            {order.name}
                            {isReserved && (
                              <span className="text-11 text-blue-500 font-medium">
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
                  className={[
                    "px-2 py-1.5 text-center text-13",
                    stat.stock > 0
                      ? "border-[0.5px] border-gray-200"
                      : "text-gray-300",
                  ].join(" ")}
                >
                  <div>
                    {stat.size} ({stat.actualSold}/{stat.stock})
                  </div>
                  {stat.stock > 0 && (() => {
                    const surplus = stat.stock - stat.actualSold;
                    if (surplus === 0) return null;
                    return (
                      <div className={surplus < 0 ? "text-red-600 font-bold" : "text-blue-600 font-bold"}>
                        {surplus < 0 ? `부족 ${Math.abs(surplus)}` : `재고 ${surplus}`}
                      </div>
                    );
                  })()}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
