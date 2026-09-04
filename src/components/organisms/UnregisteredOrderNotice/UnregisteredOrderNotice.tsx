import { useId, useState } from 'react';
import type { UnregisteredProduct } from '@/api/order';
import { getCategoryLabel } from '@/constants/productCategories';
import { compareSizes } from '@/constants/product';
import { formatGender } from '@/utils/genderUtils';

export interface UnregisteredOrderNoticeProps {
  /**
   * 학교 품목(school_uniforms)으로 등록되지 않은 품목에 걸린 주문.
   * 서버가 products와 서로소로 보장하므로 이 컴포넌트에서 dedupe하지 않는다.
   */
  products: UnregisteredProduct[];
}

/** 한 품목의 주문 라인 수 (사이즈 그룹의 orders 길이 합). */
const countProductOrders = (product: UnregisteredProduct) =>
  product.sizes.reduce((sum, group) => sum + group.orders.length, 0);

/**
 * 미등록 품목 주문 경고 섹션.
 *
 * 재고 표(OrderSizeTable)와 일부러 다른 시각 언어(경고 톤)를 쓴다. 여기 나오는 주문은
 * "재고가 없어서 예약된 주문"이 아니라 "학교-품목 매핑이 누락된 주문"이고,
 * 관리자가 취해야 할 조치도 추가 발주가 아니라 학교 품목 등록이기 때문이다.
 *
 * 재고/잔여/예약 칸은 그리지 않는다 — 미등록 품목에는 그 개념 자체가 없다
 * (서버가 size_stats가 아니라 sizes만 내려준다).
 */
export const UnregisteredOrderNotice = ({ products }: UnregisteredOrderNoticeProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();

  // 훅 호출 뒤에 early return (훅 순서 규칙).
  if (products.length === 0) return null;

  const totalOrderCount = products.reduce((sum, p) => sum + countProductOrders(p), 0);

  return (
    <section
      data-testid="unregistered-order-notice"
      className="mt-6 border border-yellow-700/25 bg-yellow-050 rounded-lg overflow-hidden"
      aria-label="학교 품목으로 등록되지 않은 주문"
    >
      <h3 className="m-0">
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          aria-expanded={isOpen}
          aria-controls={panelId}
          className="w-full flex items-center gap-2 px-4 py-3 text-left cursor-pointer bg-transparent border-none hover:bg-yellow-700/5 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-yellow-700 transition-colors"
        >
          {/* 경고 삼각형 */}
          <svg
            className="w-4 h-4 shrink-0 text-yellow-700"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
            />
          </svg>

          <span className="text-14 font-medium text-yellow-700">
            학교 품목으로 등록되지 않은 주문 {totalOrderCount}건
          </span>

          <svg
            className={`w-4 h-4 ml-auto shrink-0 text-yellow-700 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </h3>

      <div id={panelId} hidden={!isOpen} className="px-4 pb-4">
        <p className="mt-0 mb-3 text-13 text-yellow-700 leading-relaxed">
          재고 부족으로 예약된 주문이 아닙니다. 아래 품목은 이 학교의 품목으로 등록되어 있지 않아
          재고 표에 그릴 칸이 없습니다. 추가 발주가 아니라 <b>학교 품목 등록</b>이 필요합니다.
        </p>

        <ul className="list-none m-0 p-0 flex flex-col gap-2">
          {products.map((product) => {
            const sortedSizes = [...product.sizes].sort((a, b) => compareSizes(a.size, b.size));
            const meta = [
              getCategoryLabel(product.category),
              formatGender(product.gender),
            ].filter(Boolean);

            return (
              <li
                key={product.product_id}
                className="bg-bg-canvas border border-yellow-700/20 rounded-md px-3 py-2.5"
              >
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 mb-2">
                  <span className="text-14 font-medium text-gray-900">
                    {product.display_name || product.product_name}
                  </span>
                  {meta.length > 0 && (
                    <span className="text-11 text-gray-600">{meta.join(' · ')}</span>
                  )}
                  <span className="ml-auto text-11 font-medium text-yellow-700 bg-yellow-050 rounded px-1.5 py-0.5 whitespace-nowrap">
                    주문 {countProductOrders(product)}건
                  </span>
                </div>

                <ul className="list-none m-0 p-0 flex flex-col gap-1.5">
                  {sortedSizes.map((group) => (
                    <li
                      key={group.size}
                      className="flex flex-wrap items-center gap-x-2 gap-y-1"
                    >
                      <span className="text-11 font-medium text-gray-700 bg-gray-100 rounded px-1.5 py-0.5 min-w-11 text-center whitespace-nowrap">
                        {group.size || '-'}
                      </span>
                      {group.orders.map((order, idx) => (
                        <span
                          key={`${order.name}-${idx}`}
                          className="text-13 text-gray-900 whitespace-nowrap"
                        >
                          {order.name}
                          {order.quantity > 1 && (
                            <span className="text-11 text-gray-600 ml-0.5">×{order.quantity}</span>
                          )}
                        </span>
                      ))}
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};
