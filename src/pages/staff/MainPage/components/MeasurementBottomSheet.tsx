import React, { useRef, useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import type { RegisterStudent, StartMeasurementResponse, UniformProduct } from '../../../../api/student';
import { formatGender } from '../../../../utils/genderUtils';
import type {
  MeasurementUniformItem,
  MeasurementSupplyItem,
  MeasurementNameTag,
} from '../hooks/useMeasurementForm';

// ============================================================================
// 타입
// ============================================================================

interface MeasurementBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onTempSave: () => Promise<void>;
  onError: (message: string) => void;
  student: RegisterStudent | null;
  measurementData: StartMeasurementResponse | null;
  winterUniforms: MeasurementUniformItem[];
  summerUniforms: MeasurementUniformItem[];
  supplies: MeasurementSupplyItem[];
  nameTag: MeasurementNameTag;
  nameTagMinUnit: number;
  nameTagName: string;
  onUpdateNameTagName: (name: string) => void;
  onUpdateUniform: (season: 'winter' | 'summer', rowId: string, patch: Partial<MeasurementUniformItem>) => void;
  onAddUniformFromProduct: (season: 'winter' | 'summer', product: UniformProduct) => void;
  onAddUniformRow: (season: 'winter' | 'summer', source: MeasurementUniformItem) => void;
  onRemoveUniformRow: (season: 'winter' | 'summer', rowId: string) => void;
  onUpdateSupply: (rowId: string, patch: Partial<MeasurementSupplyItem>) => void;
  onAddSupplyRow: (source: MeasurementSupplyItem) => void;
  onRemoveSupplyRow: (rowId: string) => void;
  onUpdateNameTagOrderQuantity: (delta: number) => void;
  onNext: () => Promise<void>;
  onConfirm: (signature: string) => Promise<void>;
}

// ============================================================================
// 사이즈 옵션
// ============================================================================

const DEFAULT_SIZE_OPTIONS = ['77', '80', '85', '90', '95', '100', '105', '110'];

// ============================================================================
// Stepper
// ============================================================================

const Stepper = ({
  value,
  onChange,
  min = 0,
  max,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) => (
  <div className="flex items-center justify-center gap-0.5">
    <button
      type="button"
      className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded text-gray-600 bg-white hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-sm leading-none"
      onClick={() => onChange(Math.max(min, value - 1))}
      disabled={value <= min}
    >
      −
    </button>
    <span className="w-5 text-center text-xs text-gray-800 tabular-nums font-medium">{value}</span>
    <button
      type="button"
      className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded text-gray-600 bg-white hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-sm leading-none"
      onClick={() => onChange(value + 1)}
      disabled={max !== undefined && value >= max}
    >
      +
    </button>
  </div>
);

// ============================================================================
// 사인 캔버스
// ============================================================================

const SignatureCanvas = ({ onSign, initialSignature }: { onSign: (dataUrl: string) => void; initialSignature?: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isDrawing = useRef(false);
  const [hasSigned, setHasSigned] = useState(!!initialSignature);

  // canvas 픽셀 해상도를 DOM 렌더 크기에 맞게 동기화, 기존 서명 복원
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    // 리사이즈로 인한 재동기화인지 추적 - 최초 1회는 initialSignature를 복원하고,
    // 이후 리사이즈(ResizeObserver 재호출)에서는 캔버스 재설정 직전 내용을 보존해 복원한다.
    let hasSyncedOnce = false;

    const sync = () => {
      const dpr = window.devicePixelRatio || 1;
      const { width, height } = wrapper.getBoundingClientRect();
      if (width === 0 || height === 0) return;

      const preserved = hasSyncedOnce ? canvas.toDataURL() : null;
      hasSyncedOnce = true;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.scale(dpr, dpr);

      const restoreSrc = preserved ?? initialSignature;
      if (restoreSrc) {
        const img = new Image();
        img.onload = () => ctx.drawImage(img, 0, 0, width, height);
        img.src = restoreSrc;
      }
    };

    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(wrapper);
    return () => ro.disconnect();
  }, [initialSignature]);

  // 터치/마우스 좌표를 canvas 내부 좌표로 변환 (CSS 크기 기준)
  const getPos = (e: React.TouchEvent | React.MouseEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    // getBoundingClientRect는 CSS 픽셀 기준이므로 dpr 보정 불필요
    return {
      x: (clientX - rect.left),
      y: (clientY - rect.top),
    };
  };

  const startDraw = (e: React.TouchEvent | React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    e.preventDefault();
    isDrawing.current = true;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    e.preventDefault();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getPos(e, canvas);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineTo(x, y);
    ctx.stroke();
    if (!hasSigned) setHasSigned(true);
  };

  const endDraw = () => {
    isDrawing.current = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    onSign(canvas.toDataURL());
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    setHasSigned(false);
    onSign('');
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">확인 서명</span>
        {hasSigned && (
          <button
            type="button"
            className="text-xs text-gray-400 underline"
            onClick={clear}
          >
            다시 서명
          </button>
        )}
      </div>
      <div ref={wrapperRef} className="w-full h-40">
        <canvas
          ref={canvasRef}
          className="w-full h-full border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 touch-none"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
      </div>
      {!hasSigned && (
        <p className="text-xs text-gray-400 text-center">위 영역에 서명해주세요</p>
      )}
    </div>
  );
};

