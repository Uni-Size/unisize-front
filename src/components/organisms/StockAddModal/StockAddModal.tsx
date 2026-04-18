import { useState, useEffect } from 'react';
import { Modal } from '@components/atoms/Modal';
import { Button } from '@components/atoms/Button';
import type { InventoryProduct } from '@/api/order';

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

export const StockAddModal = ({ isOpen, onClose, products, onSubmit }: StockAddModalProps) => {
  const [roundMap, setRoundMap] = useState<RoundMap>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

        {products.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">조회된 품목이 없습니다.</p>
        ) : (
          products.map((product) => {
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

                <div className="overflow-x-auto">
                  <table className="border-collapse text-13 w-full">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-200 px-2 py-2 text-center font-medium text-gray-600 whitespace-nowrap w-20 sticky left-0 bg-gray-100 z-10">
                          구분
                        </th>
                        {sizes.map((size) => (
                          <th key={size} className="border border-gray-200 px-2 py-2 text-center font-medium text-gray-600 min-w-14">
                            {size}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {/* 현재 재고 */}
                      <tr className="bg-gray-50">
                        <td className="border border-gray-200 px-2 py-2 text-center text-gray-500 whitespace-nowrap sticky left-0 bg-gray-50 z-10">
                          현재 재고
                        </td>
                        {sizes.map((size) => {
                          const stat = product.size_stats.find((s) => s.size === size);
                          return (
                            <td key={size} className="border border-gray-200 px-2 py-2 text-center text-gray-700">
                              {stat?.stock ?? 0}
                            </td>
                          );
                        })}
                      </tr>

                      {/* 차수별 입력 행 */}
                      {rounds.map((round) => (
                        <tr key={round.id} className="bg-blue-50">
                          <td className="border border-gray-200 px-2 py-1 text-center whitespace-nowrap sticky left-0 bg-blue-50 z-10">
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
                            <td key={size} className="border border-gray-200 px-1 py-1">
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

                      {/* 최종 재고 */}
                      <tr className="bg-yellow-50">
                        <td className="border border-gray-200 px-2 py-2 text-center text-gray-700 font-semibold whitespace-nowrap sticky left-0 bg-yellow-50 z-10">
                          최종 재고
                        </td>
                        {sizes.map((size) => {
                          const final = getFinalStock(product, size);
                          return (
                            <td
                              key={size}
                              className={[
                                'border border-gray-200 px-2 py-2 text-center font-semibold',
                                final < 0 ? 'text-red-600' : 'text-gray-800',
                              ].join(' ')}
                            >
                              {final}
                            </td>
                          );
                        })}
                      </tr>
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
