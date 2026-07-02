import { useState, useEffect } from "react";
import { Modal } from "@components/atoms/Modal";
import { Button } from "@components/atoms/Button";
import type { InventoryProduct } from "@/api/order";

const EXCLUDED_STATUSES = new Set(["receipt", "delivered", "shipped"]);

export interface StockAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: InventoryProduct[];
  onSubmit: (
    items: {
      product_id: string;
      size: string;
      size_type?: "numeric" | "alpha" | "free";
      stock: number;
      round_number?: number;
    }[],
  ) => Promise<void>;
}

interface NewRound {
  id: number;
  roundNumber: number;
  values: Record<string, string>;
}

type NewRoundMap = Record<string, NewRound[]>; // product_id → new rounds

type SeasonTab = "동복" | "하복";

function roundLabel(roundNumber: number): string {
  return roundNumber === 0 ? "이월" : `${roundNumber}차`;
}

export const StockAddModal = ({
  isOpen,
  onClose,
  products,
  onSubmit,
}: StockAddModalProps) => {
  const [newRoundMap, setNewRoundMap] = useState<NewRoundMap>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seasonTab, setSeasonTab] = useState<SeasonTab>("동복");

  const hasDongbok = products.some((p) => p.season === "W");
  const hasHabok = products.some((p) => p.season === "S");
  const tabProducts = products.filter((p) =>
    seasonTab === "동복" ? p.season === "W" : p.season === "S",
  );

  useEffect(() => {
    if (!isOpen) return;
    const initial: NewRoundMap = {};
    products.forEach((p) => { initial[p.product_id] = []; });
    setNewRoundMap(initial);
  }, [isOpen, products]);

  function makeNewRound(roundNumber: number, sizes: string[]): NewRound {
    const values: Record<string, string> = {};
    sizes.forEach((s) => {
      values[s] = "0";
    });
    return { id: Date.now() + Math.random(), roundNumber, values };
  }

  function addRound(productId: string, sizes: string[]) {
    setNewRoundMap((prev) => {
      const rounds = prev[productId] ?? [];
      const maxNum = rounds.reduce((m, r) => Math.max(m, r.roundNumber), 0);
      return {
        ...prev,
        [productId]: [...rounds, makeNewRound(maxNum + 1, sizes)],
      };
    });
  }

  function removeRound(productId: string, roundId: number) {
    setNewRoundMap((prev) => {
      const rounds = (prev[productId] ?? []).filter((r) => r.id !== roundId);
      return { ...prev, [productId]: rounds };
    });
  }

  function handleValueChange(
    productId: string,
    roundId: number,
    size: string,
    value: string,
  ) {
    setNewRoundMap((prev) => {
      const rounds = (prev[productId] ?? []).map((r) =>
        r.id === roundId ? { ...r, values: { ...r.values, [size]: value } } : r,
      );
      return { ...prev, [productId]: rounds };
    });
  }

  function getNewRoundTotal(round: NewRound, size: string): number {
    return parseInt(round.values[size] ?? "0", 10) || 0;
  }

  // 서버 rounds 합계 + 새 rounds 합계
  function getFinalStock(product: InventoryProduct, size: string): number {
    const stat = product.size_stats.find((s) => s.size === size);
    const serverTotal = (stat?.rounds ?? []).reduce(
      (sum, r) => sum + r.total_in,
      0,
    );
    const newTotal = (newRoundMap[product.product_id] ?? []).reduce(
      (sum, r) => sum + getNewRoundTotal(r, size),
      0,
    );
    return serverTotal + newTotal;
  }

  const handleSubmit = async () => {
    const items: {
      product_id: string;
      size: string;
      size_type?: "numeric" | "alpha" | "free";
      stock: number;
      round_number?: number;
    }[] = [];

    for (const product of products) {
      const sizes = Array.from(new Set(product.size_stats.map((s) => s.size)))
        .sort((a, b) => (parseFloat(a) || 0) - (parseFloat(b) || 0));
      const newRounds = newRoundMap[product.product_id] ?? [];

      for (const round of newRounds) {
        for (const size of sizes) {
          const qty = getNewRoundTotal(round, size);
          if (qty === 0) continue;
          items.push({
            product_id: product.product_id,
            size,
            size_type: product.size_type,
            stock: qty,
            round_number: round.roundNumber,
          });
        }
      }
    }

    if (items.length === 0) {
      setError("추가할 재고가 없습니다.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSubmit(items);
      onClose();
    } catch {
      setError("저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="재고 추가"
      width={1000}
      actions={
        <>
          <Button
            variant="outline"
            className="w-auto px-8"
            onClick={onClose}
            disabled={saving}
          >
            취소
          </Button>
          <Button
            variant="primary"
            className="w-auto px-8"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? "저장 중..." : "저장"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-6 py-2">
        {error && <p className="text-sm text-red-500 text-center">{error}</p>}

        {/* 동복/하복 탭 */}
        {(hasDongbok || hasHabok) && (
          <div className="flex border-b border-gray-200 -mb-3">
            {(["동복", "하복"] as SeasonTab[])
              .filter((tab) => (tab === "동복" ? hasDongbok : hasHabok))
              .map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setSeasonTab(tab)}
                  className={[
                    "px-6 py-2.5 text-14 font-medium transition-colors border-b-2 -mb-px",
                    seasonTab === tab
                      ? "border-gray-800 text-gray-800"
                      : "border-transparent text-gray-400 hover:text-gray-600",
                  ].join(" ")}
                >
                  {tab}
                </button>
              ))}
          </div>
        )}

        {products.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            조회된 품목이 없습니다.
          </p>
        ) : tabProducts.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            해당 시즌의 품목이 없습니다.
          </p>
        ) : (
          tabProducts.map((product) => {
            const sizes = Array.from(new Set(product.size_stats.map((s) => s.size)))
              .sort((a, b) => (parseFloat(a) || 0) - (parseFloat(b) || 0));
            const newRounds = newRoundMap[product.product_id] ?? [];

            // 서버에서 내려온 모든 round_number 집합 (사이즈 통합)
            const serverRoundNums = Array.from(
              new Set(
                product.size_stats.flatMap((s) =>
                  (s.rounds ?? []).map((r) => r.round_number),
                ),
              ),
            ).sort((a, b) => a - b);

            return (
              <div key={product.product_id} className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-14 font-semibold text-gray-800">
                    {product.display_name}
                  </span>
                  <button
                    type="button"
                    onClick={() => addRound(product.product_id, sizes)}
                    className="flex items-center gap-1 text-13 text-blue-600 border border-blue-300 rounded px-3 py-1 hover:bg-blue-50 transition-colors"
                  >
                    + 차수 추가
                  </button>
                </div>

                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="border-collapse text-13 w-full">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border-b border-r border-gray-200 px-2 py-2 text-center font-medium text-gray-600 whitespace-nowrap w-20 sticky left-0 bg-gray-100 z-10">
                          구분
                        </th>
                        {sizes.map((size) => (
                          <th
                            key={size}
                            className="border-b border-r border-gray-200 px-2 py-2 text-center font-medium text-gray-600 min-w-14"
                          >
                            {size}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {/* 서버 rounds (읽기 전용) */}
                      {serverRoundNums.map((rNum) => (
                        <tr key={rNum} className="bg-gray-50">
                          <td className="border-b border-r border-gray-200 px-2 py-2 text-center text-gray-500 whitespace-nowrap sticky left-0 bg-gray-50 z-10">
                            {roundLabel(rNum)}
                          </td>
                          {sizes.map((size) => {
                            const stat = product.size_stats.find(
                              (s) => s.size === size,
                            );
                            const found = (stat?.rounds ?? []).find(
                              (r) => r.round_number === rNum,
                            );
                            return (
                              <td
                                key={size}
                                className="border-b border-r border-gray-200 px-2 py-2 text-center text-gray-600"
                              >
                                {found?.total_in ?? 0}
                              </td>
                            );
                          })}
                        </tr>
                      ))}

                      {/* 새 차수 입력 (편집 가능) */}
                      {newRounds.map((round) => (
                        <tr key={round.id} className="bg-blue-50">
                          <td className="border-b border-r border-gray-200 px-2 py-1 text-center whitespace-nowrap sticky left-0 z-10 bg-blue-50">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-medium text-13 text-blue-700">
                                {roundLabel(round.roundNumber)}
                              </span>
                              {newRounds.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeRound(product.product_id, round.id)
                                  }
                                  className="text-gray-400 hover:text-red-400 text-12 leading-none"
                                  title="차수 삭제"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          </td>
                          {sizes.map((size) => (
                            <td
                              key={size}
                              className="border-b border-r border-gray-200 px-1 py-1"
                            >
                              <input
                                type="number"
                                min={0}
                                value={round.values[size] ?? "0"}
                                onChange={(e) =>
                                  handleValueChange(
                                    product.product_id,
                                    round.id,
                                    size,
                                    e.target.value,
                                  )
                                }
                                onFocus={(e) => e.target.select()}
                                className="w-full text-center text-13 border border-blue-200 rounded px-1 py-1 focus:outline-none focus:border-blue-400 bg-white min-w-12"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}

                      {/* 최종 주문 합계 */}
                      <tr className="bg-yellow-50">
                        <td className="border-b-2 border-r border-gray-300 px-2 py-2 text-center text-gray-700 font-semibold whitespace-nowrap sticky left-0 bg-yellow-50 z-10">
                          최종
                        </td>
                        {sizes.map((size) => {
                          const final = getFinalStock(product, size);
                          return (
                            <td
                              key={size}
                              className={[
                                "border-b-2 border-r border-gray-300 px-2 py-2 text-center font-semibold",
                                final < 0 ? "text-red-600" : "text-gray-800",
                              ].join(" ")}
                            >
                              {final}
                            </td>
                          );
                        })}
                      </tr>

                      {/* 예약/주문 현황 섹션 */}
                      {(() => {
                        const sizeStats = sizes.map((size) => {
                          const stat = product.size_stats.find(
                            (s) => s.size === size,
                          );
                          const visible = (stat?.orders ?? []).filter(
                            (o) => !EXCLUDED_STATUSES.has(o.status),
                          );
                          const normal = visible.filter(
                            (o) =>
                              o.status !== "out_of_stock" &&
                              o.status !== "reserved",
                          );
                          const reserved = visible.filter(
                            (o) => o.status === "reserved",
                          );
                          const outOfStock = visible.filter(
                            (o) => o.status === "out_of_stock",
                          );
                          const actualSold =
                            normal.length + reserved.length + outOfStock.length;
                          const stock = getFinalStock(product, size);
                          const surplus = stock - actualSold;
                          return {
                            size,
                            stock,
                            actualSold,
                            reserved: reserved.length,
                            outOfStock: outOfStock.length,
                            surplus,
                          };
                        });

                        return (
                          <>
                            <tr className="bg-gray-100">
                              <th
                                className="border-b border-r border-gray-200 px-2 py-1.5 text-left text-11 font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap sticky left-0 bg-gray-100 z-10"
                                colSpan={sizes.length + 1}
                              >
                                주문 현황
                              </th>
                            </tr>
                            <tr className="bg-gray-50">
                              <td className="border-b border-r border-gray-200 px-2 py-2 text-center text-gray-500 whitespace-nowrap sticky left-0 bg-gray-50 z-10">
                                주문/재고
                              </td>
                              {sizeStats.map(({ size, actualSold, stock }) => (
                                <td
                                  key={size}
                                  className="border-b border-r border-gray-200 px-2 py-2 text-center text-gray-700 font-medium"
                                >
                                  {actualSold}/{stock}
                                </td>
                              ))}
                            </tr>
                            <tr>
                              <td className="border-b border-r border-gray-200 px-2 py-2 text-center text-gray-500 whitespace-nowrap sticky left-0 bg-white z-10">
                                예약
                              </td>
                              {sizeStats.map(({ size, reserved }) => (
                                <td
                                  key={size}
                                  className="border-b border-r border-gray-200 px-2 py-2 text-center text-blue-600"
                                >
                                  {reserved > 0 ? (
                                    reserved
                                  ) : (
                                    <span className="text-gray-300">-</span>
                                  )}
                                </td>
                              ))}
                            </tr>
                            <tr>
                              <td className="border-b border-r border-gray-200 px-2 py-2 text-center text-gray-500 whitespace-nowrap sticky left-0 bg-white z-10">
                                품절
                              </td>
                              {sizeStats.map(({ size, outOfStock }) => (
                                <td
                                  key={size}
                                  className={[
                                    "border-b border-r border-gray-200 px-2 py-2 text-center",
                                    outOfStock > 0
                                      ? "text-red-600 font-bold"
                                      : "",
                                  ].join(" ")}
                                >
                                  {outOfStock > 0 ? (
                                    outOfStock
                                  ) : (
                                    <span className="text-gray-300">-</span>
                                  )}
                                </td>
                              ))}
                            </tr>
                            <tr className="bg-gray-50">
                              <td className="border-r border-gray-200 px-2 py-2 text-center text-gray-500 whitespace-nowrap sticky left-0 bg-gray-50 z-10">
                                잔여
                              </td>
                              {sizeStats.map(({ size, surplus }) => (
                                <td
                                  key={size}
                                  className={[
                                    "border-r border-gray-200 px-2 py-2 text-center font-bold",
                                    surplus < 0
                                      ? "text-red-600"
                                      : surplus === 0
                                        ? "text-gray-300"
                                        : "text-blue-600",
                                  ].join(" ")}
                                >
                                  {surplus === 0
                                    ? "-"
                                    : surplus < 0
                                      ? `부족 ${Math.abs(surplus)}`
                                      : `여유 ${surplus}`}
                                </td>
                              ))}
                            </tr>
                          </>
                        );
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Modal>
  );
};