// ============================================================================
// 메인 컴포넌트
// ============================================================================

export const MeasurementBottomSheet = ({
  isOpen,
  onClose,
  onTempSave,
  onError,
  student,
  measurementData,
  winterUniforms,
  summerUniforms,
  supplies,
  nameTag,
  nameTagMinUnit,
  nameTagName,
  onUpdateNameTagName,
  onUpdateUniform,
  onAddUniformFromProduct,
  onAddUniformRow,
  onRemoveUniformRow,
  onUpdateSupply,
  onAddSupplyRow,
  onRemoveSupplyRow,
  onUpdateNameTagOrderQuantity,
  onNext,
  onConfirm,
}: MeasurementBottomSheetProps) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [activeSeasonTab, setActiveSeasonTab] = useState<'winter' | 'summer'>('winter');
  const [signature, setSignature] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTempSaving, setIsTempSaving] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveSeasonTab('winter');
      setSignature(measurementData?.signature || '');
    }
  }, [isOpen, measurementData?.signature]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const extractErrorMessage = (e: unknown): string => {
    if (e instanceof AxiosError) {
      return e.response?.data?.error?.message ?? '';
    }
    return '';
  };

  const handleTempSaveAndClose = async () => {
    setIsTempSaving(true);
    try {
      await onTempSave();
      onClose();
    } catch (e: unknown) {
      onError(extractErrorMessage(e) || '임시저장 중 오류가 발생했습니다.');
    } finally {
      setIsTempSaving(false);
    }
  };

  const handleNext = async () => {
    setIsSubmitting(true);
    try {
      await onNext();
      setStep(2);
    } catch (e: unknown) {
      onError(extractErrorMessage(e) || '저장 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(signature);
    } catch (e: unknown) {
      onError(extractErrorMessage(e) || '확정 처리 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !student || !measurementData) return null;

  // 가격 계산
  const calcUniform = (items: MeasurementUniformItem[]) => {
    let total = 0;
    let supported = 0;
    for (const item of items) {
      const qty = item.supportedQuantity + item.additionalQuantity;
      total += item.unitPrice * qty;
      supported += item.unitPrice * item.supportedQuantity;
    }
    return { total, supported, payable: total - supported };
  };

  const supplyTotal = supplies.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  // ============================================================================
  // 단계1: 입력 폼
  // ============================================================================

  const renderUniformSection = (_title: string, items: MeasurementUniformItem[], season: 'winter' | 'summer') => {
    const sortedItems: MeasurementUniformItem[] = [
      ...items.filter((i) => i.supportedQuantity > 0),
      ...items.filter((i) => i.supportedQuantity === 0),
    ];
    const showNameTag = true;
    return (
      <div className="rounded-2xl border border-gray-200">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-2 py-2.5 font-medium text-gray-600 text-left w-24">품목명</th>
              <th className="px-2 py-2.5 font-medium text-gray-600 text-right w-16">단가</th>
              <th className="px-2 py-2.5 font-medium text-gray-600 text-center w-20">사이즈</th>
              <th className="px-2 py-2.5 font-medium text-gray-600 text-center w-10">지원</th>
              <th className="px-2 py-2.5 font-medium text-gray-600 text-center w-14">추가</th>
              <th className="px-2 py-2.5 font-medium text-gray-600 text-center w-28">수선</th>
              <th className="px-2 py-2.5 font-medium text-gray-600 text-center w-14">예약</th>
              {showNameTag && <th className="px-2 py-2.5 font-medium text-gray-600 text-center w-12">명찰</th>}
              {showNameTag && <th className="px-2 py-2.5 font-medium text-gray-600 text-center w-12">부착</th>}
              <th className="px-2 py-2.5 w-8" />
            </tr>
          </thead>
          <tbody>
            {sortedItems.length === 0 ? (
              <tr>
                <td colSpan={showNameTag ? 10 : 8} className="text-center py-5 text-gray-400">해당 품목 없음</td>
              </tr>
            ) : (
              sortedItems.map((item) => {
                const baseSizes = item.availableSizes.length > 0
                  ? item.availableSizes
                  : DEFAULT_SIZE_OPTIONS.map((s) => ({ size: s, inStock: true, stockCount: 0 }));
                const hasRecommended = baseSizes.some((s) => s.size === item.recommendedSize);
                const sizeOptions = (hasRecommended || !item.recommendedSize
                  ? baseSizes
                  : [{ size: item.recommendedSize, inStock: true, stockCount: 0 }, ...baseSizes]
                ).slice().sort((a, b) => {
                  const na = parseFloat(a.size);
                  const nb = parseFloat(b.size);
                  if (!isNaN(na) && !isNaN(nb)) return na - nb;
                  return a.size.localeCompare(b.size);
                });
                const isAdded = !item.isRequired && item.supportedQuantity === 0;
                return (
                  <tr key={item.rowId} className="border-b border-gray-100 last:border-b-0">
                    <td className="px-2 py-2 text-sm text-gray-700 align-middle">{item.name}</td>
                    <td className="px-2 py-2 text-right text-sm text-gray-500 align-middle tabular-nums whitespace-nowrap">
                      {item.unitPrice > 0 ? `${item.unitPrice.toLocaleString()}원` : '-'}
                    </td>
                    <td className="p-1 text-center align-middle border-l border-gray-100">
                      <select
                        className="w-full px-1 py-1.5 border border-gray-200 rounded text-sm text-gray-700 bg-white outline-none focus:border-primary-900"
                        value={item.selectedSize}
                        onChange={(e) => onUpdateUniform(season, item.rowId, { selectedSize: e.target.value })}
                      >
                        <option value="">-</option>
                        {sizeOptions.map(({ size, inStock }) => (
                          <option key={size} value={size}>
                            {size}{!inStock ? ' *' : ''}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-2 text-sm text-center text-gray-700 align-middle border-l border-gray-100">{item.supportedQuantity}</td>
                    <td className="p-1 text-center align-middle border-l border-gray-100">
                      <Stepper
                        value={item.additionalQuantity}
                        min={isAdded ? 1 : 0}
                        onChange={(v) => onUpdateUniform(season, item.rowId, { additionalQuantity: v })}
                      />
                    </td>
                    <td className="p-1 text-center align-middle border-l border-gray-100">
                      {item.isCustomizationRequired ? (
                        <input
                          type="text"
                          className="w-full px-1 py-1.5 border border-gray-200 rounded text-sm text-center text-gray-700 bg-white outline-none focus:border-primary-900"
                          value={item.repair}
                          onChange={(e) => onUpdateUniform(season, item.rowId, { repair: e.target.value })}
                          placeholder="수선 필수"
                        />
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="p-2 text-center align-middle border-l border-gray-100">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={item.reservation}
                        onClick={() => onUpdateUniform(season, item.rowId, { reservation: !item.reservation })}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none cursor-pointer border-none ${item.reservation ? 'bg-blue-500' : 'bg-gray-300'}`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${item.reservation ? 'translate-x-4' : 'translate-x-1'}`}
                        />
                      </button>
                    </td>
                    {showNameTag && (
                      <td className="p-1 text-center align-middle border-l border-gray-100">
                        <Stepper
                          value={item.nameTagCount}
                          max={item.supportedQuantity + item.additionalQuantity}
                          onChange={(v) => onUpdateUniform(season, item.rowId, { nameTagCount: v })}
                        />
                      </td>
                    )}
                    {showNameTag && (
                      <td className="p-1 text-center align-middle border-l border-gray-100">
                        <input
                          type="checkbox"
                          className="w-4 h-4 cursor-pointer accent-primary-900"
                          checked={item.nameTagAttach}
                          disabled={item.nameTagCount === 0}
                          onChange={(e) => onUpdateUniform(season, item.rowId, { nameTagAttach: e.target.checked })}
                        />
                      </td>
                    )}
                    <td className="p-1 text-center align-middle border-l border-gray-100">
                      {isAdded ? (
                        <button
                          type="button"
                          onClick={() => onRemoveUniformRow(season, item.rowId)}
                          className="w-6 h-6 flex items-center justify-center text-red-400 hover:text-red-600 bg-transparent border-none cursor-pointer text-base leading-none mx-auto"
                        >×</button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onAddUniformRow(season, item)}
                          className="w-6 h-6 flex items-center justify-center text-blue-500 hover:text-blue-700 bg-transparent border border-blue-300 rounded cursor-pointer text-sm leading-none mx-auto"
                        >+</button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const renderSupplySection = () => {
    if (supplies.length === 0) return null;

    return (
      <div className="flex-1 rounded-2xl overflow-hidden border border-gray-200">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-2 py-2.5 font-medium text-gray-600 text-left whitespace-nowrap w-24">품목명</th>
              <th className="px-2 py-2.5 font-medium text-gray-600 text-right whitespace-nowrap w-16">단가</th>
              <th className="px-2 py-2.5 font-medium text-gray-600 text-center whitespace-nowrap w-24">사이즈</th>
              <th className="px-2 py-2.5 font-medium text-gray-600 text-center whitespace-nowrap w-28">수량</th>
              <th className="px-2 py-2.5 w-8" />
            </tr>
          </thead>
          <tbody>
            {supplies.map((item) => {
              const sizes = item.availableSizes.slice().sort((a, b) => {
                const na = parseFloat(a.size);
                const nb = parseFloat(b.size);
                if (!isNaN(na) && !isNaN(nb)) return na - nb;
                return a.size.localeCompare(b.size);
              });
              const needsSelect = sizes.length > 1 || (sizes.length === 1 && sizes[0].size !== 'FREE');
              const isAdded = item.quantity > 0 && supplies.filter((s) => s.productId === item.productId).indexOf(item) > 0;
              return (
                <tr key={item.rowId} className="border-b border-gray-100 last:border-b-0">
                  <td className="px-2 py-2 text-gray-700 align-middle">{item.name}</td>
                  <td className="px-2 py-2 text-right text-gray-500 align-middle tabular-nums whitespace-nowrap">
                    {item.unitPrice > 0 ? `${item.unitPrice.toLocaleString()}원` : '-'}
                  </td>
                  <td className="p-1 text-center align-middle border-l border-gray-100">
                    {needsSelect ? (
                      <select
                        className="w-full px-1 py-1.5 border border-gray-200 rounded text-sm text-gray-700 bg-white outline-none focus:border-primary-900"
                        value={item.selectedSize}
                        onChange={(e) => onUpdateSupply(item.rowId, { selectedSize: e.target.value })}
                      >
                        <option value="">-</option>
                        {sizes.map(({ size, in_stock }) => (
                          <option key={size} value={size}>{size}{!in_stock ? ' *' : ''}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="p-1 text-center align-middle border-l border-gray-100">
                    <Stepper
                      value={item.quantity}
                      min={isAdded ? 1 : 0}
                      onChange={(v) => onUpdateSupply(item.rowId, { quantity: v })}
                    />
                  </td>
                  <td className="p-1 text-center align-middle border-l border-gray-100">
                    {isAdded ? (
                      <button
                        type="button"
                        onClick={() => onRemoveSupplyRow(item.rowId)}
                        className="w-6 h-6 flex items-center justify-center text-red-400 hover:text-red-600 bg-transparent border-none cursor-pointer text-base leading-none mx-auto"
                      >×</button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onAddSupplyRow(item)}
                        className="w-6 h-6 flex items-center justify-center text-blue-500 hover:text-blue-700 bg-transparent border border-blue-300 rounded cursor-pointer text-sm leading-none mx-auto"
                      >+</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderNameTagSection = () => {
    const nameTagTotal = [...winterUniforms, ...summerUniforms].reduce((sum, i) => sum + i.nameTagCount, 0);
    const minCeiled = nameTagTotal === 0 ? 0 : Math.ceil(nameTagTotal / nameTagMinUnit) * nameTagMinUnit;
    return (
      <div className="flex-none flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-500 whitespace-nowrap">명찰 표시 이름</label>
          <input
            type="text"
            className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-sm text-gray-800 bg-white outline-none focus:border-primary-900"
            value={nameTagName}
            onChange={(e) => onUpdateNameTagName(e.target.value)}
            placeholder="이름 입력"
          />
        </div>
        <div className="rounded-2xl overflow-hidden border border-gray-200">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-2 py-2.5 font-medium text-gray-600 text-center whitespace-nowrap">명찰</th>
              <th className="px-2 py-2.5 font-medium text-gray-600 text-center whitespace-nowrap w-28">주문수량</th>
              <th className="px-2 py-2.5 font-medium text-gray-600 text-center whitespace-nowrap w-20">부착수량</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 text-center text-gray-700 align-middle">명찰</td>
              <td className="p-1 text-center text-gray-700 align-middle border-l border-gray-100">
                <div className="flex items-center justify-center gap-0.5">
                  <button
                    type="button"
                    className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded text-gray-600 bg-white hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-sm leading-none"
                    onClick={() => onUpdateNameTagOrderQuantity(-1)}
                    disabled={nameTag.orderQuantity <= minCeiled}
                  >−</button>
                  <span className="w-8 text-center text-xs text-gray-800 tabular-nums font-medium">{nameTag.orderQuantity}</span>
                  <button
                    type="button"
                    className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded text-gray-600 bg-white hover:bg-gray-100 text-sm leading-none"
                    onClick={() => onUpdateNameTagOrderQuantity(1)}
                  >+</button>
                </div>
              </td>
              <td className="p-2 text-center text-gray-700 align-middle border-l border-gray-100 tabular-nums text-xs font-medium">
                {nameTag.attachQuantity}
              </td>
            </tr>
          </tbody>
        </table>
        </div>
      </div>
    );
  };

  // ============================================================================
  // 단계2: 확인 테이블 + 사인
  // ============================================================================

  const renderConfirmUniformBlock = (label: string, items: MeasurementUniformItem[]) => {
    const active = items.filter((i) => i.supportedQuantity + i.additionalQuantity > 0);
    if (active.length === 0) return null;

    const supported = active.filter((i) => i.supportedQuantity > 0);

    const th = 'px-3 py-2 font-medium text-gray-600 bg-gray-50 text-sm';
    const td = 'px-3 py-2.5 text-sm text-gray-700';

    return (
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{label}</h3>
        <div className="rounded-2xl overflow-hidden border border-gray-200">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className={`${th} text-left`}>품목</th>
                <th className={`${th} text-center w-16`}>사이즈</th>
                <th className={`${th} text-center w-12`}>수량</th>
                <th className={`${th} text-center w-12`}>지원</th>
                <th className={`${th} text-center w-12`}>부착</th>
                <th className={`${th} text-right`}>단가</th>
                <th className={`${th} text-right`}>금액</th>
              </tr>
            </thead>
            <tbody>
              {active.map((item, idx) => {
                const qty = item.supportedQuantity + item.additionalQuantity;
                const isLast = idx === active.length - 1;
                return (
                  <tr key={item.rowId} className={isLast ? '' : 'border-b border-gray-100'}>
                    <td className={`${td} text-left`}>
                      <div>{item.name}</div>
                      {(item.repair || item.reservation || item.received) && (
                        <div className="flex gap-1 mt-0.5 flex-wrap">
                          {item.repair && <span className="text-xs text-gray-400 bg-gray-100 rounded px-1">수선: {item.repair}</span>}
                          {item.reservation && <span className="text-xs text-blue-500 bg-blue-50 rounded px-1">예약</span>}
                          {item.received && <span className="text-xs text-green-600 bg-green-50 rounded px-1">수령</span>}
                        </div>
                      )}
                    </td>
                    <td className={`${td} text-center`}>{item.selectedSize || '-'}</td>
                    <td className={`${td} text-center tabular-nums`}>{qty}</td>
                    <td className={`${td} text-center`}>
                      {item.supportedQuantity > 0 ? (
                        <span className="text-blue-600 font-medium">{item.supportedQuantity}</span>
                      ) : '-'}
                    </td>
                    <td className={`${td} text-center tabular-nums`}>{item.nameTagAttach ? item.nameTagCount : '-'}</td>
                    <td className={`${td} text-right tabular-nums text-gray-500`}>
                      {item.unitPrice > 0 ? `${item.unitPrice.toLocaleString()}원` : '-'}
                    </td>
                    <td className={`${td} text-right tabular-nums font-medium`}>
                      {item.unitPrice > 0 ? `${(item.unitPrice * qty).toLocaleString()}원` : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* 소계 */}
            {(() => {
              const calc = calcUniform(active);
              return (
                <tfoot>
                  {supported.length > 0 && (
                    <tr className="border-t border-gray-200 bg-blue-50/60">
                      <td colSpan={6} className="px-3 py-2 text-sm text-blue-700">지원 차감</td>
                      <td className="px-3 py-2 text-right text-sm text-blue-700 tabular-nums font-medium">
                        -{calc.supported.toLocaleString()}원
                      </td>
                    </tr>
                  )}
                  <tr className="border-t border-gray-200 bg-gray-50">
                    <td colSpan={6} className="px-3 py-2.5 text-sm font-semibold text-gray-800">
                      {label} 소계
                    </td>
                    <td className="px-3 py-2.5 text-right text-sm font-bold text-gray-900 tabular-nums">
                      {calc.payable.toLocaleString()}원
                    </td>
                  </tr>
                </tfoot>
              );
            })()}
          </table>
        </div>

        {/* 지원 품목 배지 */}
        {supported.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {supported.map((item) => (
              <span key={item.rowId} className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2 py-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />
                {item.name} ({item.selectedSize}) · 지원 {item.supportedQuantity}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderConfirmTable = () => {
    const hasSupply = supplies.some((s) => s.quantity > 0);
    const hasNameTagService = !!(measurementData.name_tag_service?.available);
    const hasNameTag = nameTag.orderQuantity > 0 || nameTag.attachQuantity > 0 || hasNameTagService;
    return (
      <div className="flex flex-col gap-5">
        {/* 동복 */}
        {renderConfirmUniformBlock('동복', winterUniforms)}

        {/* 하복 */}
        {renderConfirmUniformBlock('하복', summerUniforms)}

        {/* 용품 확인 */}
        {hasSupply && (
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">용품</h3>
            <div className="rounded-2xl overflow-hidden border border-gray-200">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-3 py-2 font-medium text-gray-600 bg-gray-50 text-left">품목</th>
                    <th className="px-3 py-2 font-medium text-gray-600 bg-gray-50 text-center w-16">사이즈</th>
                    <th className="px-3 py-2 font-medium text-gray-600 bg-gray-50 text-center w-12">수량</th>
                    <th className="px-3 py-2 font-medium text-gray-600 bg-gray-50 text-right">단가</th>
                    <th className="px-3 py-2 font-medium text-gray-600 bg-gray-50 text-right">금액</th>
                  </tr>
                </thead>
                <tbody>
                  {supplies.filter((s) => s.quantity > 0).map((item, idx, arr) => (
                    <tr key={item.rowId} className={idx < arr.length - 1 ? 'border-b border-gray-100' : ''}>
                      <td className="px-3 py-2.5 text-sm text-gray-700">{item.name}</td>
                      <td className="px-3 py-2.5 text-sm text-center text-gray-700">{item.selectedSize || '-'}</td>
                      <td className="px-3 py-2.5 text-sm text-center tabular-nums text-gray-700">{item.quantity}</td>
                      <td className="px-3 py-2.5 text-sm text-right tabular-nums text-gray-500">
                        {item.unitPrice > 0 ? `${item.unitPrice.toLocaleString()}원` : '-'}
                      </td>
                      <td className="px-3 py-2.5 text-sm text-right tabular-nums font-medium text-gray-900">
                        {item.unitPrice > 0 ? `${(item.unitPrice * item.quantity).toLocaleString()}원` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-gray-200 bg-gray-50">
                    <td colSpan={4} className="px-3 py-2.5 text-sm font-semibold text-gray-800">용품 소계</td>
                    <td className="px-3 py-2.5 text-right text-sm font-bold text-gray-900 tabular-nums">
                      {supplyTotal.toLocaleString()}원
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* 명찰 */}
        {hasNameTag && (
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">명찰 <span className="text-orange-500 font-normal normal-case">(현금 별도)</span></h3>
            <div className="rounded-2xl border border-orange-200 overflow-hidden">
              <div className="px-4 py-2.5 bg-orange-50/50 border-b border-orange-100 flex items-center gap-2">
                <span className="text-xs text-gray-500 whitespace-nowrap">표시 이름</span>
                <input
                  type="text"
                  className="flex-1 px-2 py-1 border border-orange-200 rounded text-sm text-gray-800 bg-white outline-none focus:border-orange-400"
                  value={nameTagName}
                  onChange={(e) => onUpdateNameTagName(e.target.value)}
                  placeholder={student?.name ?? '이름 입력'}
                />
              </div>
              <div className="flex divide-x divide-orange-100">
                <div className="flex-1 px-4 py-3 bg-orange-50/50">
                  <div className="text-xs text-gray-500 mb-0.5">주문 수량</div>
                  <div className="text-base font-semibold text-gray-900">{nameTag.orderQuantity}개</div>
                  {measurementData.name_tag_service?.unit_price != null && measurementData.name_tag_service.unit_price > 0 && (
                    <div className="text-xs text-orange-600 mt-0.5">{measurementData.name_tag_service.unit_price.toLocaleString()}원/장</div>
                  )}
                </div>
                <div className="flex-1 px-4 py-3 bg-orange-50/50">
                  <div className="text-xs text-gray-500 mb-0.5">부착 수량</div>
                  <div className="text-base font-semibold text-gray-900">{nameTag.attachQuantity}개</div>
                  {measurementData.name_tag_service?.attach_price != null && measurementData.name_tag_service.attach_price > 0 && (
                    <div className="text-xs text-orange-600 mt-0.5">{measurementData.name_tag_service.attach_price.toLocaleString()}원/장</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 영수증 금액 요약 */}
        {(() => {
          const wCalc = calcUniform(winterUniforms.filter((i) => i.supportedQuantity + i.additionalQuantity > 0));
          const sCalc = calcUniform(summerUniforms.filter((i) => i.supportedQuantity + i.additionalQuantity > 0));
          const total = wCalc.total + sCalc.total + supplyTotal;
          const payable = wCalc.payable + sCalc.payable + supplyTotal;

          const nameTagSvc = measurementData.name_tag_service;
          const nameTagCashTotal = hasNameTag && nameTagSvc
            ? (nameTagSvc.unit_price ?? 0) * nameTag.orderQuantity + (nameTagSvc.attach_price ?? 0) * nameTag.attachQuantity
            : 0;

          if (total === 0 && nameTagCashTotal === 0) return null;
          return (
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">결제 금액</h3>
              <div className="rounded-2xl overflow-hidden border border-gray-200">
                <div className="flex flex-col divide-y divide-gray-100">
                  {wCalc.total > 0 && (
                    <div className="flex justify-between items-center px-4 py-2.5 text-sm">
                      <span className="text-gray-600">동복 정가</span>
                      <span className="tabular-nums text-gray-800">{wCalc.total.toLocaleString()}원</span>
                    </div>
                  )}
                  {wCalc.supported > 0 && (
                    <div className="flex justify-between items-center px-4 py-2.5 text-sm bg-blue-50/50">
                      <span className="text-blue-700 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />
                        동복 지원 차감
                      </span>
                      <span className="tabular-nums text-blue-700 font-medium">-{wCalc.supported.toLocaleString()}원</span>
                    </div>
                  )}
                  {sCalc.total > 0 && (
                    <div className="flex justify-between items-center px-4 py-2.5 text-sm">
                      <span className="text-gray-600">하복 정가</span>
                      <span className="tabular-nums text-gray-800">{sCalc.total.toLocaleString()}원</span>
                    </div>
                  )}
                  {sCalc.supported > 0 && (
                    <div className="flex justify-between items-center px-4 py-2.5 text-sm bg-blue-50/50">
                      <span className="text-blue-700 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />
                        하복 지원 차감
                      </span>
                      <span className="tabular-nums text-blue-700 font-medium">-{sCalc.supported.toLocaleString()}원</span>
                    </div>
                  )}
                  {supplyTotal > 0 && (
                    <div className="flex justify-between items-center px-4 py-2.5 text-sm">
                      <span className="text-gray-600">용품</span>
                      <span className="tabular-nums text-gray-800">{supplyTotal.toLocaleString()}원</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center px-4 py-3.5 bg-gray-50 border-t-2 border-gray-200">
                    <span className="text-base font-bold text-gray-900">최종 납부액</span>
                    <span className="text-lg font-bold text-primary-900 tabular-nums">{payable.toLocaleString()}원</span>
                  </div>
                  {nameTagCashTotal > 0 && (
                    <div className="flex justify-between items-center px-4 py-3 bg-orange-50 border-t border-orange-200">
                      <span className="text-sm font-semibold text-orange-700 flex items-center gap-1.5">
                        <span className="inline-block w-2 h-2 rounded-full bg-orange-400" />
                        명찰 현금 별도
                        <span className="text-xs font-normal text-orange-500">
                          ({nameTag.orderQuantity > 0 && nameTagSvc?.unit_price ? `명찰 ${nameTag.orderQuantity}장` : ''}
                          {nameTag.orderQuantity > 0 && nameTagSvc?.unit_price && nameTag.attachQuantity > 0 && nameTagSvc?.attach_price ? ' + ' : ''}
                          {nameTag.attachQuantity > 0 && nameTagSvc?.attach_price ? `부착 ${nameTag.attachQuantity}장` : ''})
                        </span>
                      </span>
                      <span className="text-sm font-bold text-orange-700 tabular-nums">{nameTagCashTotal.toLocaleString()}원</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* 서명 */}
        <SignatureCanvas onSign={setSignature} initialSignature={measurementData?.signature || ''} />
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* 딤 */}
      <div className="absolute inset-0 bg-black/50" onClick={handleTempSaveAndClose} />

      {/* 시트 */}
      <div className="relative bg-white rounded-t-3xl flex flex-col h-auto max-h-[92vh] w-full">
        {/* 핸들 */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div>
              <span className="text-lg font-bold text-gray-900">{student.name}</span>
              <span className="ml-2 text-sm text-gray-500">{formatGender(student.gender)}</span>
            </div>
            <div className="text-sm text-gray-400">
              {measurementData.from_school} → <span className="font-medium text-gray-700">{measurementData.to_school}</span>
            </div>
          </div>
          <button
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 bg-transparent border-none cursor-pointer rounded-full hover:bg-gray-100 text-xl"
            onClick={handleTempSaveAndClose}
          >
            ×
          </button>
        </div>

        {/* Step 1: 시즌 탭 (헤더 고정) */}
        {step === 1 && (
          <div className="flex shrink-0 border-b border-gray-100 bg-gray-50">
            {(['winter', 'summer'] as const).map((season) => (
              <button
                key={season}
                type="button"
                className={`flex-1 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors bg-transparent cursor-pointer ${
                  activeSeasonTab === season
                    ? 'border-primary-900 text-primary-900 bg-white'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
                onClick={() => {
                  setActiveSeasonTab(season);
                  if (contentRef.current) contentRef.current.scrollTop = 0;
                }}
              >
                {season === 'winter' ? '동복' : '하복'}
              </button>
            ))}
          </div>
        )}

        {/* 콘텐츠 */}
        <div ref={contentRef} className="overflow-y-auto px-5 py-4 flex flex-col gap-5">
          {step === 1 ? (
            <>
              {activeSeasonTab === 'winter'
                ? renderUniformSection('동복', winterUniforms, 'winter')
                : renderUniformSection('하복', summerUniforms, 'summer')}
              {(() => {
                const currentItems = activeSeasonTab === 'winter' ? winterUniforms : summerUniforms;
                const usedIds = new Set(currentItems.map((i) => i.productId));
                const addableProducts = (measurementData.uniform_products ?? []).filter(
                  (p) => !usedIds.has(String(p.product_id)),
                );
                if (addableProducts.length === 0) return null;
                return (
                  <select
                    className="w-full px-3 py-2 border border-dashed border-blue-300 rounded-xl text-sm text-blue-600 bg-blue-50 outline-none cursor-pointer"
                    value=""
                    onChange={(e) => {
                      const product = addableProducts.find((p) => String(p.product_id) === e.target.value);
                      if (product) onAddUniformFromProduct(activeSeasonTab, product);
                    }}
                  >
                    <option value="">+ 품목 추가</option>
                    {addableProducts.map((p) => (
                      <option key={p.product_id} value={String(p.product_id)}>
                        {p.product_name}
                      </option>
                    ))}
                  </select>
                );
              })()}
              <div className="flex gap-4 items-start">
                {renderSupplySection()}
                {renderNameTagSection()}
              </div>
            </>
          ) : (
            renderConfirmTable()
          )}
        </div>

        {/* 하단 버튼 */}
        <div className="flex gap-3 px-5 py-4 border-t border-gray-100 shrink-0">
          {step === 1 ? (
            <>
              <button
                className="flex-1 py-3.5 bg-gray-100 text-gray-600 text-base font-medium rounded-xl border-none cursor-pointer hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
                onClick={handleTempSaveAndClose}
                disabled={isTempSaving}
              >
                {isTempSaving ? '저장 중...' : '임시저장'}
              </button>
              <button
                className="flex-2 py-3.5 bg-primary-900 text-white text-base font-medium rounded-xl border-none cursor-pointer hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ flex: 2 }}
                disabled={isSubmitting}
                onClick={handleNext}
              >
                {isSubmitting ? '저장 중...' : '다음 · 확인 및 서명'}
              </button>
            </>
          ) : (
            <>
              <button
                className="flex-1 py-3.5 bg-gray-100 text-gray-600 text-base font-medium rounded-xl border-none cursor-pointer hover:bg-gray-200"
                onClick={() => setStep(1)}
              >
                이전
              </button>
              <button
                className="flex-2 py-3.5 bg-green-600 text-white text-base font-medium rounded-xl border-none cursor-pointer hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ flex: 2 }}
                disabled={!signature || isSubmitting}
                onClick={handleConfirm}
              >
                {isSubmitting ? '처리 중...' : '확정 완료'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
