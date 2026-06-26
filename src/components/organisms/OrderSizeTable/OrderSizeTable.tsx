import { useState } from "react";
import type { InventoryProduct } from "@/api/order";

interface OrderSizeTableProps {
  product: InventoryProduct;
}

const ROUND_BG: Record<number, string> = {
  1: 'bg-white',
  2: 'bg-blue-50',
  3: 'bg-green-50',
  4: 'bg-yellow-50',
  5: 'bg-purple-50',
};

function getRoundBg(round: number | null) {
  if (round == null) return 'bg-white';
  return ROUND_BG[round] ?? 'bg-gray-50';
}

const sizeToNum = (size: string) => {
  const n = parseFloat(size);
  return isNaN(n) ? Infinity : n;
};

export const OrderSizeTable = ({ product }: OrderSizeTableProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // 같은 사이즈를 머지 (stock 합산, rounds 합치기)
  const mergedMap = new Map<string, {
    size: string;
    stock: number;
    ordered: number;
    remaining: number;
    rounds: Array<{ round_number: number; total_in: number; orders: Array<{ name: string; status: string }> }>;
  }>();

  for (const stat of product.size_stats) {
    const rounds = (stat.rounds ?? []).map((r) => ({
      round_number: r.round_number,
      total_in: r.total_in,
      orders: r.orders ?? [],
    }));

    const existing = mergedMap.get(stat.size);
    if (existing) {
      existing.stock += stat.stock;
      existing.ordered += stat.ordered;
      existing.remaining += stat.remaining;
      for (const r of rounds) {
        const ex = existing.rounds.find((er) => er.round_number === r.round_number);
        if (ex) {
          ex.total_in += r.total_in;
          const seenNames = new Set(ex.orders.map((o) => o.name));
          for (const o of r.orders) {
            if (!seenNames.has(o.name)) { ex.orders.push(o); seenNames.add(o.name); }
          }
        } else {
          existing.rounds.push({ ...r });
        }
      }
    } else {
      mergedMap.set(stat.size, { size: stat.size, stock: stat.stock, ordered: stat.ordered, remaining: stat.remaining, rounds });
    }
  }

  // 사이즈 오름차순 정렬
  const sizes = Array.from(mergedMap.values()).sort((a, b) => sizeToNum(a.size) - sizeToNum(b.size));

  // 각 사이즈별로 행 인덱스 → { roundNum, order | null } 매핑 생성
  // orders를 quantity만큼 펼쳐서 슬롯에 순서대로 배치
  type CellInfo = { roundNum: number; order: { name: string; status: string } | null };

  const sizeCells: CellInfo[][] = sizes.map((s) => {
    const cells: CellInfo[] = [];
    const sortedRounds = [...s.rounds].sort((a, b) => a.round_number - b.round_number);
    for (const r of sortedRounds) {
      // orders를 quantity만큼 펼친 슬롯
      const expanded: Array<{ name: string; status: string }> = [];
      for (const o of r.orders) {
        const qty = o.quantity ?? 1;
        for (let q = 0; q < qty; q++) expanded.push({ name: o.name, status: o.status });
      }
      const slotCount = Math.max(r.total_in, expanded.length);
      for (let i = 0; i < slotCount; i++) {
        cells.push({ roundNum: r.round_number, order: expanded[i] ?? null });
      }
    }
    return cells;
  });

  const maxRows = Math.max(0, ...sizeCells.map((c) => c.length));
  const hasOverflow = sizes.some((s) => s.remaining < 0);

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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-13">
          <tbody>
            {isOpen && maxRows > 0 && (
              <>
                {/* 헤더 행: 사이즈 */}
                <tr className="bg-gray-100">
                  {sizes.map((s) => (
                    <th
                      key={s.size}
                      className={[
                        "px-2 py-2 text-center font-medium min-w-17.5",
                        s.stock > 0 ? "border-[0.5px] border-gray-200" : "text-gray-300",
                      ].join(" ")}
                    >
                      {s.size} ({s.stock})
                    </th>
                  ))}
                </tr>

                {/* 데이터 행: 각 셀마다 해당 round 배경색 */}
                {Array.from({ length: maxRows }).map((_, rowIdx) => (
                  <tr key={rowIdx} className="h-9">
                    {sizeCells.map((cells, sizeIdx) => {
                      const cell = cells[rowIdx];
                      const bg = getRoundBg(cell?.roundNum ?? null);

                      if (!cell) {
                        return (
                          <td
                            key={sizes[sizeIdx].size}
                            className="px-2 py-1.5 border-0"
                          />
                        );
                      }

                      const { order } = cell;

                      if (!order) {
                        return (
                          <td
                            key={sizes[sizeIdx].size}
                            className={`px-2 py-1.5 text-center text-gray-400 border-[0.5px] border-gray-200 ${bg}`}
                          >
                            -
                          </td>
                        );
                      }

                      const isOutOfStock = order.status === 'out_of_stock';
                      const isReserved = order.status === 'reserved';

                      return (
                        <td
                          key={sizes[sizeIdx].size}
                          className={[
                            "px-2 py-1.5 text-center text-13 border-[0.5px] border-gray-200",
                            isOutOfStock ? "outline-1 outline-red-400 bg-red-50 relative z-10" : bg,
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
                              <span className="text-11 text-blue-500 font-medium">예약</span>
                            )}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* 여백 행 */}
                <tr>
                  {sizes.map((s) => <td key={s.size} className="py-2" />)}
                </tr>
              </>
            )}

            {/* 집계 행 (항상 표시) */}
            <tr className="bg-gray-50 font-medium">
              {sizes.map((s) => {
                const actualSold = s.rounds.reduce((sum, r) => sum + r.orders.length, 0);
                const surplus = s.stock - actualSold;
                return (
                  <td
                    key={s.size}
                    className={[
                      "px-2 py-1.5 text-center text-13",
                      s.stock > 0 ? "border-[0.5px] border-gray-200" : "text-gray-300",
                    ].join(" ")}
                  >
                    <div>{s.size} ({actualSold}/{s.stock})</div>
                    {s.stock > 0 && surplus !== 0 && (
                      <div className={surplus < 0 ? "text-red-600 font-bold" : "text-blue-600 font-bold"}>
                        {surplus < 0 ? `부족 ${Math.abs(surplus)}` : `재고 ${surplus}`}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
