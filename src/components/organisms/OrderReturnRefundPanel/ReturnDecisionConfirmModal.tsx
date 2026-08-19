import { useState } from 'react';
import type { ReactNode } from 'react';
import { Modal } from '@components/atoms';
import type { RefundSummaryItem } from '@/api/order';
import type { ReturnStatusDecision } from './types';

export const RETURN_NOTE_MAX_LENGTH = 500;

const COPY: Record<
  ReturnStatusDecision,
  { title: string; label: string; warning: string; confirmClass: string }
> = {
  returned_to_stock: {
    title: '재고로 회수 확정',
    label: '재고로 회수됨',
    warning:
      '이 품목을 재고로 되돌립니다. 확정하면 재고가 실제로 복원되고 환불 대상에 포함됩니다.',
    confirmClass: 'bg-green-700 text-bg-050',
  },
  not_refundable: {
    title: '환불 불가 확정',
    label: '환불 불가',
    warning:
      '이 품목을 환불 대상에서 제외합니다. 재고는 복원되지 않고 환불가능 금액에도 포함되지 않습니다.',
    confirmClass: 'bg-red-700 text-bg-050',
  },
};

export interface ReturnDecisionConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: RefundSummaryItem | null;
  decision: ReturnStatusDecision | null;
  onConfirm: (note: string) => Promise<void> | void;
  isSubmitting?: boolean;
  error?: ReactNode;
}

export const ReturnDecisionConfirmModal = ({
  isOpen,
  onClose,
  item,
  decision,
  onConfirm,
  isSubmitting = false,
  error,
}: ReturnDecisionConfirmModalProps) => {
  const [note, setNote] = useState('');

  // 열릴 때마다 메모를 초기화한다. 이펙트 대신 렌더 중 조정 패턴을 쓴다.
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) setNote('');
  }

  if (!item || !decision) return null;

  const copy = COPY[decision];
  const isTooLong = note.length > RETURN_NOTE_MAX_LENGTH;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={copy.title}
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
            className={`px-6 py-2.5 text-sm font-medium rounded-lg border-none cursor-pointer hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed ${copy.confirmClass}`}
            onClick={() => onConfirm(note.trim())}
            disabled={isSubmitting || isTooLong}
          >
            {isSubmitting ? '처리 중...' : copy.label}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4 w-full">
        <div className="flex flex-col gap-1.5 px-4 py-3 bg-yellow-050 border border-yellow-700/20 rounded-lg">
          <span className="text-13 text-yellow-700 leading-relaxed">{copy.warning}</span>
          <span className="text-13 font-medium text-yellow-700">
            확정 후에는 되돌릴 수 없습니다.
          </span>
        </div>

        <div className="flex flex-col gap-1 px-4 py-3 bg-gray-100 rounded-lg">
          <span className="text-15 font-medium text-gray-700">{item.product_name}</span>
          <span className="text-13 text-gray-700">
            {item.size || '-'} · {item.quantity}개 · {item.subtotal.toLocaleString()}원
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="return-decision-note" className="text-15 font-normal text-gray-700">
            메모 (선택)
          </label>
          <textarea
            id="return-decision-note"
            className="w-full min-h-20 px-4 py-3 border border-gray-200 rounded-lg text-15 font-normal text-gray-700 bg-transparent resize-y transition-colors duration-200 ease-in-out focus:outline-none focus:border-bg-400 placeholder:text-bg-400"
            placeholder="회수 상태를 남겨둘 내용이 있으면 입력해주세요."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <span className={`text-xs self-end ${isTooLong ? 'text-red-700' : 'text-bg-400'}`}>
            {note.length} / {RETURN_NOTE_MAX_LENGTH}
          </span>
        </div>

        {error && <span className="text-13 text-red-700">{error}</span>}
      </div>
    </Modal>
  );
};
