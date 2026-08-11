import { useState } from 'react';
import type { ReactNode } from 'react';
import { RefundConfirmModal } from './RefundConfirmModal';
import type { RefundSummary, RefundSummaryItem } from '@/api/order';
import type { RefundRequestPayload, ReturnStatusDecision } from './types';

const DECISIONS: { value: ReturnStatusDecision; label: string; activeClass: string }[] = [
  {
    value: 'returned_to_stock',
    label: '재고로 회수됨',
    activeClass: 'bg-green-050 border-green-700 text-green-700 font-medium',
  },
  {
    value: 'not_refundable',
    label: '환불 불가',
    activeClass: 'bg-red-050 border-red-700 text-red-700 font-medium',
  },
];

const DELIVERY_STATUS_LABELS: Record<string, string> = {
  pending: '출고 대기',
  out_of_stock: '재고 부족',
  shipped: '출고됨',
  delivered: '전달완료',
  reserved: '예약',
  receipt: '수령완료',
  cancelled: '취소됨',
};

const ReturnStatusPill = ({ item }: { item: RefundSummaryItem }) => {
  const tone =
    item.return_status === 'returned_to_stock'
      ? 'bg-green-050 text-green-700'
      : item.return_status === 'not_refundable'
        ? 'bg-red-050 text-red-700'
        : 'bg-yellow-050 text-yellow-700';
  return (
    <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${tone}`}>
      {item.return_status_display || '회수 확인 대기'}
    </span>
  );
};

export interface OrderReturnRefundPanelProps {
  summary: RefundSummary | null;
  loading?: boolean;
  error?: ReactNode;
  /** 상태 확정 요청이 진행 중인 item_id */
  decidingItemId?: string | null;
  isRefunding?: boolean;
  refundError?: ReactNode;
  onDecideReturnStatus: (
    itemId: string,
    decision: ReturnStatusDecision,
  ) => Promise<void> | void;
  onRefund: (payload: RefundRequestPayload) => Promise<void> | void;
}

export const OrderReturnRefundPanel = ({
  summary,
  loading = false,
  error,
  decidingItemId = null,
  isRefunding = false,
  refundError,
  onDecideReturnStatus,
  onRefund,
}: OrderReturnRefundPanelProps) => {
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center px-4 py-6 border border-gray-200 rounded-lg text-13 text-bg-400">
        회수/환불 정보를 불러오는 중...
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-3 border border-red-200 bg-red-050 rounded-lg text-13 text-red-700">
        {error}
      </div>
    );
  }

  // 삭제로 정리 대상이 된 품목만 노출한다. 정상 주문에는 returnStatus가 비어 있어 패널 자체가 뜨지 않는다.
  const items = (summary?.items ?? []).filter((item) => item.return_status);
  if (!summary || items.length === 0) return null;

  const handleRefund = async (payload: RefundRequestPayload) => {
    await onRefund(payload);
    setIsRefundModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-3 p-4 border border-gray-200 rounded-lg bg-white">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-15 font-medium text-bg-800">회수 / 환불</span>
          <span className="text-xs text-bg-400">{summary.order_number}</span>
        </div>
        {summary.pending_review_count > 0 && (
          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-yellow-050 text-yellow-700 text-xs font-medium whitespace-nowrap">
            회수 확인 대기 {summary.pending_review_count}건
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-160">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 whitespace-nowrap">품목</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 whitespace-nowrap">사이즈</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 whitespace-nowrap">수량</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-700 whitespace-nowrap">단가</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-700 whitespace-nowrap">금액</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 whitespace-nowrap">출고상태</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 whitespace-nowrap">회수 처리</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const isDeciding = decidingItemId === item.item_id;
              // 확정된 품목은 서버가 재변경을 409로 막으므로 토글을 잠근다.
              const isLocked = !item.needs_review;
              return (
                <tr key={item.item_id} className="border-b border-gray-200 last:border-b-0">
                  <td className="px-3 py-2.5 text-13 text-gray-700">{item.product_name}</td>
                  <td className="px-3 py-2.5 text-13 text-gray-700 text-center whitespace-nowrap">
                    {item.size || '-'}
                  </td>
                  <td className="px-3 py-2.5 text-13 text-gray-700 text-center whitespace-nowrap">
                    {item.quantity}
                  </td>
                  <td className="px-3 py-2.5 text-13 text-gray-700 text-right whitespace-nowrap">
                    {item.unit_price.toLocaleString()}원
                  </td>
                  <td className="px-3 py-2.5 text-13 text-gray-700 text-right whitespace-nowrap">
                    {item.subtotal.toLocaleString()}원
                  </td>
                  <td className="px-3 py-2.5 text-13 text-gray-700 text-center whitespace-nowrap">
                    {DELIVERY_STATUS_LABELS[item.delivery_status] ?? item.delivery_status}
                  </td>
                  <td className="px-3 py-2.5">
                    {isLocked ? (
                      <div className="flex justify-center">
                        <ReturnStatusPill item={item} />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1">
                        {DECISIONS.map((decision) => {
                          const isActive = item.return_status === decision.value;
                          return (
                            <button
                              key={decision.value}
                              type="button"
                              className={`px-2.5 py-1 rounded border text-xs cursor-pointer transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                                isActive
                                  ? decision.activeClass
                                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100/50'
                              }`}
                              onClick={() => onDecideReturnStatus(item.item_id, decision.value)}
                              disabled={isDeciding}
                            >
                              {decision.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-200">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="text-13 text-gray-700">
            결제액 <span className="font-medium">{summary.paid_amount.toLocaleString()}원</span>
          </span>
          <span className="text-13 text-gray-700">
            기환불액 <span className="font-medium">{summary.refunded_amount.toLocaleString()}원</span>
          </span>
          <span className="text-15 text-red-700">
            환불가능 금액{' '}
            <span className="font-medium">{summary.refundable_amount.toLocaleString()}원</span>
          </span>
        </div>
        <button
          type="button"
          className="px-5 py-2 bg-red-700 text-bg-050 text-sm font-medium rounded-lg border-none cursor-pointer hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => setIsRefundModalOpen(true)}
          disabled={summary.refundable_amount <= 0 || isRefunding}
        >
          환불 처리
        </button>
      </div>

      <RefundConfirmModal
        isOpen={isRefundModalOpen}
        onClose={() => setIsRefundModalOpen(false)}
        refundableAmount={summary.refundable_amount}
        pendingReviewCount={summary.pending_review_count}
        onConfirm={handleRefund}
        isSubmitting={isRefunding}
        error={refundError}
      />
    </div>
  );
};
