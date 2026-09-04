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
    /** max(0, ordered - stock). 서버가 계산해 내려준다. 프론트에서 다시 유도하지 않는다. */
    reserved: number;
    /**
     * 입고 이력이 한 번도 없는 사이즈 칸인가. 서버 계약(is_unstocked)을 그대로 쓴다.
     * stock === 0 으로 유추하면 "입고했다가 전부 나간 사이즈"와 구분되지 않는다.
     */
    isUnstocked: boolean;
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
      existing.reserved += stat.reserved ?? 0;
      // 하나라도 입고 이력이 있으면 그 사이즈는 미입고가 아니다.
      existing.isUnstocked = existing.isUnstocked && (stat.is_unstocked ?? false);
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
        reserved: stat.reserved ?? 0,
        isUnstocked: stat.is_unstocked ?? false,
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
    // 입고 이력이 있으면 재고 슬롯 안에 배치, 미입고(is_unstocked)면 전부 초과(빨간색)
    if (s.rounds.length === 0 && s.orders.length > 0) {
      const expanded: InventoryOrder[] = [];
      for (const o of s.orders) {
        for (let q = 0; q < (o.quantity ?? 1); q++) expanded.push(o);
      }
      const slotCount = Math.max(s.stock, expanded.length);
      for (let i = 0; i < slotCount; i++) {
        const o = expanded[i];
        const overflow = s.isUnstocked || i >= s.stock;
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
  // 예약 = 재고보다 많이 들어온 주문. unisize는 재고가 없어도 주문을 막지 않고 예약으로 받으므로
  // (reservation-over-rejection) "재고 부족"이 아니라 "예약"으로 표기한다. 재고 부족이라고 쓰면
  // 주문이 막혔다는 오해를 준다.
  const totalReserved = sizes.reduce((sum, s) => sum + s.reserved, 0);
  const hasReserved = sizes.some((s) => s.reserved > 0);
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
            {hasReserved && (
              <span className="text-11 text-blue-700 font-medium bg-blue-050 border border-blue-700/20 rounded px-1.5 py-0.5">
                예약 {totalReserved}건
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
                        s.isUnstocked ? "text-gray-300" : "border-[0.5px] border-gray-200",
                      ].join(" ")}
                    >
                      <div className="flex flex-col items-center gap-0.5">
                        {/* 미입고 칸은 재고 숫자 대신 "-". 입고 이력이 있는데 0인 칸은 "0"으로 구분된다. */}
                        <span>{s.size} ({s.isUnstocked ? "-" : s.stock})</span>
                        {(s.isUnstocked || s.reserved > 0) && (
                          <span className="flex flex-wrap justify-center gap-0.5">
                            {s.isUnstocked && (
                              <span className="text-11 font-medium text-gray-600 bg-gray-100 rounded px-1 py-px whitespace-nowrap">
                                미입고
                              </span>
                            )}
                            {s.reserved > 0 && (
                              <span className="text-11 font-medium text-blue-700 bg-blue-050 rounded px-1 py-px whitespace-nowrap">
                                예약 {s.reserved}
                              </span>
                            )}
                          </span>
                        )}
                      </div>
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
                      s.isUnstocked ? "text-gray-300" : "border-[0.5px] border-gray-200",
                    ].join(" ")}
                  >
                    <div>{s.size} ({totalOrdered}/{s.isUnstocked ? "-" : s.stock})</div>
                    {/*
                      재고를 넘긴 주문은 "부족"이 아니라 "예약"이다 — 측정 기간에는 재고가 없어도
                      주문을 받아 예약으로 쌓고, 측정 종료 후 관리자가 취합해 추가 발주한다.
                      수치는 서버가 내려준 reserved를 그대로 쓴다(사이즈 헤더의 배지와 항상 일치).
                    */}
                    {s.reserved > 0 ? (
                      <div className="text-blue-700 font-bold">예약 {s.reserved}</div>
                    ) : !s.isUnstocked && surplus > 0 ? (
                      <div className="text-blue-600 font-bold">재고 {surplus}</div>
                    ) : null}
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
