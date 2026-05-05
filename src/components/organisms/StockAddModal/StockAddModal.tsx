import { useState, useEffect } from 'react';
import { Modal } from '@components/atoms/Modal';
import { Button } from '@components/atoms/Button';
import type { InventoryProduct } from '@/api/order';

const EXCLUDED_STATUSES = new Set(['receipt', 'delivered', 'shipped']);

export interface StockAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: InventoryProduct[];
  onSubmit: (items: { product_id: number; size: string; stock: number }[]) => Promise<void>;
}


interface Round {
  id: number;
  label: string;
  // size → input value
  values: Record<string, string>;
}

type RoundMap = Record<number, Round[]>; // product_id → rounds

type SeasonTab = '동복' | '하복';

export const StockAddModal = ({ isOpen, onClose, products, onSubmit }: StockAddModalProps) => {
  const [roundMap, setRoundMap] = useState<RoundMap>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seasonTab, setSeasonTab] = useState<SeasonTab>('동복');

  const hasDongbok = products.some((p) => p.season === 'W');
  const hasHabok = products.some((p) => p.season === 'S');
  const tabProducts = products.filter((p) => (seasonTab === '동복' ? p.season === 'W' : p.season === 'S'));

  useEffect(() => {
    if (!isOpen) return;
    const initial: RoundMap = {};
    products.forEach((p) => {
      initial[p.product_id] = [makeRound(1, p.size_stats.map((s) => s.size))];
    });
    setRoundMap(initial);
    setError(null);
  }, [isOpen, products]);

  function makeRound(roundNumber: number, sizes: string[]): Round {
    const values: Record<string, string> = {};
    sizes.forEach((s) => { values[s] = '0'; });
    return { id: Date.now() + Math.random(), label: `${roundNumber}차`, values };
  }

  function addRound(productId: number, sizes: string[]) {
    setRoundMap((prev) => {
      const rounds = prev[productId] ?? [];
      return { ...prev, [productId]: [...rounds, makeRound(rounds.length + 1, sizes)] };
    });
  }

  function removeRound(productId: number, roundId: number) {
    setRoundMap((prev) => {
      const rounds = (prev[productId] ?? []).filter((r) => r.id !== roundId);
      // 차수 레이블 재번호
      const relabeled = rounds.map((r, i) => ({ ...r, label: `${i + 1}차` }));
      return { ...prev, [productId]: relabeled };
    });
  }

  function handleValueChange(productId: number, roundId: number, size: string, value: string) {
    setRoundMap((prev) => {
      const rounds = (prev[productId] ?? []).map((r) =>
        r.id === roundId ? { ...r, values: { ...r.values, [size]: value } } : r
      );
      return { ...prev, [productId]: rounds };
    });
  }

  function getRoundTotal(round: Round, size: string): number {
    return parseInt(round.values[size] ?? '0', 10) || 0;
  }

  function getAllRoundsTotal(productId: number, size: string): number {
    return (roundMap[productId] ?? []).reduce((sum, r) => sum + getRoundTotal(r, size), 0);
  }

  function getFinalStock(product: InventoryProduct, size: string): number {
    const current = product.size_stats.find((s) => s.size === size)?.stock ?? 0;
    return current + getAllRoundsTotal(product.product_id, size);
  }

  const handleSubmit = async () => {
    const items: { product_id: number; size: string; stock: number }[] = [];

    for (const product of products) {
      const sizes = product.size_stats.map((s) => s.size);
      for (const size of sizes) {
        const final = getFinalStock(product, size);
        if (final < 0) {
          setError(`"${product.display_name}" ${size} 사이즈 최종 재고가 음수입니다.`);
          return;
        }
        items.push({ product_id: product.product_id, size, stock: final });
      }
    }

    setSaving(true);
    setError(null);
    try {
      await onSubmit(items);
      onClose();
    } catch {
      setError('저장 중 오류가 발생했습니다.');
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
          <Button variant="outline" className="w-auto px-8" onClick={onClose} disabled={saving}>
            취소
          </Button>
          <Button variant="primary" className="w-auto px-8" onClick={handleSubmit} disabled={saving}>
            {saving ? '저장 중...' : '저장'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-6 py-2">
        {error && <p className="text-sm text-red-500 text-center">{error}</p>}

        {/* 동복/하복 탭 */}
        {(hasDongbok || hasHabok) && (
          <div className="flex border-b border-gray-200 -mb-3">
            {(['동복', '하복'] as SeasonTab[]).filter((tab) => tab === '동복' ? hasDongbok : hasHabok).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setSeasonTab(tab)}
                className={[
                  'px-6 py-2.5 text-14 font-medium transition-colors border-b-2 -mb-px',
                  seasonTab === tab
                    ? 'border-gray-800 text-gray-800'
                    : 'border-transparent text-gray-400 hover:text-gray-600',
                ].join(' ')}
              >
                {tab}
              </button>
            ))}
          </div>
        )}

        {products.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">조회된 품목이 없습니다.</p>
        ) : tabProducts.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">해당 시즌의 품목이 없습니다.</p>
        ) : (
          tabProducts.map((product) => {
            const sizes = product.size_stats.map((s) => s.size);
            const rounds = roundMap[product.product_id] ?? [];

            return (
              <div key={product.product_id} className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-14 font-semibold text-gray-800">{product.display_name}</span>
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
                          <th key={size} className="border-b border-r border-gray-200 px-2 py-2 text-center font-medium text-gray-600 min-w-14">
                            {size}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {/* ── 재고 입력 섹션 ── */}
                      <tr className="bg-gray-50">
                        <td className="border-b border-r border-gray-200 px-2 py-2 text-center text-gray-500 whitespace-nowrap sticky left-0 bg-gray-50 z-10">
                          기존 재고<br />이월
                        </td>
                        {sizes.map((size) => {
                          const stat = product.size_stats.find((s) => s.size === size);
                          return (
                            <td key={size} className="border-b border-r border-gray-200 px-2 py-2 text-center text-gray-700">
                              {stat?.stock ?? 0}
                            </td>
                          );
                        })}
                      </tr>

                      {rounds.map((round) => (
                        <tr key={round.id} className="bg-blue-50">
                          <td className="border-b border-r border-gray-200 px-2 py-1 text-center whitespace-nowrap sticky left-0 bg-blue-50 z-10">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-blue-700 font-medium text-13">{round.label}</span>
                              {rounds.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeRound(product.product_id, round.id)}
                                  className="text-gray-400 hover:text-red-400 text-12 leading-none"
                                  title="차수 삭제"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          </td>
                          {sizes.map((size) => (
                            <td key={size} className="border-b border-r border-gray-200 px-1 py-1">
                              <input
                                type="number"
                                min={0}
                                value={round.values[size] ?? '0'}
                                onChange={(e) => handleValueChange(product.product_id, round.id, size, e.target.value)}
                                onFocus={(e) => e.target.select()}
                                className="w-full text-center text-13 border border-blue-200 rounded px-1 py-1 focus:outline-none focus:border-blue-400 bg-white min-w-12"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}

                      <tr className="bg-yellow-50">
                        <td className="border-b-2 border-r border-gray-300 px-2 py-2 text-center text-gray-700 font-semibold whitespace-nowrap sticky left-0 bg-yellow-50 z-10">
                          최종 주문
                        </td>
                        {sizes.map((size) => {
                          const final = getFinalStock(product, size);
                          return (
                            <td
                              key={size}
                              className={[
                                'border-b-2 border-r border-gray-300 px-2 py-2 text-center font-semibold',
                                final < 0 ? 'text-red-600' : 'text-gray-800',
                              ].join(' ')}
                            >
                              {final}
                            </td>
                          );
                        })}
                      </tr>

                      {/* ── 예약/주문 현황 섹션 ── */}
                      {(() => {
                        const sizeStats = sizes.map((size) => {
                          const stat = product.size_stats.find((s) => s.size === size);
                          const visible = (stat?.orders ?? []).filter((o) => !EXCLUDED_STATUSES.has(o.status));
                          const normal = visible.filter((o) => o.status !== 'out_of_stock' && o.status !== 'reserved');
                          const reserved = visible.filter((o) => o.status === 'reserved');
                          const outOfStock = visible.filter((o) => o.status === 'out_of_stock');
                          const actualSold = normal.length + reserved.length + outOfStock.length;
                          const stock = stat?.stock ?? 0;
                          const surplus = stock - actualSold;
                          return { size, stock, actualSold, reserved: reserved.length, outOfStock: outOfStock.length, surplus };
                        });

                        return (
                          <>
                            <tr className="bg-gray-100">
                              <th className="border-b border-r border-gray-200 px-2 py-1.5 text-left text-11 font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap sticky left-0 bg-gray-100 z-10" colSpan={sizes.length + 1}>
                                주문 현황
                              </th>
                            </tr>
                            <tr className="bg-gray-50">
                              <td className="border-b border-r border-gray-200 px-2 py-2 text-center text-gray-500 whitespace-nowrap sticky left-0 bg-gray-50 z-10">
                                주문/재고
                              </td>
                              {sizeStats.map(({ size, actualSold, stock }) => (
                                <td key={size} className="border-b border-r border-gray-200 px-2 py-2 text-center text-gray-700 font-medium">
                                  {actualSold}/{stock}
                                </td>
                              ))}
                            </tr>
                            <tr>
                              <td className="border-b border-r border-gray-200 px-2 py-2 text-center text-gray-500 whitespace-nowrap sticky left-0 bg-white z-10">
                                예약
                              </td>
                              {sizeStats.map(({ size, reserved }) => (
                                <td key={size} className="border-b border-r border-gray-200 px-2 py-2 text-center text-blue-600">
                                  {reserved > 0 ? reserved : <span className="text-gray-300">-</span>}
                                </td>
                              ))}
                            </tr>
                            <tr>
                              <td className="border-b border-r border-gray-200 px-2 py-2 text-center text-gray-500 whitespace-nowrap sticky left-0 bg-white z-10">
                                품절
                              </td>
                              {sizeStats.map(({ size, outOfStock }) => (
                                <td key={size} className={['border-b border-r border-gray-200 px-2 py-2 text-center', outOfStock > 0 ? 'text-red-600 font-bold' : ''].join(' ')}>
                                  {outOfStock > 0 ? outOfStock : <span className="text-gray-300">-</span>}
                                </td>
                              ))}
                            </tr>
                            <tr className="bg-gray-50">
                              <td className="border-r border-gray-200 px-2 py-2 text-center text-gray-500 whitespace-nowrap sticky left-0 bg-gray-50 z-10">
                                잔여
                              </td>
                              {sizeStats.map(({ size, surplus }) => (
                                <td key={size} className={['border-r border-gray-200 px-2 py-2 text-center font-bold', surplus < 0 ? 'text-red-600' : surplus === 0 ? 'text-gray-300' : 'text-blue-600'].join(' ')}>
                                  {surplus === 0 ? '-' : surplus < 0 ? `부족 ${Math.abs(surplus)}` : `여유 ${surplus}`}
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
