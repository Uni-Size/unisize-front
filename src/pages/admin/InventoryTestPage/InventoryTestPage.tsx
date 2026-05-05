import { useState } from 'react';
import { OrderSizeTable } from '@components/organisms/OrderSizeTable';
import { StockAddModal } from '@components/organisms/StockAddModal';
import { Button } from '@components/atoms/Button';
import { AdminLayout } from '@components/templates/AdminLayout';
import type { InventoryProduct } from '@/api/order';
import { INITIAL_PRODUCTS } from './inventoryDummyData';

// ── 컴포넌트 ───────────────────────────────────────────────────

type ScenarioKey = 'hasStock' | 'noStock' | 'empty';
type SeasonTab = '동복' | '하복';

const SCENARIOS: { key: ScenarioKey; label: string; description: string }[] = [
  { key: 'hasStock', label: '품목 재고 있음',    description: '재고가 있는 품목들 (재고 부족 포함)' },
  { key: 'noStock',  label: '품목 재고 없음',    description: '모든 품목의 재고가 0인 상태' },
  { key: 'empty',    label: '품목 데이터 없음',  description: '조회된 데이터 자체가 없는 상태' },
];

function getSeasonTab(product: InventoryProduct): SeasonTab {
  return product.season === 'S' ? '하복' : '동복';
}

export const InventoryTestPage = () => {
  const [scenario, setScenario] = useState<ScenarioKey>('hasStock');
  const [seasonTab, setSeasonTab] = useState<SeasonTab>('동복');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState<InventoryProduct[]>(INITIAL_PRODUCTS);
  const [selectedProducts, setSelectedProducts] = useState<string[]>(['전체']);

  const displayProducts =
    scenario === 'hasStock' ? products :
    scenario === 'noStock'  ? products.map((p) => ({
        ...p,
        size_stats: p.size_stats.map((s) => ({ ...s, stock: 0, ordered: 0, remaining: 0, orders: [] })),
      })) :
    [];

  const seasonProducts = displayProducts.filter((p) => getSeasonTab(p) === seasonTab);
  const productOptions = ['전체', ...seasonProducts.map((p) => p.display_name)];

  const toggleProduct = (opt: string) => {
    if (opt === '전체') {
      setSelectedProducts((prev) => (prev.includes('전체') ? [] : ['전체']));
      return;
    }
    const next = selectedProducts.filter((p) => p !== '전체');
    const updated = next.includes(opt) ? next.filter((p) => p !== opt) : [...next, opt];
    const individuals = productOptions.filter((o) => o !== '전체');
    setSelectedProducts(updated.length === individuals.length ? ['전체'] : updated);
  };

  const handleSeasonTabChange = (tab: SeasonTab) => {
    setSeasonTab(tab);
    setSelectedProducts(['전체']);
  };

  const visibleProducts = selectedProducts.includes('전체')
    ? seasonProducts
    : seasonProducts.filter((p) => selectedProducts.includes(p.display_name));

  const handleStockSubmit = async (items: { product_id: number; size: string; stock: number }[]) => {
    // 더미 저장: API 대신 로컬 state 업데이트
    setProducts((prev) =>
      prev.map((product) => ({
        ...product,
        size_stats: product.size_stats.map((stat) => {
          const item = items.find(
            (i) => i.product_id === product.product_id && i.size === stat.size
          );
          if (!item) return stat;
          const newStock = item.stock;
          return {
            ...stat,
            stock: newStock,
            remaining: newStock - stat.ordered,
          };
        }),
      }))
    );
  };

  return (
    <AdminLayout>
    <div className="flex flex-col gap-5">
      {/* 테스트 배너 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2.5">
        <div className="flex items-center gap-2 text-yellow-800 text-13">
          <span className="font-semibold">🧪 테스트 페이지</span>
          <span>—</span>
          <span>더미 데이터로 재고 관리 화면을 미리 확인합니다.</span>
        </div>
      </div>
        {/* 시나리오 선택 */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-13 font-semibold text-gray-600 mb-3">시나리오 선택</p>
          <div className="flex gap-3 flex-wrap">
            {SCENARIOS.map(({ key, label, description }) => (
              <button
                key={key}
                type="button"
                onClick={() => setScenario(key)}
                className={[
                  'flex flex-col items-start px-4 py-2.5 rounded-lg border text-left transition-colors',
                  scenario === key
                    ? 'border-blue-400 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50',
                ].join(' ')}
              >
                <span className="text-13 font-medium">{label}</span>
                <span className="text-11 text-gray-500 mt-0.5">{description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 재고 관리 본문 */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {/* 헤더 */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 bg-gray-50">
            <span className="text-15 font-semibold text-gray-800">테스트 초등학교 · 주문/예약</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="flex items-center justify-center h-8.5 px-4 bg-white border border-gray-300 rounded-lg text-14 text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap"
              >
                재고 추가
              </button>
              <button
                type="button"
                className="flex items-center justify-center h-8.5 px-4 bg-white border border-gray-300 rounded-lg text-14 text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap"
                disabled
              >
                CSV 내보내기
              </button>
            </div>
          </div>

          {/* 동복/하복 탭 */}
          <div className="flex border-b border-gray-200">
            {(['동복', '하복'] as SeasonTab[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => handleSeasonTabChange(tab)}
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

          {/* 품목 필터 */}
          <div className="border-b border-gray-200">
            <div className="flex items-stretch">
              <div className="flex items-center justify-center min-w-25 px-4 py-3 bg-gray-100 text-14 font-medium text-gray-700 border-r border-gray-200">
                품목
              </div>
              <div className="flex items-center gap-4 flex-1 px-4 py-3 bg-white flex-wrap">
                {productOptions.map((opt) => (
                  <label key={opt} className="flex items-center gap-1.5 text-14 text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(opt) || selectedProducts.includes('전체')}
                      onChange={() => toggleProduct(opt)}
                      className="w-4 h-4 accent-gray-500"
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* 초기화 버튼 */}
          <div className="flex justify-center gap-3 py-3 border-b border-gray-100">
            <Button
              variant="outline"
              className="w-auto px-8 py-2.5 bg-gray-400! text-white! border-gray-400! hover:bg-gray-500!"
              onClick={() => setSelectedProducts(['전체'])}
            >
              초기화
            </Button>
          </div>

          {/* 품목 리스트 */}
          <div className="px-0">
            {scenario === 'empty' ? (
              <div className="flex items-center justify-center py-20 text-gray-400 text-14">
                주문/예약 데이터가 없습니다.
              </div>
            ) : visibleProducts.length > 0 ? (
              visibleProducts.map((product) => (
                <OrderSizeTable key={product.product_id} product={product} />
              ))
            ) : (
              <div className="flex items-center justify-center py-20 text-gray-400 text-14">
                선택된 품목이 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 재고 추가 모달 */}
      <StockAddModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        products={scenario === 'empty' ? [] : products}
        onSubmit={handleStockSubmit}
      />
    </AdminLayout>
  );
};
