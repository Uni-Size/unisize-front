import { useState } from 'react';
import { OrderSizeTable } from '@components/organisms/OrderSizeTable';
import { StockAddModal } from '@components/organisms/StockAddModal';
import { Button } from '@components/atoms/Button';
import { AdminLayout } from '@components/templates/AdminLayout';
import type { InventoryProduct } from '@/api/order';

// ── 더미 데이터 ────────────────────────────────────────────────

const INITIAL_PRODUCTS: InventoryProduct[] = [
  {
    product_id: 1,
    display_name: '동복 상의 (후드)',
    category: 'uniform',
    size_stats: [
      { size: '85', stock: 5,  ordered: 2, remaining: 3,  orders: [{ name: '김민준', status: 'pending' }, { name: '이서연', status: 'reserved' }] },
      { size: '90', stock: 4,  ordered: 4, remaining: 0,  orders: [{ name: '박지훈', status: 'pending' }, { name: '최수아', status: 'pending' }, { name: '정우진', status: 'out_of_stock' }, { name: '강하은', status: 'reserved' }] },
      { size: '95', stock: 4,  ordered: 2, remaining: 2,  orders: [{ name: '윤도현', status: 'pending' }, { name: '임소율', status: 'pending' }] },
      { size: '100', stock: 3, ordered: 6, remaining: -3, orders: [{ name: '한기선', status: 'out_of_stock' }, { name: '오준서', status: 'out_of_stock' }, { name: '김태양', status: 'out_of_stock' }, { name: '신예린', status: 'pending' }, { name: '류현우', status: 'pending' }, { name: '백채원', status: 'pending' }] },
      { size: '105', stock: 4, ordered: 0, remaining: 4,  orders: [] },
      { size: '110', stock: 4, ordered: 1, remaining: 3,  orders: [{ name: '장민서', status: 'pending' }] },
      { size: '115', stock: 4, ordered: 1, remaining: 3,  orders: [{ name: '조하린', status: 'reserved' }] },
      { size: '120', stock: 2, ordered: 0, remaining: 2,  orders: [] },
      { size: '125', stock: 3, ordered: 4, remaining: -1, orders: [{ name: '권나연', status: 'out_of_stock' }, { name: '문성준', status: 'pending' }, { name: '손유진', status: 'pending' }, { name: '나도윤', status: 'pending' }] },
      { size: '130', stock: 2, ordered: 1, remaining: 1,  orders: [{ name: '홍길동', status: 'pending' }] },
    ],
  },
  {
    product_id: 2,
    display_name: '동복 하의 (바지)',
    category: 'uniform',
    size_stats: [
      { size: '62', stock: 3,  ordered: 1, remaining: 2, orders: [{ name: '김민준', status: 'pending' }] },
      { size: '65', stock: 3,  ordered: 2, remaining: 1, orders: [{ name: '이서연', status: 'pending' }, { name: '박지훈', status: 'pending' }] },
      { size: '68', stock: 4,  ordered: 3, remaining: 1, orders: [{ name: '최수아', status: 'pending' }, { name: '정우진', status: 'reserved' }, { name: '강하은', status: 'pending' }] },
      { size: '74', stock: 5,  ordered: 3, remaining: 2, orders: [{ name: '윤도현', status: 'pending' }, { name: '임소율', status: 'pending' }, { name: '한기선', status: 'pending' }] },
      { size: '80', stock: 4,  ordered: 1, remaining: 3, orders: [{ name: '오준서', status: 'pending' }] },
      { size: '86', stock: 3,  ordered: 0, remaining: 3, orders: [] },
      { size: '92', stock: 3,  ordered: 4, remaining: -1, orders: [{ name: '김태양', status: 'out_of_stock' }, { name: '신예린', status: 'pending' }, { name: '류현우', status: 'pending' }, { name: '백채원', status: 'pending' }] },
      { size: '98', stock: 2,  ordered: 0, remaining: 2, orders: [] },
    ],
  },
  {
    product_id: 3,
    display_name: '생활복 상의',
    category: 'casual',
    size_stats: [
      { size: '85',  stock: 4, ordered: 1, remaining: 3, orders: [{ name: '최수아', status: 'pending' }] },
      { size: '90',  stock: 5, ordered: 2, remaining: 3, orders: [{ name: '김민준', status: 'pending' }, { name: '이서연', status: 'pending' }] },
      { size: '95',  stock: 3, ordered: 1, remaining: 2, orders: [{ name: '박지훈', status: 'pending' }] },
      { size: '100', stock: 4, ordered: 1, remaining: 3, orders: [{ name: '정우진', status: 'reserved' }] },
      { size: '105', stock: 4, ordered: 0, remaining: 4, orders: [] },
      { size: '110', stock: 3, ordered: 1, remaining: 2, orders: [{ name: '강하은', status: 'pending' }] },
      { size: '115', stock: 4, ordered: 1, remaining: 3, orders: [{ name: '윤도현', status: 'reserved' }] },
      { size: '120', stock: 3, ordered: 0, remaining: 3, orders: [] },
    ],
  },
  {
    product_id: 4,
    display_name: '라운드 티셔츠',
    category: 'casual',
    size_stats: [
      { size: '85',  stock: 3, ordered: 1, remaining: 2,  orders: [{ name: '한기선', status: 'pending' }] },
      { size: '90',  stock: 4, ordered: 2, remaining: 2,  orders: [{ name: '오준서', status: 'pending' }, { name: '김태양', status: 'pending' }] },
      { size: '95',  stock: 3, ordered: 0, remaining: 3,  orders: [] },
      { size: '100', stock: 5, ordered: 1, remaining: 4,  orders: [{ name: '신예린', status: 'pending' }] },
      { size: '105', stock: 3, ordered: 1, remaining: 2,  orders: [{ name: '류현우', status: 'pending' }] },
      { size: '110', stock: 4, ordered: 0, remaining: 4,  orders: [] },
      { size: '115', stock: 3, ordered: 1, remaining: 2,  orders: [{ name: '백채원', status: 'reserved' }] },
    ],
  },
  // 재고 없는 품목 (empty state 테스트용)
  {
    product_id: 5,
    display_name: '체육복 상의',
    category: 'pe',
    size_stats: [
      { size: '85',  stock: 0, ordered: 0, remaining: 0, orders: [] },
      { size: '90',  stock: 0, ordered: 0, remaining: 0, orders: [] },
      { size: '95',  stock: 0, ordered: 0, remaining: 0, orders: [] },
      { size: '100', stock: 0, ordered: 0, remaining: 0, orders: [] },
    ],
  },
];

// ── 컴포넌트 ───────────────────────────────────────────────────

type ScenarioKey = 'hasStock' | 'noStock' | 'empty';

const SCENARIOS: { key: ScenarioKey; label: string; description: string }[] = [
  { key: 'hasStock', label: '품목 재고 있음',    description: '재고가 있는 품목들 (재고 부족 포함)' },
  { key: 'noStock',  label: '품목 재고 없음',    description: '모든 품목의 재고가 0인 상태' },
  { key: 'empty',    label: '품목 데이터 없음',  description: '조회된 데이터 자체가 없는 상태' },
];

export const InventoryTestPage = () => {
  const [scenario, setScenario] = useState<ScenarioKey>('hasStock');
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

  const productOptions = ['전체', ...products.map((p) => p.display_name)];

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

  const visibleProducts = selectedProducts.includes('전체')
    ? displayProducts
    : displayProducts.filter((p) => selectedProducts.includes(p.display_name));

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
