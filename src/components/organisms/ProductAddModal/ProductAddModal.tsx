import { useState } from "react";
import { Modal, Select, Input } from "@components/atoms";
import { CATEGORY_GROUPS } from "@/constants/productCategories";
import { GENDER_OPTIONS } from "@/constants/gender";
import {
  SEASON_OPTIONS,
  REPAIRABLE_OPTIONS,
  REPAIR_REQUIRED_OPTIONS,
  SIZE_TYPE_OPTIONS,
  NUMERIC_STEP_OPTIONS,
  DEFAULT_SIZES,
  sortSizes,
} from "@/constants/product";
import type { ProductSize } from "@/api/product";

export interface SchoolPrice {
  schoolId: string;
  schoolName: string;
  price: number;
  year: string;
}

export interface SizeWithStock {
  size: string;
  quantity: number;
}

export interface ProductAddData {
  season: string;
  category: string;
  gender: string;
  displayName: string;
  originalPrice: number;
  isRepairable: string;
  isRepairRequired: string;
  sizeType: string;
  sizes: ProductSize[];
  schools: SchoolPrice[];
}

export interface ProductAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductAddData) => Promise<void> | void;
  onOpenSchoolModal: () => void;
  selectedSchools: SchoolPrice[];
  onRemoveSchool: (schoolId: string) => void;
  onSchoolPriceChange: (schoolId: string, price: number) => void;
  zIndex?: number;
}

