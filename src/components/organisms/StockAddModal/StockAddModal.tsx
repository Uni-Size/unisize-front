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

type StockMap = Record<number, Record<string, string>>; // product_id → size → input value

export const StockAddModal = ({ isOpen, onClose, products, onSubmit }: StockAddModalProps) => {
  const [stockMap, setStockMap] = useState<StockMap>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 모달 열릴 때 현재 재고값으로 초기화
  useEffect(() => {
    if (!isOpen) return;
    const initial: StockMap = {};
    products.forEach((p) => {
      initial[p.product_id] = {};
      p.size_stats.forEach((s) => {
        initial[p.product_id][s.size] = String(s.stock);
      });
    });
    setStockMap(initial);
    setError(null);
  }, [isOpen, products]);

  const handleChange = (productId: number, size: string, value: string) => {
    setStockMap((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [size]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    const items: { product_id: number; size: string; stock: number }[] = [];
    for (const product of products) {
      for (const stat of product.size_stats) {
        const raw = stockMap[product.product_id]?.[stat.size] ?? '';
        const parsed = parseInt(raw, 10);
        if (isNaN(parsed) || parsed < 0) {
          setError(`"${product.display_name}" ${stat.size} 사이즈 재고를 올바르게 입력하세요.`);
          return;
        }
        items.push({ product_id: product.product_id, size: stat.size, stock: parsed });
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
      width={900}
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
      <div className="flex flex-col gap-5 py-2">
        {error && (
          <p className="text-sm text-red-500 text-center">{error}</p>
        )}

        {products.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">조회된 품목이 없습니다.</p>
        ) : (
          products.map((product) => (
            <div key={product.product_id} className="flex flex-col gap-2">
              <div className="text-[14px] font-medium text-gray-700 px-1">
                {product.display_name}
              </div>
              <div className="overflow-x-auto">
                <table className="border-collapse text-[13px]">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-200 px-3 py-2 text-center font-medium text-gray-600 whitespace-nowrap w-16">
                        구분
                      </th>
                      {product.size_stats.map((stat) => (
                        <th
                          key={stat.size}
                          className="border border-gray-200 px-3 py-2 text-center font-medium text-gray-600 min-w-16"
                        >
                          {stat.size}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-blue-50">
                      <td className="border border-gray-200 px-3 py-2 text-center text-gray-500 whitespace-nowrap">
                        현재 재고
                      </td>
                      {product.size_stats.map((stat) => (
                        <td
                          key={stat.size}
                          className="border border-gray-200 px-3 py-2 text-center text-gray-700"
                        >
                          {stat.stock}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="border border-gray-200 px-3 py-2 text-center text-gray-500 whitespace-nowrap">
                        주문 수
                      </td>
                      {product.size_stats.map((stat) => (
                        <td
                          key={stat.size}
                          className={[
                            'border border-gray-200 px-3 py-2 text-center',
                            stat.remaining < 0 ? 'text-red-600 font-bold' : 'text-gray-700',
                          ].join(' ')}
                        >
                          {stat.ordered}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="border border-gray-200 px-3 py-2 text-center text-gray-500 whitespace-nowrap">
                        잔여
                      </td>
                      {product.size_stats.map((stat) => (
                        <td
                          key={stat.size}
                          className={[
                            'border border-gray-200 px-3 py-2 text-center',
                            stat.remaining < 0 ? 'text-red-600 font-bold' : 'text-blue-600',
                          ].join(' ')}
                        >
                          {stat.remaining}
                        </td>
                      ))}
                    </tr>
                    <tr className="bg-yellow-50">
                      <td className="border border-gray-200 px-3 py-2 text-center text-gray-700 font-medium whitespace-nowrap">
                        변경 재고
                      </td>
                      {product.size_stats.map((stat) => (
                        <td key={stat.size} className="border border-gray-200 px-1 py-1">
                          <input
                            type="number"
                            min={0}
                            value={stockMap[product.product_id]?.[stat.size] ?? ''}
                            onChange={(e) =>
                              handleChange(product.product_id, stat.size, e.target.value)
                            }
                            className="w-full text-center text-[13px] border border-gray-300 rounded px-1 py-1 focus:outline-none focus:border-blue-400 bg-white"
                          />
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
};
