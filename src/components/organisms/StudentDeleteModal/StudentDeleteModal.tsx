import { useState } from 'react';
import type { ReactNode } from 'react';
import { Modal, Select } from '@components/atoms';
import {
  composeDeleteReason,
  DELETE_REASON_MAX_LENGTH,
  REASON_PRESETS,
  type ReasonPreset,
} from './deleteReason';

const PRESET_OPTIONS = REASON_PRESETS.map((value) => ({ value, label: value }));

export interface StudentDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  /** 삭제 확정. 합성된 사유 문자열 하나를 전달한다. */
  onConfirm: (reason: string) => Promise<void> | void;
  isSubmitting?: boolean;
  error?: ReactNode;
}

export const StudentDeleteModal = ({
  isOpen,
  onClose,
  studentName,
  onConfirm,
  isSubmitting = false,
  error,
}: StudentDeleteModalProps) => {
  const [preset, setPreset] = useState<ReasonPreset>('전학');
  const [detail, setDetail] = useState('');
  const [touched, setTouched] = useState(false);

  // 열릴 때마다 입력을 초기화한다. 이펙트 대신 렌더 중 조정 패턴을 쓴다.
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      setPreset('전학');
      setDetail('');
      setTouched(false);
    }
  }

  const reason = composeDeleteReason(preset, detail);
  const isEtc = preset === '기타';
  const isTooLong = reason.length > DELETE_REASON_MAX_LENGTH;
  const isEmpty = reason.length === 0;
  const validationError = isEmpty
    ? '삭제 사유를 입력해주세요.'
    : isTooLong
      ? `삭제 사유는 ${DELETE_REASON_MAX_LENGTH}자를 넘을 수 없습니다.`
      : '';
  const canSubmit = !validationError && !isSubmitting;

  const handleConfirm = async () => {
    setTouched(true);
    if (!canSubmit) return;
    await onConfirm(reason);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="학생 삭제"
      width={480}
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
            {isSubmitting ? '삭제 중...' : '삭제'}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4 w-full">
        <div className="flex flex-col gap-1.5 px-4 py-3 bg-red-050 border border-red-200 rounded-lg">
          <span className="text-15 font-medium text-red-700">
            {studentName ? `${studentName} 학생을 삭제합니다.` : '학생을 삭제합니다.'}
          </span>
          <span className="text-13 text-red-700/80 leading-relaxed">
            출고 전 품목은 자동 취소되고, 이미 출고된 품목은 회수 확인 대기 상태가 됩니다.
            회수 여부와 환불은 삭제 후 학생 상세에서 확정해주세요.
          </span>
        </div>

        <Select
          label="삭제 사유"
          options={PRESET_OPTIONS}
          value={preset}
          onChange={(value) => setPreset(value as ReasonPreset)}
          fullWidth
        />

        <div className="flex flex-col gap-2">
          <label htmlFor="delete-reason-detail" className="text-15 font-normal text-gray-700">
            상세 사유{isEtc && <span className="text-red-700"> *</span>}
          </label>
          <textarea
            id="delete-reason-detail"
            className="w-full min-h-24 px-4 py-3 border border-gray-200 rounded-lg text-15 font-normal text-gray-700 bg-transparent resize-y transition-colors duration-200 ease-in-out focus:outline-none focus:border-bg-400 placeholder:text-bg-400"
            placeholder={isEtc ? '삭제 사유를 입력해주세요.' : '추가로 남길 내용이 있으면 입력해주세요. (선택)'}
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            onBlur={() => setTouched(true)}
          />
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs text-bg-400 break-all">
              기록될 사유: {reason || '-'}
            </span>
            <span className={`text-xs shrink-0 ${isTooLong ? 'text-red-700' : 'text-bg-400'}`}>
              {reason.length} / {DELETE_REASON_MAX_LENGTH}
            </span>
          </div>
        </div>

        {(error || (touched && validationError)) && (
          <span className="text-13 text-red-700">{error || validationError}</span>
        )}
      </div>
    </Modal>
  );
};
