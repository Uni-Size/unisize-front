import React, { useState, useEffect, useRef } from "react";
import { Modal, Select, Input } from "@components/atoms";
import { Toast } from "@components/atoms/Toast";
import type { SchoolPrice } from "../ProductAddModal";
import {
  CATEGORY_GROUPS,
  getCategoryLabel,
} from "@/constants/productCategories";
import { GENDER_OPTIONS, getGenderLabel } from "@/constants/gender";
import {
  SEASON_OPTIONS,
  REPAIRABLE_OPTIONS,
  REPAIR_REQUIRED_OPTIONS,
  SIZE_TYPE_OPTIONS,
  NUMERIC_STEP_OPTIONS,
  DEFAULT_SIZES,
  sortSizes,
  getSeasonLabel,
} from "@/constants/product";
import { formatDateTime } from "@/utils/dateUtils";
import { updateProductSelectable, getAllProducts, type ProductSize, type ProductSizeResponse, type Product } from "@/api/product";
import { getApiErrorString } from "@/utils/errorUtils";

export interface ProductSchoolDetail {
  school_name: string;
  display_name: string;
  price: number;
  quantity: number;
  is_selectable?: boolean;
  free_support_count?: number;
  selectable_with?: { product_id: number; display_name: string; free_support_count?: number }[];
}

