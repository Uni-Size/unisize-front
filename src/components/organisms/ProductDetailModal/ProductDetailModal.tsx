import { useState } from "react";
import { Modal, Select, Input } from "@components/atoms";
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
  SIZE_UNIT_OPTIONS,
  getSeasonLabel,
} from "@/constants/product";

export interface ProductDetailData {
  id: string;
  season: string;
  category: string;
  gender: string;
  displayName: string;
  originalPrice: number;
  isRepairable: string;
  isRepairRequired: string;
  sizeUnit: string;
  schools: SchoolPrice[];
}

export interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductDetailData | null;
  onUpdate: (data: ProductDetailData) => void;
  onOpenSchoolModal?: () => void;
  selectedSchools?: SchoolPrice[];
  onRemoveSchool?: (schoolId: string) => void;
  onSchoolPriceChange?: (schoolId: string, price: number) => void;
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
    <span className="text-[15px] font-normal text-gray-700">{label}</span>
    <div
      className={`flex items-center h-12.5 px-4 border border-gray-200 rounded-lg bg-transparent text-[15px] font-normal leading-none text-gray-700 ${align === "right" ? "justify-end" : ""}`}
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
  selectedSchools,
  onRemoveSchool,
  onSchoolPriceChange,
  isOpen,
}: ProductDetailModalProps & { product: ProductDetailData }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [season, setSeason] = useState(product.season);
  const [category, setCategory] = useState(product.category);
  const [gender, setGender] = useState(product.gender);
  const [displayName, setDisplayName] = useState(product.displayName);
  const [originalPrice, setOriginalPrice] = useState(String(product.originalPrice));
  const [isRepairable, setIsRepairable] = useState(product.isRepairable);
  const [isRepairRequired, setIsRepairRequired] = useState(product.isRepairRequired);
  const [sizeUnit, setSizeUnit] = useState(product.sizeUnit);

  const handleClose = () => {
    setIsEditMode(false);
    onClose();
  };

  const handleSave = () => {
    onUpdate({
      ...product,
      season,
      category,
      gender,
      displayName,
      originalPrice: Number(originalPrice),
      isRepairable,
      isRepairRequired,
      sizeUnit,
      schools: selectedSchools || product.schools,
    });
    setIsEditMode(false);
  };

  const schools = selectedSchools || product.schools;

  const getOptionLabel = (options: { value: string; label: string }[], value: string) =>
    options.find((opt) => opt.value === value)?.label ?? value;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={product.displayName}
      width={800}
      actions={
        isEditMode ? (
          <>
            <button
              className="px-6 py-2.5 bg-[#6c757d] text-white text-sm font-medium rounded-lg border-none cursor-pointer hover:opacity-90"
              onClick={() => setIsEditMode(false)}
            >
              취소
            </button>
            <button
              className="px-6 py-2.5 bg-primary-900 text-[#f9fafb] text-sm font-medium rounded-lg border-none cursor-pointer hover:opacity-90"
              onClick={handleSave}
            >
              저장
            </button>
          </>
        ) : (
          <>
            <button
              className="px-6 py-2.5 bg-[#7a3c00] text-[#f9fafb] text-sm font-medium rounded-lg border-none cursor-pointer hover:opacity-90"
              onClick={() => setIsEditMode(true)}
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
                fullWidth
              />
            ) : (
              <FieldView label="카테고리" value={getCategoryLabel(product.category)} />
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
          <div className="flex-1 min-w-0">
            {isEditMode ? (
              <Select
                label="수선 필수 여부"
                placeholder="선택사항"
                options={REPAIR_REQUIRED_OPTIONS}
                value={isRepairRequired}
                onChange={setIsRepairRequired}
                fullWidth
              />
            ) : (
              <FieldView
                label="수선 필수 여부"
                value={getOptionLabel(REPAIR_REQUIRED_OPTIONS, product.isRepairRequired)}
              />
            )}
          </div>
        </div>

        {/* 사이즈 */}
        <div className="flex gap-2 items-start">
          <div className="flex-1 min-w-0">
            {isEditMode ? (
              <Select
                label="사이즈"
                placeholder="5단위"
                options={SIZE_UNIT_OPTIONS}
                value={sizeUnit}
                onChange={setSizeUnit}
                fullWidth
              />
            ) : (
              <FieldView
                label="사이즈"
                value={getOptionLabel(SIZE_UNIT_OPTIONS, product.sizeUnit)}
              />
            )}
          </div>
          <div className="flex-1 min-w-0" />
        </div>

        {/* 사용 학교 */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2.5">
            <span className="text-[15px] font-normal text-gray-700">사용 학교</span>
            {isEditMode && onOpenSchoolModal && (
              <button
                className="px-4 py-1.5 bg-primary-900 text-[#f9fafb] text-sm font-medium rounded-lg border-none cursor-pointer hover:opacity-90"
                onClick={onOpenSchoolModal}
              >
                학교 추가
              </button>
            )}
          </div>
          {schools.length > 0 ? (
            <div className="flex flex-col gap-3">
              {Object.entries(
                schools.reduce<Record<string, typeof schools>>(
                  (acc, school) => {
                    if (!acc[school.year]) acc[school.year] = [];
                    acc[school.year].push(school);
                    return acc;
                  },
                  {},
                ),
              )
                .sort(([a], [b]) => b.localeCompare(a))
                .map(([year, yearSchools]) => (
                  <div key={year} className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-gray-600">{year}</span>
                    <div className="flex flex-wrap gap-2">
                      {yearSchools.map((school) => (
                        <div
                          key={`${school.year}-${school.schoolId}`}
                          className="flex items-center gap-2"
                        >
                          <span className="flex items-center px-4 py-2 border border-gray-200 rounded-lg bg-white text-[15px] text-gray-700">
                            {school.schoolName}
                          </span>
                          <div className="flex items-center px-4 py-2 border border-gray-200 rounded-lg bg-white text-[15px] text-gray-700">
                            {isEditMode && onSchoolPriceChange ? (
                              <>
                                <input
                                  type="number"
                                  className="w-20 border-none bg-transparent text-[15px] text-gray-700 text-right outline-none"
                                  value={school.price}
                                  onChange={(e) =>
                                    onSchoolPriceChange(school.schoolId, Number(e.target.value))
                                  }
                                />
                                <span className="ml-1">원</span>
                              </>
                            ) : (
                              <>{school.price.toLocaleString()}원</>
                            )}
                          </div>
                          {isEditMode && onRemoveSchool && (
                            <button
                              className="flex items-center justify-center w-5 h-5 border-none bg-transparent cursor-pointer text-gray-400 text-lg hover:text-red-500"
                              onClick={() => onRemoveSchool(school.schoolId)}
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-[15px] text-gray-400 text-center py-2">
              사용하는 학교가 없습니다
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
};

// ============================================================================
// 외부 컴포넌트 (product.id를 key로 내부 컴포넌트 리마운트)
// ============================================================================

export const ProductDetailModal = (props: ProductDetailModalProps) => {
  if (!props.product) return null;
  return <ProductDetailModalContent key={props.product.id} {...props} product={props.product} />;
};
