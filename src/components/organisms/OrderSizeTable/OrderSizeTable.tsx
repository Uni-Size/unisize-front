import { useState } from "react";
import type { InventoryProduct, InventoryOrder } from "@/api/order";

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

function getRoundBg(roundNum: number) {
  return ROUND_BG[roundNum] ?? 'bg-gray-50';
}

const sizeToNum = (size: string) => {
  const n = parseFloat(size);
  return isNaN(n) ? Infinity : n;
};

type CellInfo =
  | { kind: 'order'; roundNum: number; name: string; status: string }
  | { kind: 'empty'; roundNum: number }
  | { kind: 'unassigned'; name: string; status: string };

export const OrderSizeTable = ({ product }: OrderSizeTableProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // 같은 사이즈를 머지 (stock 합산, rounds 합치기, unassigned 합치기)
  const mergedMap = new Map<string, {
    size: string;
    stock: number;
    ordered: number;
    remaining: number;
    orders: InventoryOrder[];
    rounds: Array<{ round_number: number; total_in: number; orders: InventoryOrder[] }>;
    unassigned: InventoryOrder[];
  }>();

  for (const stat of product.size_stats) {
    const rounds = (stat.rounds ?? []).map((r) => ({
      round_number: r.round_number,
      total_in: r.total_in,
      orders: r.orders ?? [],
    }));
    const unassigned = stat.unassigned ?? [];
    const statOrders = stat.orders ?? [];

    const existing = mergedMap.get(stat.size);
    if (existing) {
      existing.stock += stat.stock;
      existing.ordered += stat.ordered;
      existing.remaining += stat.remaining;
      const seenOrders = new Set(existing.orders.map((o) => o.name));
      for (const o of statOrders) {
        if (!seenOrders.has(o.name)) { existing.orders.push(o); seenOrders.add(o.name); }
      }
      for (const r of rounds) {
        const ex = existing.rounds.find((er) => er.round_number === r.round_number);
        if (ex) {
          ex.total_in += r.total_in;
          const seenNames = new Set(ex.orders.map((o) => o.name));
          for (const o of r.orders) {
            if (!seenNames.has(o.name)) { ex.orders.push(o); seenNames.add(o.name); }
          }
        } else {
          existing.rounds.push({ ...r, orders: [...r.orders] });
        }
      }
      const seenUnassigned = new Set(existing.unassigned.map((o) => o.name));
      for (const o of unassigned) {
        if (!seenUnassigned.has(o.name)) { existing.unassigned.push(o); seenUnassigned.add(o.name); }
      }
    } else {
      mergedMap.set(stat.size, {
        size: stat.size,
        stock: stat.stock,
        ordered: stat.ordered,
        remaining: stat.remaining,
        orders: [...statOrders],
        rounds,
        unassigned: [...unassigned],
      });
    }
  }

  // 사이즈 오름차순 정렬
  const sizes = Array.from(mergedMap.values()).sort((a, b) => sizeToNum(a.size) - sizeToNum(b.size));

  // 사이즈별 셀 목록 생성
  // - rounds 순서대로 total_in 슬롯 생성, 그 안에 orders(quantity 반영) 배치
  // - unassigned는 맨 뒤에 빨간색으로 추가
  const sizeCells: CellInfo[][] = sizes.map((s) => {
    const cells: CellInfo[] = [];
    const sortedRounds = [...s.rounds].sort((a, b) => a.round_number - b.round_number);

    for (const r of sortedRounds) {
      // orders를 quantity만큼 펼치기
      const expanded: InventoryOrder[] = [];
      for (const o of r.orders) {
        for (let q = 0; q < (o.quantity ?? 1); q++) expanded.push(o);
      }
      const slotCount = Math.max(r.total_in, expanded.length);
      for (let i = 0; i < slotCount; i++) {
        const o = expanded[i];
        const overflow = i >= r.total_in; // total_in 초과분
        if (!o) {
          cells.push({ kind: 'empty', roundNum: r.round_number });
        } else if (overflow) {
          cells.push({ kind: 'unassigned', name: o.name, status: o.status });
        } else {
          cells.push({ kind: 'order', roundNum: r.round_number, name: o.name, status: o.status });
        }
      }
    }

    // rounds가 없는 경우 stat.orders를 직접 표시
    // stock > 0이면 슬롯 안에 배치, stock = 0이면 전부 초과(빨간색)
    if (s.rounds.length === 0 && s.orders.length > 0) {
      const expanded: InventoryOrder[] = [];
      for (const o of s.orders) {
        for (let q = 0; q < (o.quantity ?? 1); q++) expanded.push(o);
      }
      const slotCount = Math.max(s.stock, expanded.length);
      for (let i = 0; i < slotCount; i++) {
        const o = expanded[i];
        const overflow = s.stock === 0 || i >= s.stock;
        if (!o) {
          cells.push({ kind: 'empty', roundNum: 1 });
        } else if (overflow) {
          cells.push({ kind: 'unassigned', name: o.name, status: o.status });
        } else {
          cells.push({ kind: 'order', roundNum: 1, name: o.name, status: o.status });
        }
      }
    }

    // unassigned: 재고 초과 주문 (빨간색)
    for (const o of s.unassigned) {
      for (let q = 0; q < (o.quantity ?? 1); q++) {
        cells.push({ kind: 'unassigned', name: o.name, status: o.status });
      }
    }

    return cells;
  });

  const maxRows = Math.max(0, ...sizeCells.map((c) => c.length));
  const hasOverflow = sizes.some((s) => s.remaining < 0);
  const totalStock = sizes.reduce((sum, s) => sum + s.stock, 0);
  const totalOrdered = sizes.reduce((sum, s) => sum + s.ordered, 0);

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
        <table className="w-full border-collapse text-13 table-fixed">
          <colgroup>
            {sizes.map((s) => (
              <col key={s.size} style={{ width: `${100 / sizes.length}%` }} />
            ))}
          </colgroup>
          <tbody>
            {isOpen && (totalStock > 0 || totalOrdered > 0) && (
              <>
                {/* 헤더 행: 사이즈 (재고) */}
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

                {/* 데이터 행 */}
                {Array.from({ length: maxRows }).map((_, rowIdx) => (
                  <tr key={rowIdx} className="h-9">
                    {sizeCells.map((cells, sizeIdx) => {
                      const cell = cells[rowIdx];
                      const sizeKey = sizes[sizeIdx].size;

                      if (!cell) {
                        return <td key={sizeKey} className="px-2 py-1.5 border-0" />;
                      }

                      if (cell.kind === 'unassigned') {
                        return (
                          <td
                            key={sizeKey}
                            className="px-2 py-1.5 text-center text-13 border-[0.5px] border-gray-200 bg-red-50"
                          >
                            <span
                              className="block w-full text-center wrap-break-word leading-tight text-red-600 font-bold"
                              style={{ fontSize: 'clamp(9px, 1.5cqi, 13px)' }}
                            >
                              {cell.name}
                            </span>
                          </td>
                        );
                      }

                      if (cell.kind === 'empty') {
                        return (
                          <td
                            key={sizeKey}
                            className={`px-2 py-1.5 text-center text-gray-400 border-[0.5px] border-gray-200 ${getRoundBg(cell.roundNum)}`}
                          >
                            -
                          </td>
                        );
                      }

                      // kind === 'order'
                      const isOutOfStock = cell.status === 'out_of_stock';
                      const isReserved = cell.status === 'reserved';
                      const bg = getRoundBg(cell.roundNum);

                      return (
                        <td
                          key={sizeKey}
                          className={[
                            "px-2 py-1.5 text-center text-13 border-[0.5px] border-gray-200",
                            isOutOfStock ? "bg-red-50" : bg,
                          ].join(" ")}
                        >
                          <span
                            className={[
                              "block w-full text-center wrap-break-word leading-tight",
                              isOutOfStock ? "text-red-600 font-bold" : "",
                            ].join(" ")}
                            style={{ fontSize: 'clamp(9px, 1.5cqi, 13px)' }}
                          >
                            {cell.name}
                            {isReserved && (
                              <span className="text-11 text-blue-500 font-medium ml-0.5">예약</span>
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
                const assigned = s.rounds.reduce((sum, r) =>
                  sum + r.orders.reduce((s2, o) => s2 + (o.quantity ?? 1), 0), 0);
                const unassignedCount = s.unassigned.reduce((sum, o) => sum + (o.quantity ?? 1), 0);
                const totalOrdered = assigned + unassignedCount;
                const surplus = s.stock - totalOrdered;
                return (
                  <td
                    key={s.size}
                    className={[
                      "px-2 py-1.5 text-center text-13",
                      s.stock > 0 ? "border-[0.5px] border-gray-200" : "text-gray-300",
                    ].join(" ")}
                  >
                    <div>{s.size} ({totalOrdered}/{s.stock})</div>
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