export interface ProductDetailData {
  id: string;
  season: string;
  category: string;
  gender: string;
  displayName: string;
  originalPrice: number;
  isRepairable: string;
  isRepairRequired: string;
  sizeType: string;
  schools: SchoolPrice[];
  rawSchools?: ProductSchoolDetail[];
  sizes?: ProductSizeResponse[];
  sizesRequest?: ProductSize[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductDetailData | null;
  onUpdate: (data: ProductDetailData) => Promise<ProductDetailData>;
  onOpenSchoolModal?: () => void;
  pendingSchool?: ProductSchoolDetail | null;
}

// ============================================================================
// 뷰 모드 필드 컴포넌트
// ============================================================================

const FieldView = ({
  label,
  value,
  align = "left",
}: {
  label: string;
  value: string;
  align?: "left" | "right";
}) => (
  <div className="flex flex-col gap-2">
    <span className="text-15 font-normal text-gray-700">{label}</span>
    <div
      className={`flex items-center h-12.5 px-4 border border-gray-200 rounded-lg bg-transparent text-15 font-normal leading-none text-gray-700 ${align === "right" ? "justify-end" : ""}`}
    >
      {value}
    </div>
  </div>
);

// ============================================================================
// 편집 state를 담당하는 내부 컴포넌트 (key로 리마운트해서 초기화)
// ============================================================================

const ProductDetailModalContent = ({
  product,
  onClose,
  onUpdate,
  onOpenSchoolModal,
  pendingSchool,
  isOpen,
}: ProductDetailModalProps & { product: ProductDetailData }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [season, setSeason] = useState(product.season);
  const [category, setCategory] = useState(product.category);
  const [gender, setGender] = useState(product.gender);
  const [displayName, setDisplayName] = useState(product.displayName);
  const [originalPrice, setOriginalPrice] = useState(
    String(product.originalPrice),
  );
  const [isRepairable, setIsRepairable] = useState(product.isRepairable);
  const [isRepairRequired, setIsRepairRequired] = useState(
    product.isRepairRequired,
  );
  const [sizeType, setSizeUnit] = useState(product.sizeType);
  const [numericStep, setNumericStep] = useState(() => {
    if (product.sizeType !== "numeric") return "";
    const sizes = (product.sizes ?? []).map((s) => s.size);
    const overlap5 = sizes.filter((s) => DEFAULT_SIZES.numeric_5.includes(s)).length;
    const overlap3 = sizes.filter((s) => DEFAULT_SIZES.numeric_3.includes(s)).length;
    if (overlap5 >= 3 && overlap5 >= overlap3) return "5";
    if (overlap3 >= 3) return "3";
    return "";
  });
  const [editSizes, setEditSizes] = useState<ProductSize[]>(
    [...new Map((product.sizes ?? []).map((s) => [s.size, { size: s.size }])).values()]
  );
  const [currentSizes, setCurrentSizes] = useState<ProductSizeResponse[]>(product.sizes ?? []);
  const [editSchools, setEditSchools] = useState<ProductSchoolDetail[]>(
    product.rawSchools ?? [],
  );
  const [stockRows, setStockRows] = useState<{ round: string; quantities: Record<string, string> }[]>([]);
  const [schoolProducts, setSchoolProducts] = useState<Record<string, Product[]>>({});
  const [selectableSaving, setSelectableSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(null);

  const prevPendingSchool = useRef<ProductSchoolDetail | null | undefined>(null);
  useEffect(() => {
    if (pendingSchool && pendingSchool !== prevPendingSchool.current) {
      prevPendingSchool.current = pendingSchool;
      setEditSchools((prev) =>
        prev.find((s) => s.school_name === pendingSchool.school_name)
          ? prev
          : [...prev, pendingSchool]
      );
    }
  }, [pendingSchool]);

  const handleClose = () => {
    setIsEditMode(false);
    onClose();
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = await onUpdate({
        ...product,
        season,
        category,
        gender,
        displayName,
        originalPrice: Number(originalPrice),
        isRepairable,
        isRepairRequired,
        sizeType,
        sizesRequest: (() => {
          const validSizes = editSizes.filter((s) => s.size.trim() !== "");
          if (stockRows.length === 0) return validSizes as ProductSize[];
          return stockRows.flatMap((row) =>
            validSizes.map((s) => ({
              size: s.size,
              total_in: Number(row.quantities[s.size] ?? 0),
              round_number: row.round !== "" ? Number(row.round) : undefined,
            }))
          ) as ProductSize[];
        })(),
        rawSchools: editSchools,
      });
      setCurrentSizes(updated.sizes ?? []);
      setIsEditMode(false);
      setStockRows([]);
      setToast({ message: "수정이 완료되었습니다.", variant: "success" });
    } catch (err) {
      setToast({ message: getApiErrorString(err, "수정에 실패했습니다."), variant: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const applySizeTypeChange = (value: string) => {
    setSizeUnit(value);
    setNumericStep("");
    if (value !== "numeric") {
      const defaults = DEFAULT_SIZES[value] ?? [];
      setEditSizes(defaults.map((size) => ({ size })));
    } else {
      setEditSizes([]);
    }
  };

  const handleSizeTypeChange = (value: string) => {
    if (currentSizes.length > 0) {
      if (!window.confirm("사이즈 타입을 변경하면 기존에 등록된 재고가 초기화됩니다.\n계속 변경하시겠습니까?")) return;
    }
    applySizeTypeChange(value);
  };

  const handleNumericStepChange = (step: string) => {
    setNumericStep(step);
    const key = step === "5" ? "numeric_5" : "numeric_3";
    const defaults = DEFAULT_SIZES[key] ?? [];
    setEditSizes(defaults.map((size) => ({ size })));
  };

  const handleSizeValueChange = (index: number, value: string) => {
    const trimmed = value.trim();
    setEditSizes((prev) => {
      const isDuplicate = prev.some((s, i) => i !== index && s.size.trim() === trimmed && trimmed !== "");
      if (isDuplicate) return prev;
      return prev.map((s, i) => i === index ? { ...s, size: value } : s);
    });
  };

  const handleSortSizes = () => {
    setEditSizes((prev) => {
      const filled = prev.filter((s) => s.size.trim() !== "");
      const empty = prev.filter((s) => s.size.trim() === "");
      return [...sortSizes(filled.map((s) => s.size)).map((size) => ({ size })), ...empty];
    });
  };

  const handleAddSizeRow = () => {
    setEditSizes((prev) => [...prev, { size: "" }]);
  };

  const handleRemoveSizeRow = (index: number) => {
    const size = editSizes[index]?.size;
    if (size) {
      const current = currentSizes.find((s) => s.size === size);
      if (current && current.quantity > 0) {
        if (!window.confirm(`"${size}" 치수에 재고가 ${current.quantity}개 남아있습니다. 그래도 삭제하시겠습니까?`)) return;
      }
    }
    setEditSizes((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSchoolField = (
    index: number,
    field: keyof ProductSchoolDetail,
    value: string | number | boolean | { product_id: number; display_name: string }[],
  ) => {
    setEditSchools((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    );
  };

  const getOptionLabel = (
    options: { value: string; label: string }[],
    value: string,
  ) => options.find((opt) => opt.value === value)?.label ?? value;

  const handleSelectableSave = async (schoolIdx: number) => {
    const s = editSchools[schoolIdx];
    setSelectableSaving(true);
    try {
      await updateProductSelectable(Number(product.id), s.school_name, {
        is_selectable: s.is_selectable ?? false,
        selectable_with: (s.selectable_with ?? []).map((sw) => sw.product_id),
      });
      setToast({ message: "교체 가능 설정이 저장되었습니다.", variant: "success" });
    } catch (err) {
      setToast({ message: getApiErrorString(err, "교체 가능 설정 저장에 실패했습니다."), variant: "error" });
    } finally {
      setSelectableSaving(false);
    }
  };

  const handleAddStockRow = () => {
    setStockRows((prev) => [...prev, { round: "", quantities: {} }]);
  };

  const handleRemoveStockRow = (rowIdx: number) => {
    setStockRows((prev) => prev.filter((_, i) => i !== rowIdx));
  };


  return (
    <>
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={product.displayName}
      width={800}
      actions={
        isEditMode ? (
          <>
            <button
              className="px-6 py-2.5 bg-neutral-500 text-white text-sm font-medium rounded-lg border-none cursor-pointer hover:opacity-90"
              onClick={() => { setIsEditMode(false); setStockRows([]); }}
            >
              취소
            </button>
            <button
              className="px-6 py-2.5 bg-primary-900 text-bg-050 text-sm font-medium rounded-lg border-none cursor-pointer hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? "저장 중..." : "저장"}
            </button>
          </>
        ) : (
          <>
            <button
              className="px-6 py-2.5 bg-yellow-700 text-bg-050 text-sm font-medium rounded-lg border-none cursor-pointer hover:opacity-90"
              onClick={() => {
                const allRounds = Array.from(new Set(
                  currentSizes.flatMap((s) => (s.rounds ?? []).map((r) => r.round_number))
                )).sort((a, b) => a - b);
                setStockRows(allRounds.map((roundNum) => ({
                  round: String(roundNum),
                  quantities: Object.fromEntries(
                    currentSizes.map((s) => [
                      s.size,
                      String(s.rounds?.find((r) => r.round_number === roundNum)?.total_in ?? ""),
                    ])
                  ),
                })));
                const season = product.season || undefined;
                const uniqueSchools = [...new Set((product.rawSchools ?? []).map((s) => s.school_name))];
                uniqueSchools.forEach((schoolName) => {
                  getAllProducts({ school_name: schoolName, season, limit: 200 })
                    .then((res) => setSchoolProducts((prev) => ({ ...prev, [schoolName]: res.products })))
                    .catch(() => {});
                });
                setIsEditMode(true);
              }}
            >
              수정
            </button>
            <button
              className="px-6 py-2.5 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100/50"
              onClick={handleClose}
            >
              닫기
            </button>
          </>
        )
      }
    >
      <div className="flex flex-col gap-4 w-full">
        {/* 등록일 / 수정일 */}
        <div className="flex justify-end gap-4">
          <div className="flex items-center gap-1.5 text-xs text-bg-400">
            <span>등록일</span>
            <span>{formatDateTime(product.createdAt) || "-"}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-bg-400">
            <span>최종 수정일</span>
            <span>{formatDateTime(product.updatedAt) || "-"}</span>
          </div>
        </div>

        {/* 시즌 / 카테고리 / 성별 */}
        <div className="flex gap-2 items-start">
          <div className="flex-1 min-w-0">
            {isEditMode ? (
              <Select
                label="시즌"
                placeholder="시즌"
                options={SEASON_OPTIONS}
                value={season}
                onChange={setSeason}
                fullWidth
              />
            ) : (
              <FieldView label="시즌" value={getSeasonLabel(product.season)} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            {isEditMode ? (
              <Select
                label="카테고리"
                options={CATEGORY_GROUPS.flatMap((g) => g.options)}
                placeholder="카테고리"
                groups={CATEGORY_GROUPS}
                value={category}
                onChange={setCategory}
                searchable
                fullWidth
              />
            ) : (
              <FieldView
                label="카테고리"
                value={getCategoryLabel(product.category)}
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            {isEditMode ? (
              <Select
                label="성별"
                placeholder="성별"
                options={GENDER_OPTIONS}
                value={gender}
                onChange={setGender}
                fullWidth
              />
            ) : (
              <FieldView label="성별" value={getGenderLabel(product.gender)} />
            )}
          </div>
        </div>

        {/* 표시명 / 가격 */}
        <div className="flex gap-2 items-start">
          <div className="flex-1 min-w-0">
            {isEditMode ? (
              <Input
                label="표시명"
                placeholder="흰색 오각"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                fullWidth
              />
            ) : (
              <FieldView label="표시명" value={product.displayName} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            {isEditMode ? (
              <Input
                label="가격"
                placeholder="가격"
                type="number"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                className="text-right"
                fullWidth
              />
            ) : (
              <FieldView
                label="가격"
                value={`${product.originalPrice.toLocaleString()}원`}
                align="right"
              />
            )}
          </div>
        </div>

        {/* 수선 가능여부 / 수선 필수 여부 */}
        <div className="flex gap-2 items-start">
          <div className="flex-1 min-w-0">
            {isEditMode ? (
              <Select
                label="수선 가능여부"
                placeholder="불가능"
                options={REPAIRABLE_OPTIONS}
                value={isRepairable}
                onChange={setIsRepairable}
                fullWidth
              />
            ) : (
              <FieldView
                label="수선 가능여부"
                value={getOptionLabel(REPAIRABLE_OPTIONS, product.isRepairable)}
              />
            )}
          </div>
          <div className={`flex-1 min-w-0 ${isEditMode && isRepairable !== "yes" ? "opacity-30 pointer-events-none" : ""}`}>
            {isEditMode ? (
              <Select
                label="수선 필수 여부"
                placeholder="선택사항"
                options={REPAIR_REQUIRED_OPTIONS}
                value={isRepairRequired}
                onChange={setIsRepairRequired}
                fullWidth
              />
            ) : product.isRepairable === "yes" ? (
              <FieldView
                label="수선 필수 여부"
                value={getOptionLabel(
                  REPAIR_REQUIRED_OPTIONS,
                  product.isRepairRequired,
                )}
              />
            ) : null}
          </div>
        </div>

        {/* 사이즈 */}
        <div className="flex gap-2 items-start">
          {/* 왼쪽: 유형 + 단위 */}
          <div className="w-1/2 flex flex-col gap-2">
            {isEditMode ? (
              <Select
                label="사이즈"
                placeholder="유형 선택"
                options={SIZE_TYPE_OPTIONS}
                value={sizeType}
                onChange={handleSizeTypeChange}
                fullWidth
              />
            ) : (
              <FieldView
                label="사이즈"
                value={getOptionLabel(SIZE_TYPE_OPTIONS, product.sizeType)}
              />
            )}
            {isEditMode && sizeType === "numeric" && (
              <div className="flex flex-col gap-1.5">
                <span className="text-15 font-normal text-gray-700">단위</span>
                <div className="flex items-center gap-4 h-12.5">
                  {NUMERIC_STEP_OPTIONS.map((opt) => (
                    <label key={opt.value} className="flex items-center gap-1.5 text-14 text-gray-700 cursor-pointer">
                      <input
                        type="radio"
                        name="detail-numeric-step"
                        value={opt.value}
                        checked={numericStep === opt.value}
                        onChange={() => handleNumericStepChange(opt.value)}
                        className="w-4 h-4 accent-primary-900"
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* 오른쪽: 사이즈 목록 */}
          {(() => {
            const viewSizes = isEditMode
              ? sortSizes(editSizes.map((s) => s.size).filter((s) => s.trim() !== ""))
              : sortSizes([...new Set(currentSizes.map((s) => s.size))]);
            const hasAnySizes = isEditMode ? editSizes.length > 0 : currentSizes.length > 0;
            return (
              <div className="w-1/2 flex flex-col gap-1.5">
                {hasAnySizes && (
                  <>
                    <span className="text-15 font-normal text-gray-700">치수</span>
                    <div className="flex flex-wrap gap-1.5 p-2.5 border border-gray-200 rounded-lg bg-gray-50 min-h-12.5">
                      {isEditMode ? (
                        editSizes.map((s, idx) => (
                          <div key={idx} className={`flex items-center gap-1 px-2 py-1 bg-white border rounded text-13 text-gray-700 ${s.size.trim() === "" ? "border-dashed border-gray-300" : "border-gray-200"}`}>
                            <input
                              className="w-10 border-none bg-transparent text-13 text-gray-700 text-center outline-none"
                              placeholder="입력"
                              value={s.size}
                              onChange={(e) => handleSizeValueChange(idx, e.target.value)}
                              onBlur={handleSortSizes}
                            />
                            <button
                              className="ml-0.5 text-gray-300 hover:text-red-400 border-none bg-transparent cursor-pointer text-14 leading-none"
                              onClick={() => handleRemoveSizeRow(idx)}
                            >×</button>
                          </div>
                        ))
                      ) : (
                        viewSizes.map((size) => (
                          <div key={size} className="flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded text-13 text-gray-700">
                            <span className="px-1">{size}</span>
                          </div>
                        ))
                      )}
                      {isEditMode && (
                        <button
                          className="px-2 py-1 text-13 text-primary-900 border border-dashed border-primary-300 rounded bg-transparent cursor-pointer hover:bg-primary-50"
                          onClick={handleAddSizeRow}
                        >+</button>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })()}
        </div>

        {/* 사용 학교 */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-15 font-normal text-gray-700">사용 학교</span>
            {isEditMode && onOpenSchoolModal && (
              <button
                className="px-4 py-1.5 bg-primary-900 text-bg-050 text-sm font-medium rounded-lg border-none cursor-pointer hover:opacity-90"
                onClick={onOpenSchoolModal}
              >
                학교 추가
              </button>
            )}
          </div>
          {editSchools.length > 0 ? (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-14 text-gray-700">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-2.5 text-left font-medium">학교명</th>
                    <th className="px-4 py-2.5 text-left font-medium">표시명</th>
                    <th className="px-4 py-2.5 text-right font-medium">가격</th>
                    <th className="px-4 py-2.5 text-right font-medium">지원 개수</th>
                    <th className="px-4 py-2.5 text-center font-medium">교체 가능</th>
                    {isEditMode && <th className="px-4 py-2.5 w-8"></th>}
                  </tr>
                </thead>
                <tbody>
                  {editSchools.map((s, i) => (
                    <React.Fragment key={i}>
                      <tr className="border-b border-gray-100">
                        <td className="px-4 py-2.5">{s.school_name}</td>
                        <td className="px-4 py-2.5">
                          {isEditMode ? (
                            <input
                              className="w-full border border-gray-200 rounded px-2 py-1 text-14 text-gray-700 outline-none focus:border-gray-400"
                              value={s.display_name}
                              onChange={(e) => updateSchoolField(i, "display_name", e.target.value)}
                            />
                          ) : (
                            s.display_name
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          {isEditMode ? (
                            <div className="flex items-center justify-end gap-1">
                              <input
                                type="number"
                                className="w-24 border border-gray-200 rounded px-2 py-1 text-14 text-gray-700 text-right outline-none focus:border-gray-400 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                value={s.price}
                                onChange={(e) => updateSchoolField(i, "price", Number(e.target.value))}
                              />
                              <span className="shrink-0">원</span>
                            </div>
                          ) : (
                            `${s.price.toLocaleString()}원`
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          {isEditMode ? (
                            <input
                              type="number"
                              className="w-16 border border-gray-200 rounded px-2 py-1 text-14 text-gray-700 text-right outline-none focus:border-gray-400 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                              value={s.quantity}
                              onChange={(e) => updateSchoolField(i, "quantity", Number(e.target.value))}
                            />
                          ) : (
                            s.quantity
                          )}
                        </td>
                        <td className="px-4 py-2.5">
                          {s.is_selectable ? (
                            <div className="flex flex-col gap-1">
                              <div className="flex flex-wrap gap-1">
                                {(s.selectable_with ?? []).map((sw) => (
                                  <span key={sw.product_id} className="px-2 py-0.5 text-12 bg-primary-50 text-primary-900 border border-primary-200 rounded">
                                    {sw.display_name}
                                  </span>
                                ))}
                              </div>
                              {!isEditMode && (
                                <span className="text-12 text-gray-400">
                                  무상 최대 <span className="font-medium text-gray-600">
                                    {(s.quantity ?? 0) + (s.selectable_with ?? []).reduce((sum, sw) => sum + (sw.free_support_count ?? 0), 0)}개
                                  </span> 한도 내 자유 조합
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-13 text-gray-400 block text-center">-</span>
                          )}
                        </td>
                        {isEditMode && (
                          <td className="px-2 py-2.5 text-center">
                            <button
                              className="text-gray-300 hover:text-red-400 border-none bg-transparent cursor-pointer text-16 leading-none"
                              onClick={() => setEditSchools((prev) => prev.filter((_, j) => j !== i))}
                            >×</button>
                          </td>
                        )}
                      </tr>
                      {isEditMode && (
                        <tr className="border-b border-gray-100 bg-gray-50">
                          <td colSpan={6} className="px-4 py-2">
                            <div className="flex flex-col gap-1.5">
                              <div className="flex items-center gap-2">
                                <label className="flex items-center gap-1.5 text-13 text-gray-600 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    className="w-3.5 h-3.5 accent-primary-900"
                                    checked={s.is_selectable ?? false}
                                    onChange={(e) => updateSchoolField(i, "is_selectable", e.target.checked)}
                                  />
                                  교체 가능 설정
                                </label>
                                {s.is_selectable && <span className="text-12 text-gray-400">품목별 무상 개수는 지원 개수 칸에서 설정</span>}
                              </div>
                              {s.is_selectable && (
                                <>
                                  {(() => {
                                    const selectedWith = s.selectable_with ?? [];
                                    const selectedQty = selectedWith.reduce((sum, sw) => sum + (sw.free_support_count ?? 0), 0);
                                    const totalLimit = (s.quantity ?? 0) + selectedQty;
                                    return (
                                      <div className="text-12 text-gray-500">
                                        현재 품목 무상 <span className="font-medium text-gray-700">{s.quantity ?? 0}개</span>
                                        {selectedWith.length > 0 && (
                                          <> · 그룹 합산 최대 <span className="font-medium text-gray-700">{totalLimit}개</span> 한도</>
                                        )}
                                      </div>
                                    );
                                  })()}
                                  <div className="flex flex-wrap gap-1.5">
                                    {(schoolProducts[s.school_name] ?? [])
                                      .filter((p) => String(p.id) !== product.id)
                                      .map((p) => {
                                        const selected = (s.selectable_with ?? []).some((sw) => sw.product_id === p.id);
                                        const swInfo = (s.selectable_with ?? []).find((sw) => sw.product_id === p.id);
                                        return (
                                          <button
                                            key={p.id}
                                            className={`px-2.5 py-1 text-13 rounded border cursor-pointer ${selected ? "bg-primary-900 text-white border-primary-900" : "bg-white text-gray-700 border-gray-200 hover:border-primary-300"}`}
                                            onClick={() => {
                                              const prev = s.selectable_with ?? [];
                                              updateSchoolField(i, "selectable_with", selected ? prev.filter((sw) => sw.product_id !== p.id) : [...prev, { product_id: p.id, display_name: p.name }]);
                                            }}
                                          >
                                            {p.name}
                                            {selected && swInfo?.free_support_count != null && (
                                              <span className="ml-1 text-12 text-primary-200">{swInfo.free_support_count}개</span>
                                            )}
                                          </button>
                                        );
                                      })}
                                    {(schoolProducts[s.school_name] ?? []).filter((p) => String(p.id) !== product.id).length === 0 && (
                                      <span className="text-13 text-gray-400">같은 시즌의 다른 품목이 없습니다</span>
                                    )}
                                  </div>
                                  <div className="flex justify-end">
                                    <button
                                      className="px-3 py-1 text-13 bg-primary-900 text-white rounded border-none cursor-pointer hover:opacity-90 disabled:opacity-40"
                                      disabled={selectableSaving}
                                      onClick={() => handleSelectableSave(i)}
                                    >
                                      저장
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-15 text-gray-400 text-center py-2">
              사용하는 학교가 없습니다
            </p>
          )}
        </div>

        {/* 재고 */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-15 font-normal text-gray-700">재고</span>
            {isEditMode && editSizes.length > 0 && (
              <button
                className="px-3 py-1.5 text-13 text-primary-900 border border-primary-200 rounded-lg bg-transparent cursor-pointer hover:bg-primary-50"
                onClick={handleAddStockRow}
              >
                + 차수 추가
              </button>
            )}
          </div>
          {(isEditMode ? editSizes.length > 0 : currentSizes.length > 0) ? (() => {
            const validSizes = isEditMode
              ? sortSizes(editSizes.map((s) => s.size).filter((s) => s.trim() !== ""))
              : sortSizes([...new Set(currentSizes.map((s) => s.size))]);
            return (
              <div className="border border-gray-200 rounded-lg overflow-x-auto">
                <table className="text-13 text-gray-700 border-collapse w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-3 py-2 text-left font-medium text-gray-500 whitespace-nowrap border-r border-gray-200 sticky left-0 bg-gray-50 w-16">차수</th>
                      {validSizes.map((size) => (
                        <th key={size} className="px-3 py-2 text-center font-medium whitespace-nowrap min-w-16">{size}</th>
                      ))}
                      {isEditMode && <th className="px-3 py-2 w-10"></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {/* 차수별 행 */}
                    {isEditMode ? (
                      stockRows.map((row, rowIdx) => (
                        <tr key={rowIdx} className="border-b border-gray-100">
                          <td className="px-2 py-1.5 border-r border-gray-200 sticky left-0 bg-white">
                            {row.round !== "" ? (
                              <span className="px-1.5 text-13 text-gray-500">
                                {row.round === "0" ? "이월" : `${row.round}차 입고`}
                              </span>
                            ) : (
                              <input
                                type="number"
                                className="w-12 border border-gray-200 rounded px-1.5 py-1 text-13 text-gray-700 text-center outline-none focus:border-gray-400 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                placeholder="차"
                                value={row.round}
                                onChange={(e) => setStockRows((prev) => prev.map((r, i) => i === rowIdx ? { ...r, round: e.target.value } : r))}
                              />
                            )}
                          </td>
                          {validSizes.map((size) => (
                            <td key={size} className="px-2 py-1.5 text-center">
                              <input
                                type="number"
                                className="w-14 border border-gray-200 rounded px-1.5 py-1 text-13 text-gray-700 text-center outline-none focus:border-gray-400 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                placeholder="0"
                                value={row.quantities[size] ?? ""}
                                onChange={(e) => setStockRows((prev) => prev.map((r, i) => i === rowIdx ? { ...r, quantities: { ...r.quantities, [size]: e.target.value } } : r))}
                              />
                            </td>
                          ))}
                          <td className="px-2 py-1.5 text-center">
                            <button
                              className="px-2 py-1 bg-transparent text-gray-400 text-xs rounded border-none cursor-pointer hover:text-red-400"
                              onClick={() => handleRemoveStockRow(rowIdx)}
                            >
                              ×
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      (() => {
                        const allRounds = Array.from(new Set(
                          currentSizes.flatMap((s) => (s.rounds ?? []).map((r) => r.round_number))
                        )).sort((a, b) => a - b);
                        return allRounds.map((roundNum) => (
                          <tr key={roundNum} className="border-b border-gray-100">
                            <td className="px-3 py-2 text-gray-500 whitespace-nowrap border-r border-gray-200 sticky left-0 bg-white">
                              {roundNum === 0 ? "이월" : `${roundNum}차 입고`}
                            </td>
                            {validSizes.map((size) => {
                              const sizeData = currentSizes.find((s) => s.size === size);
                              const round = sizeData?.rounds?.find((r) => r.round_number === roundNum);
                              return (
                                <td key={size} className="px-3 py-2 text-center text-gray-600">
                                  {round ? round.total_in : <span className="text-gray-300">-</span>}
                                </td>
                              );
                            })}
                          </tr>
                        ));
                      })()
                    )}
                    {/* 현재 재고 합계 */}
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <td className="px-3 py-2 text-gray-700 whitespace-nowrap border-r border-gray-200 sticky left-0 bg-gray-50 font-medium">현재 재고</td>
                      {validSizes.map((size) => {
                        const cur = currentSizes.find((s) => s.size === size);
                        return (
                          <td key={size} className="px-3 py-2 text-center font-medium">{cur?.quantity ?? 0}</td>
                        );
                      })}
                      {isEditMode && <td></td>}
                    </tr>
                  </tbody>
                </table>
              </div>
            );
          })() : (
            <p className="text-15 text-gray-400 text-center py-2">
              등록된 사이즈가 없습니다
            </p>
          )}
        </div>
      </div>
    </Modal>
    {toast && (
      <Toast message={toast.message} variant={toast.variant} onClose={() => setToast(null)} />
    )}
    </>
  );
};

// ============================================================================
// 외부 컴포넌트 (product.id를 key로 내부 컴포넌트 리마운트)
// ============================================================================

export const ProductDetailModal = (props: ProductDetailModalProps) => {
  if (!props.product) return null;
  return (
    <ProductDetailModalContent
      key={props.product.id}
      {...props}
      product={props.product}
    />
  );
};
