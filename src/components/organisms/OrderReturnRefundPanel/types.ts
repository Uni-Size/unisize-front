import type { RefundMethod, ReturnStatus } from '@/api/order';

/** 관리자가 확정할 수 있는 값. pending_review는 시스템이 부여하므로 제외된다. */
export type ReturnStatusDecision = Extract<
  ReturnStatus,
  'returned_to_stock' | 'not_refundable'
>;

/** POST /api/v1/admin/orders/:id/refund 요청 바디 */
export interface RefundRequestPayload {
  amount: number;
  method: RefundMethod;
  reason: string;
}
