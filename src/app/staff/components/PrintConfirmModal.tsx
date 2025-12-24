"use client";

import { useState } from "react";

interface PrintConfirmModalProps {
  isOpen: boolean;
  schoolName: string;
  studentName: string;
  onConfirm: () => Promise<void>;
}

export default function PrintConfirmModal({
  isOpen,
  schoolName,
  studentName,
  onConfirm,
}: PrintConfirmModalProps) {
  const [isPrinting, setIsPrinting] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsPrinting(true);
    try {
      await onConfirm();
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <>
      {/* 모달 오버레이 */}
      <div className="fixed inset-0 bg-black/50 z-[60]" />
      {/* 모달 컨텐츠 */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 z-[70] max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4 text-blue-600">
          최종 확정 완료
        </h3>

        <div className="mb-6 space-y-2">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">학교:</span> {schoolName}
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-semibold">학생:</span> {studentName}
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm font-medium text-blue-800 mb-2">
            송장 프린트 안내
          </p>
          <p className="text-sm text-blue-700">
            송장을 프린트하여 교복과 함께
            <br />
            카운터에 안내해주세요
          </p>
        </div>

        <button
          onClick={handleConfirm}
          disabled={isPrinting}
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isPrinting ? "프린트 중..." : "확인 및 프린트"}
        </button>
      </div>
    </>
  );
}
