import { useState, useEffect } from 'react';
import { Modal, Select, Input } from '@components/atoms';
import type { SelectOption } from '@components/atoms/Select/Select';
import type { SchoolPrice } from '../ProductAddModal';
import { CATEGORY_GROUPS, getCategoryLabel } from '@/constants/productCategories';
import { GENDER_OPTIONS } from '@/constants/gender';

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
// 공통 옵션 목록
// ============================================================================

export const seasonOptions: SelectOption[] = [
  { value: 'S', label: '하복(S)' },
  { value: 'W', label: '동복(W)' },
  { value: 'A', label: '사계절(A)' },
];

export const genderOptions: SelectOption[] = GENDER_OPTIONS;

export const repairableOptions: SelectOption[] = [
  { value: 'yes', label: '가능' },
  { value: 'no', label: '불가능' },
];

export const repairRequiredOptions: SelectOption[] = [
  { value: 'required', label: '필수' },
  { value: 'optional', label: '선택사항' },
];

export const sizeUnitOptions: SelectOption[] = [
  { value: '5', label: '5단위' },
  { value: '10', label: '10단위' },
  { value: 'free', label: '프리' },
];

const getOptionLabel = (options: SelectOption[], value: string) =>
  options.find((opt) => opt.value === value)?.label ?? value;

// ============================================================================
// 뷰 모드 필드 컴포넌트
// ============================================================================

const FieldView = ({ label, value, align = 'left' }: { label: string; value: string; align?: 'left' | 'right' }) => (
  <div className="flex flex-col gap-2">
    <span className="text-[15px] font-normal text-gray-700">{label}</span>
    <div className={`flex items-center h-12.5 px-4 border border-gray-200 rounded-lg bg-transparent text-[15px] font-normal leading-none text-gray-700 ${align === 'right' ? 'justify-end' : ''}`}>
      {value}
    </div>
  </div>
);

// ============================================================================
// 컴포넌트
// ============================================================================

export const ProductDetailModal = ({
  isOpen,
  onClose,
  product,
  onUpdate,
  onOpenSchoolModal,
  selectedSchools,
  onRemoveSchool,
  onSchoolPriceChange,
}: ProductDetailModalProps) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [season, setSeason] = useState('');
  const [category, setCategory] = useState('');
  const [gender, setGender] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [isRepairable, setIsRepairable] = useState('');
  const [isRepairRequired, setIsRepairRequired] = useState('');
  const [sizeUnit, setSizeUnit] = useState('');

  useEffect(() => {
    if (product) {
      setSeason(product.season);
      setCategory(product.category);
      setGender(product.gender);
      setDisplayName(product.displayName);
      setOriginalPrice(String(product.originalPrice));
      setIsRepairable(product.isRepairable);
      setIsRepairRequired(product.isRepairRequired);
      setSizeUnit(product.sizeUnit);
    }
  }, [product]);

  const handleClose = () => {
    setIsEditMode(false);
    onClose();
  };

  const handleSave = () => {
    if (product) {
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
    }
    setIsEditMode(false);
  };

  const schools = selectedSchools || product?.schools || [];

  if (!product) return null;

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
              <Select label="시즌" placeholder="시즌" options={seasonOptions} value={season} onChange={setSeason} fullWidth />
            ) : (
              <FieldView label="시즌" value={getOptionLabel(seasonOptions, product.season)} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            {isEditMode ? (
              <Select label="카테고리" placeholder="카테고리" groups={CATEGORY_GROUPS} value={category} onChange={setCategory} fullWidth />
            ) : (
              <FieldView label="카테고리" value={getCategoryLabel(product.category)} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            {isEditMode ? (
              <Select label="성별" placeholder="성별" options={genderOptions} value={gender} onChange={setGender} fullWidth />
            ) : (
              <FieldView label="성별" value={getOptionLabel(genderOptions, product.gender)} />
            )}
          </div>
        </div>

        {/* 표시명 / 가격 */}
        <div className="flex gap-2 items-start">
          <div className="flex-1 min-w-0">
            {isEditMode ? (
              <Input label="표시명" placeholder="흰색 오각" value={displayName} onChange={(e) => setDisplayName(e.target.value)} fullWidth />
            ) : (
              <FieldView label="표시명" value={product.displayName} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            {isEditMode ? (
              <Input label="가격" placeholder="가격" type="number" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} className="text-right" fullWidth />
            ) : (
              <FieldView label="가격" value={`${product.originalPrice.toLocaleString()}원`} align="right" />
            )}
          </div>
        </div>

        {/* 수선 가능여부 / 수선 필수 여부 */}
        <div className="flex gap-2 items-start">
          <div className="flex-1 min-w-0">
            {isEditMode ? (
              <Select label="수선 가능여부" placeholder="불가능" options={repairableOptions} value={isRepairable} onChange={setIsRepairable} fullWidth />
            ) : (
              <FieldView label="수선 가능여부" value={getOptionLabel(repairableOptions, product.isRepairable)} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            {isEditMode ? (
              <Select label="수선 필수 여부" placeholder="선택사항" options={repairRequiredOptions} value={isRepairRequired} onChange={setIsRepairRequired} fullWidth />
            ) : (
              <FieldView label="수선 필수 여부" value={getOptionLabel(repairRequiredOptions, product.isRepairRequired)} />
            )}
          </div>
        </div>

        {/* 사이즈 */}
        <div className="flex gap-2 items-start">
          <div className="flex-1 min-w-0">
            {isEditMode ? (
              <Select label="사이즈" placeholder="5단위" options={sizeUnitOptions} value={sizeUnit} onChange={setSizeUnit} fullWidth />
            ) : (
              <FieldView label="사이즈" value={getOptionLabel(sizeUnitOptions, product.sizeUnit)} />
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
                schools.reduce<Record<string, typeof schools>>((acc, school) => {
                  if (!acc[school.year]) acc[school.year] = [];
                  acc[school.year].push(school);
                  return acc;
                }, {})
              )
                .sort(([a], [b]) => b.localeCompare(a))
                .map(([year, yearSchools]) => (
                  <div key={year} className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-gray-600">{year}</span>
                    <div className="flex flex-wrap gap-2">
                      {yearSchools.map((school) => (
                        <div key={`${school.year}-${school.schoolId}`} className="flex items-center gap-2">
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
                                  onChange={(e) => onSchoolPriceChange(school.schoolId, Number(e.target.value))}
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
            <p className="text-[15px] text-gray-400 text-center py-2">사용하는 학교가 없습니다</p>
          )}
        </div>
      </div>
    </Modal>
  );
};