export const ProductAddModal = ({
  isOpen,
  onClose,
  onSubmit,
  onOpenSchoolModal,
  selectedSchools,
  onRemoveSchool,
  onSchoolPriceChange,
  zIndex,
}: ProductAddModalProps) => {
  const [season, setSeason] = useState("");
  const [category, setCategory] = useState("");
  const [gender, setGender] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [isRepairable, setIsRepairable] = useState("");
  const [isRepairRequired, setIsRepairRequired] = useState("");
  const [sizeType, setSizeType] = useState("");
  const [numericStep, setNumericStep] = useState("");
  const [sizesWithStock, setSizesWithStock] = useState<SizeWithStock[]>([]);
  const [stockRows, setStockRows] = useState<{ round: string; quantities: Record<string, string> }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSizeTypeChange = (value: string) => {
    setSizeType(value);
    setNumericStep("");
    if (value !== "numeric") {
      const defaults = DEFAULT_SIZES[value] ?? [];
      setSizesWithStock(defaults.map((size) => ({ size, quantity: 0 })));
    } else {
      setSizesWithStock([]);
    }
  };

  const handleNumericStepChange = (step: string) => {
    setNumericStep(step);
    const key = step === "5" ? "numeric_5" : "numeric_3";
    const defaults = DEFAULT_SIZES[key] ?? [];
    setSizesWithStock(defaults.map((size) => ({ size, quantity: 0 })));
  };

  const handleSizeValueChange = (index: number, value: string) => {
    const trimmed = value.trim();
    setSizesWithStock((prev) => {
      const isDuplicate = prev.some((s, i) => i !== index && s.size.trim() === trimmed && trimmed !== "");
      if (isDuplicate) return prev;
      return prev.map((s, i) => i === index ? { ...s, size: value } : s);
    });
  };

  const handleSortSizes = () => {
    setSizesWithStock((prev) => {
      const filled = prev.filter((s) => s.size.trim() !== "");
      const empty = prev.filter((s) => s.size.trim() === "");
      return [...sortSizes(filled.map((s) => s.size)).map((size) => ({ size, quantity: 0 })), ...empty];
    });
  };

  const handleAddSizeRow = () => {
    setSizesWithStock((prev) => [...prev, { size: "", quantity: 0 }]);
  };

  const handleRemoveSizeRow = (index: number) => {
    setSizesWithStock((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    const missing: string[] = [];
    if (!displayName.trim() || displayName.trim().length < 2)
      missing.push("표시명(2글자 이상)");
    if (!category) missing.push("카테고리");
    if (!gender) missing.push("성별");
    if (!originalPrice || Number(originalPrice) <= 0) missing.push("가격");

    if (missing.length > 0) {
      alert(`다음 항목을 입력해주세요: ${missing.join(", ")}`);
      return;
    }

    const validSizes = sizesWithStock.filter((s) => s.size.trim() !== "");
    const sizes = stockRows.length > 0
      ? stockRows.flatMap((row) =>
          validSizes.map((s) => ({
            size: s.size,
            total_in: Number(row.quantities[s.size] ?? 0),
            round_number: row.round !== "" ? Number(row.round) : undefined,
          }))
        )
      : validSizes.map(({ size }) => ({ size }));

    setIsSubmitting(true);
    try {
      await onSubmit({
        season,
        category,
        gender,
        displayName,
        originalPrice: Number(originalPrice),
        isRepairable,
        isRepairRequired,
        sizeType,
        sizes,
        schools: selectedSchools,
      });
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSeason("");
    setCategory("");
    setGender("");
    setDisplayName("");
    setOriginalPrice("");
    setIsRepairable("");
    setIsRepairRequired("");
    setSizeType("");
    setNumericStep("");
    setSizesWithStock([]);
    setStockRows([]);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="품목추가"
      zIndex={zIndex}
      width={800}
      actions={
        <>
          <button
            className="px-6 py-2.5 bg-neutral-500 text-white text-sm font-medium rounded-lg border-none cursor-pointer hover:opacity-90"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            취소
          </button>
          <button
            className="px-6 py-2.5 bg-primary-900 text-bg-050 text-sm font-medium rounded-lg border-none cursor-pointer hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "추가 중..." : "추가"}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4 w-full">
        {/* 시즌 / 카테고리 / 성별 */}
        <div className="flex gap-2 items-start">
          <div className="flex-1 min-w-0">
            <Select
              label="시즌"
              placeholder="시즌"
              options={SEASON_OPTIONS}
              value={season}
              onChange={setSeason}
              fullWidth
            />
          </div>
          <div className="flex-1 min-w-0">
            <Select
              label="카테고리 *"
              placeholder="카테고리"
              options={CATEGORY_GROUPS.flatMap((g) => g.options)}
              groups={CATEGORY_GROUPS}
              value={category}
              onChange={setCategory}
              searchable
              fullWidth
            />
          </div>
          <div className="flex-1 min-w-0">
            <Select
              label="성별 *"
              placeholder="성별"
              options={GENDER_OPTIONS}
              value={gender}
              onChange={setGender}
              fullWidth
            />
          </div>
        </div>

        {/* 표시명 / 가격 */}
        <div className="flex gap-2 items-start">
          <div className="flex-1 min-w-0">
            <Input
              label="표시명 *"
              placeholder="흰색 오각 (2글자 이상)"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              fullWidth
            />
          </div>
          <div className="flex-1 min-w-0">
            <Input
              label="가격 *"
              placeholder="가격"
              type="number"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(e.target.value)}
              className="text-right"
              fullWidth
            />
          </div>
        </div>

        {/* 수선 가능여부 / 수선 필수 여부 */}
        <div className="flex gap-2 items-start">
          <div className="flex-1 min-w-0">
            <Select
              label="수선 가능여부"
              placeholder="불가능"
              options={REPAIRABLE_OPTIONS}
              value={isRepairable}
              onChange={setIsRepairable}
              fullWidth
            />
          </div>
          <div className={`flex-1 min-w-0 ${isRepairable !== "yes" ? "opacity-30 pointer-events-none" : ""}`}>
            <Select
              label="수선 필수 여부"
              placeholder="선택사항"
              options={REPAIR_REQUIRED_OPTIONS}
              value={isRepairRequired}
              onChange={setIsRepairRequired}
              fullWidth
            />
          </div>
        </div>

        {/* 사이즈 / 재고 */}
        <div className="flex gap-2 items-start">
          {/* 왼쪽: 유형 + 단위 */}
          <div className="w-1/2 flex flex-col gap-2">
            <Select
              label="사이즈"
              placeholder="사이즈 유형 선택"
              options={SIZE_TYPE_OPTIONS}
              value={sizeType}
              onChange={handleSizeTypeChange}
              fullWidth
            />
            {sizeType === "numeric" && (
              <div className="flex flex-col gap-1.5">
                <span className="text-15 font-normal text-gray-700">단위</span>
                <div className="flex items-center gap-4 h-12.5">
                  {NUMERIC_STEP_OPTIONS.map((opt) => (
                    <label key={opt.value} className="flex items-center gap-1.5 text-14 text-gray-700 cursor-pointer">
                      <input
                        type="radio"
                        name="add-numeric-step"
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
          <div className="w-1/2 flex flex-col gap-1.5">
            {sizesWithStock.length > 0 && (
              <>
                <span className="text-15 font-normal text-gray-700">치수</span>
                <div className="flex flex-wrap gap-1.5 p-2.5 border border-gray-200 rounded-lg bg-gray-50 min-h-12.5">
                  {/* 값 있는 항목: 정렬 후 표시 */}
                  {sortSizes(sizesWithStock.map((s) => s.size).filter((s) => s.trim() !== "")).map((size) => {
                    const idx = sizesWithStock.findIndex((s) => s.size === size);
                    const s = sizesWithStock[idx];
                    return (
                      <div key={size} className="flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded text-13 text-gray-700">
                        <input
                          className="w-10 border-none bg-transparent text-13 text-gray-700 text-center outline-none"
                          value={s.size}
                          onChange={(e) => handleSizeValueChange(idx, e.target.value)}
                          onBlur={handleSortSizes}
                        />
                        <button
                          className="ml-0.5 text-gray-300 hover:text-red-400 border-none bg-transparent cursor-pointer text-14 leading-none"
                          onClick={() => handleRemoveSizeRow(idx)}
                        >×</button>
                      </div>
                    );
                  })}
                  {/* 빈 값 행(새로 추가된 미입력 행) */}
                  {sizesWithStock.map((s, idx) => s.size.trim() !== "" ? null : (
                    <div key={`empty-${idx}`} className="flex items-center gap-1 px-2 py-1 bg-white border border-dashed border-gray-300 rounded text-13">
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
                  ))}
                  <button
                    className="px-2 py-1 text-13 text-primary-900 border border-dashed border-primary-300 rounded bg-transparent cursor-pointer hover:bg-primary-50"
                    onClick={handleAddSizeRow}
                  >+</button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 재고 */}
        {sizesWithStock.filter((s) => s.size.trim() !== "").length > 0 && (() => {
          const validSizes = sortSizes(sizesWithStock.map((s) => s.size).filter((s) => s.trim() !== ""));
          return (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-15 font-normal text-gray-700">재고</span>
                <button
                  className="px-3 py-1.5 text-13 text-primary-900 border border-primary-200 rounded-lg bg-transparent cursor-pointer hover:bg-primary-50"
                  onClick={() => setStockRows((prev) => [...prev, { round: "", quantities: {} }])}
                >
                  + 차수 추가
                </button>
              </div>
              {stockRows.length > 0 && (
                <div className="border border-gray-200 rounded-lg overflow-x-auto">
                  <table className="text-13 text-gray-700 border-collapse w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-3 py-2 text-left font-medium text-gray-500 whitespace-nowrap border-r border-gray-200 sticky left-0 bg-gray-50 w-16">차수</th>
                        {validSizes.map((size) => (
                          <th key={size} className="px-3 py-2 text-center font-medium whitespace-nowrap min-w-16">{size}</th>
                        ))}
                        <th className="px-3 py-2 w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {stockRows.map((row, rowIdx) => (
                        <tr key={rowIdx} className="border-b border-gray-100 last:border-b-0">
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
                              onClick={() => setStockRows((prev) => prev.filter((_, i) => i !== rowIdx))}
                            >
                              ×
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })()}

        {/* 사용 학교 */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2.5">
            <span className="text-15 font-normal text-gray-700">
              사용 학교
            </span>
            <button
              className="px-4 py-1.5 bg-primary-900 text-bg-050 text-sm font-medium rounded-lg border-none cursor-pointer hover:opacity-90"
              onClick={onOpenSchoolModal}
            >
              학교 추가
            </button>
          </div>
          {selectedSchools.length === 0 ? (
            <p className="text-15 text-gray-400 text-center py-2">
              사용하는 학교가 없습니다
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {Object.entries(
                selectedSchools.reduce<Record<string, SchoolPrice[]>>(
                  (acc, school) => {
                    if (!acc[school.year]) acc[school.year] = [];
                    acc[school.year].push(school);
                    return acc;
                  },
                  {},
                ),
              )
                .sort(([a], [b]) => b.localeCompare(a))
                .map(([year, schools]) => (
                  <div key={year} className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-gray-600">
                      {year}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {schools.map((school) => (
                        <div
                          key={`${school.year}-${school.schoolId}`}
                          className="flex items-center gap-2"
                        >
                          <span className="flex items-center px-4 py-2 border border-gray-200 rounded-lg bg-white text-15 text-gray-700">
                            {school.schoolName}
                          </span>
                          <div className="flex items-center px-4 py-2 border border-gray-200 rounded-lg bg-white text-15 text-gray-700">
                            <input
                              type="number"
                              className="w-20 border-none bg-transparent text-15 text-gray-700 text-right outline-none"
                              value={school.price}
                              onChange={(e) =>
                                onSchoolPriceChange(
                                  school.schoolId,
                                  Number(e.target.value),
                                )
                              }
                            />
                            <span className="ml-1">원</span>
                          </div>
                          <button
                            className="flex items-center justify-center w-5 h-5 border-none bg-transparent cursor-pointer text-gray-400 text-lg hover:text-red-500"
                            onClick={() => onRemoveSchool(school.schoolId)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
