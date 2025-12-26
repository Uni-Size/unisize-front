"use client";

import { useState } from "react";

interface PDFShareModalProps {
  show: boolean;
  shareUrl: string | null;
  onDownload: () => void;
  onClose: () => void;
  isGenerating: boolean;
}

export default function PDFShareModal({
  show,
  shareUrl,
  onDownload,
  onClose,
  isGenerating,
}: PDFShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!show) return null;

  const handleCopyLink = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("링크 복사 실패:", error);
      alert("링크 복사에 실패했습니다.");
    }
  };

  // 로컬 다운로드 성공 여부 확인
  const isLocalDownload = shareUrl === "local-download-success";

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-lg font-semibold mb-4">
            측정 결과서 PDF
          </h3>

          {isGenerating ? (
            <div className="py-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-4"></div>
              <p className="text-gray-600">PDF 생성 중...</p>
            </div>
          ) : shareUrl && isLocalDownload ? (
            <>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-green-800 mb-2">
                  ✓ PDF 다운로드 완료
                </p>
                <p className="text-sm text-green-700">
                  측정 결과서가 다운로드 폴더에 저장되었습니다.
                </p>
              </div>

              <button
                onClick={onDownload}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors mb-3"
              >
                다시 다운로드
              </button>

              <button
                onClick={onClose}
                className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                닫기
              </button>
            </>
          ) : shareUrl ? (
            <>
              <p className="text-sm text-gray-700 mb-4">
                측정 결과서가 생성되었습니다. 아래 링크를 통해 다른 기기에서 PDF를 다운로드하고 marklife 앱으로 출력할 수 있습니다.
              </p>

              <div className="bg-gray-50 p-3 rounded-lg mb-4 break-all">
                <p className="text-xs text-gray-600 mb-1">공유 링크</p>
                <p className="text-sm font-mono text-blue-600">{shareUrl}</p>
              </div>

              <div className="flex gap-3 mb-4">
                <button
                  onClick={handleCopyLink}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  {copied ? "복사됨!" : "링크 복사"}
                </button>
                <button
                  onClick={onDownload}
                  className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  PDF 다운로드
                </button>
              </div>

              <p className="text-xs text-gray-500 mb-4">
                💡 링크를 복사하여 카카오톡, 문자 등으로 전송하거나, QR 코드 생성기를 이용해 QR 코드로 공유할 수 있습니다.
              </p>

              <button
                onClick={onClose}
                className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                닫기
              </button>
            </>
          ) : (
            <div className="py-4 text-center">
              <p className="text-red-600 mb-4">PDF 생성에 실패했습니다.</p>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                닫기
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
