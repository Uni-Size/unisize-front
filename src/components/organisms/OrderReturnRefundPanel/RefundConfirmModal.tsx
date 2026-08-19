import { useState } from 'react';
import type { ReactNode } from 'react';
import { Modal, Select, Input } from '@components/atoms';
import type { RefundMethod } from '@/api/order';
import type { RefundRequestPayload } from './types';

const METHOD_OPTIONS: { value: RefundMethod; label: string }[] = [
  { value: 'cash', label: '현금' },
  { value: 'card', label: '카드' },
  { value: 'transfer', label: '계좌이체' },
];

export const REFUND_REASON_MAX_LENGTH = 255;

export interface RefundConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** 서버가 계산한 환불가능 금액. 금액 입력의 초기값이자 상한이다. */
  refundableAmount: number;
  /** 아직 회수 여부가 확정되지 않은 품목 수. 0보다 크면 경고를 띄운다. */
  pendingReviewCount?: number;
  onConfirm: (payload: RefundRequestPayload) => Promise<void> | void;
  isSubmitting?: boolean;
  error?: ReactNode;
}

export const RefundConfirmModal = ({
  isOpen,
  onClose,
  refundableAmount,
  pendingReviewCount = 0,
  onConfirm,
  isSubmitting = false,
  error,
}: RefundConfirmModalProps) => {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<RefundMethod>('cash');
  const [reason, setReason] = useState('');
  const [touched, setTouched] = useState(false);

  // 열릴 때마다 환불가능 금액으로 초기화한다. 이펙트 대신 렌더 중 조정 패턴을 쓴다.
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      setAmount(String(refundableAmount));
      setMethod('cash');
      setReason('');
      setTouched(false);
    }
  }

  const parsedAmount = Number(amount);
  const amountError =
    !amount.trim() || Number.isNaN(parsedAmount)
      ? '환불 금액을 입력해주세요.'
      : parsedAmount <= 0
        ? '환불 금액은 0보다 커야 합니다.'
        : parsedAmount > refundableAmount
          ? `환불가능 금액(${refundableAmount.toLocaleString()}원)을 초과할 수 없습니다.`
          : '';
  const reasonError = !reason.trim()
    ? '환불 사유를 입력해주세요.'
    : reason.trim().length > REFUND_REASON_MAX_LENGTH
      ? `환불 사유는 ${REFUND_REASON_MAX_LENGTH}자를 넘을 수 없습니다.`
      : '';
  const canSubmit = !amountError && !reasonError && !isSubmitting;

  const handleConfirm = async () => {
    setTouched(true);
    if (!canSubmit) return;
    await onConfirm({ amount: parsedAmount, method, reason: reason.trim() });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="환불 처리"
      width={440}
      zIndex={1100}
      actions={
        <>
          <button
            className="px-6 py-2.5 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100/50 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onClose}
            disabled={isSubmitting}
          >
            취소
          </button>
          <button
            className="px-6 py-2.5 bg-red-700 text-bg-050 text-sm font-medium rounded-lg border-none cursor-pointer hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleConfirm}
            disabled={!canSubmit}
          >
            {isSubmitting ? '처리 중...' : '환불 처리'}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4 w-full">
        {pendingReviewCount > 0 && (
          <div className="px-4 py-2.5 bg-yellow-050 border border-yellow-700/20 rounded-lg text-13 text-yellow-700 leading-relaxed">
            아직 회수 여부가 확정되지 않은 품목이 {pendingReviewCount}건 있습니다.
            지금 환불하면 해당 품목 금액은 환불가능 금액에 포함되지 않습니다.
          </div>
        )}

        <div className="flex items-center justify-between px-4 py-3 bg-gray-100 rounded-lg">
          <span className="text-13 text-gray-700">환불가능 금액</span>
          <span className="text-15 font-medium text-gray-700">
            {refundableAmount.toLocaleString()}원
          </span>
        </div>

        <Input
          label="환불 금액"
          type="number"
          min={0}
          max={refundableAmount}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          onBlur={() => setTouched(true)}
          error={touched ? amountError : undefined}
          fullWidth
        />

        <Select
          label="환불 수단"
          options={METHOD_OPTIONS}
          value={method}
          onChange={(value) => setMethod(value as RefundMethod)}
          fullWidth
        />

        <Input
          label="환불 사유"
          placeholder="환불 사유를 입력해주세요."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          onBlur={() => setTouched(true)}
          error={touched ? reasonError : undefined}
          fullWidth
        />

        {error && <span className="text-13 text-red-700">{error}</span>}
      </div>
    </Modal>
  );
};
