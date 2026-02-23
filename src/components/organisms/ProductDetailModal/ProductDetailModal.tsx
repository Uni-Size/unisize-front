import { useState, useEffect } from 'react';
import { Modal, Select, Input } from '@components/atoms';
import type { SchoolPrice } from '../ProductAddModal';

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

const seasonOptions = [
  { value: 'S', label: '하복(S)' },
  { value: 'W', label: '동복(W)' },
  { value: 'A', label: '사계절(A)' },
];

const categoryOptions = [
  { value: 'jacket', label: '자켓' },
  { value: 'pants', label: '바지' },
  { value: 'skirt', label: '치마' },
  { value: 'shirt', label: '셔츠' },
  { value: 'blouse', label: '블라우스' },
  { value: 'vest', label: '조끼' },
  { value: 'tie', label: '넥타이' },
  { value: 'socks', label: '양말' },
];

const genderOptions = [
  { value: 'M', label: '남자(M)' },
  { value: 'F', label: '여자(F)' },
  { value: 'U', label: '공용(U)' },
];

const repairableOptions = [
  { value: 'yes', label: '가능' },
  { value: 'no', label: '불가능' },
];

const repairRequiredOptions = [
  { value: 'required', label: '필수' },
  { value: 'optional', label: '선택사항' },
];

const sizeUnitOptions = [
  { value: '5', label: '5단위' },
  { value: '10', label: '10단위' },
  { value: 'free', label: '프리' },
];

const getSeasonLabel = (value: string) =>
  seasonOptions.find((opt) => opt.value === value)?.label || value;
const getCategoryLabel = (value: string) =>
  categoryOptions.find((opt) => opt.value === value)?.label || value;
const getGenderLabel = (value: string) =>
  genderOptions.find((opt) => opt.value === value)?.label || value;
const getRepairableLabel = (value: string) =>
  repairableOptions.find((opt) => opt.value === value)?.label || value;
const getRepairRequiredLabel = (value: string) =>
  repairRequiredOptions.find((opt) => opt.value === value)?.label || value;
const getSizeUnitLabel = (value: string) =>
  sizeUnitOptions.find((opt) => opt.value === value)?.label || value;

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

  const handleEdit = () => {
    setIsEditMode(true);
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
              onClick={handleEdit}
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
      <div className="flex flex-col gap-4 w-190">
        <div className="flex gap-2 items-start">
          <div className="flex-1 min-w-0">
            {isEditMode ? (
              <Select
                label="시즌"
                placeholder="시즌"
                options={seasonOptions}
                value={season}
                onChange={setSeason}
                fullWidth
              />
            ) : (
              <div className="flex flex-col gap-1">
                <span className="px-2 text-base text-bg-800">시즌</span>
                <div className="flex items-center h-12.5 px-4 border border-[#c6c6c6] rounded-lg bg-white text-[15px] text-[#4c4c4c]">
                  {getSeasonLabel(product.season)}
                </div>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            {isEditMode ? (
              <Select
                label="카테고리"
                placeholder="카테고리"
                options={categoryOptions}
                value={category}
                onChange={setCategory}
                fullWidth
              />
            ) : (
              <div className="flex flex-col gap-1">
                <span className="px-2 text-base text-bg-800">카테고리</span>
                <div className="flex items-center h-12.5 px-4 border border-[#c6c6c6] rounded-lg bg-white text-[15px] text-[#4c4c4c]">
                  {getCategoryLabel(product.category)}
                </div>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            {isEditMode ? (
              <Select
                label="성별"
                placeholder="성별"
                options={genderOptions}
                value={gender}
                onChange={setGender}
                fullWidth
              />
            ) : (
              <div className="flex flex-col gap-1">
                <span className="px-2 text-base text-bg-800">성별</span>
                <div className="flex items-center h-12.5 px-4 border border-[#c6c6c6] rounded-lg bg-white text-[15px] text-[#4c4c4c]">
                  {getGenderLabel(product.gender)}
                </div>
              </div>
            )}
          </div>
        </div>

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
              <div className="flex flex-col gap-1">
                <span className="px-2 text-base text-bg-800">표시명</span>
                <div className="flex items-center h-12.5 px-4 border border-[#c6c6c6] rounded-lg bg-white text-[15px] text-[#4c4c4c]">{product.displayName}</div>
              </div>
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
                fullWidth
              />
            ) : (
              <div className="flex flex-col gap-1">
                <span className="px-2 text-base text-bg-800">가격</span>
                <div className="flex items-center h-12.5 px-4 border border-[#c6c6c6] rounded-lg bg-white text-[15px] text-[#4c4c4c]">
                  {product.originalPrice.toLocaleString()}원
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 items-start">
          <div className="flex-1 min-w-0">
            {isEditMode ? (
              <Select
                label="수선 가능여부"
                placeholder="불가능"
                options={repairableOptions}
                value={isRepairable}
                onChange={setIsRepairable}
                fullWidth
              />
            ) : (
              <div className="flex flex-col gap-1">
                <span className="px-2 text-base text-bg-800">수선 가능여부</span>
                <div className="flex items-center h-12.5 px-4 border border-[#c6c6c6] rounded-lg bg-white text-[15px] text-[#4c4c4c]">
                  {getRepairableLabel(product.isRepairable)}
                </div>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            {isEditMode ? (
              <Select
                label="수선 필수 여부"
                placeholder="선택사항"
                options={repairRequiredOptions}
                value={isRepairRequired}
                onChange={setIsRepairRequired}
                fullWidth
              />
            ) : (
              <div className="flex flex-col gap-1">
                <span className="px-2 text-base text-bg-800">수선 필수 여부</span>
                <div className="flex items-center h-12.5 px-4 border border-[#c6c6c6] rounded-lg bg-white text-[15px] text-[#4c4c4c]">
                  {getRepairRequiredLabel(product.isRepairRequired)}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 items-start">
          <div className="flex-1 min-w-0">
            {isEditMode ? (
              <Select
                label="사이즈"
                placeholder="5단위"
                options={sizeUnitOptions}
                value={sizeUnit}
                onChange={setSizeUnit}
                fullWidth
              />
            ) : (
              <div className="flex flex-col gap-1">
                <span className="px-2 text-base text-bg-800">사이즈</span>
                <div className="flex items-center h-12.5 px-4 border border-[#c6c6c6] rounded-lg bg-white text-[15px] text-[#4c4c4c]">
                  {getSizeUnitLabel(product.sizeUnit)}
                </div>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0" />
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <span className="text-base text-bg-800">사용 학교</span>
            {isEditMode && onOpenSchoolModal && (
              <button
                className="px-6 py-2.5 bg-primary-900 text-[#f9fafb] text-sm font-medium rounded-lg border-none cursor-pointer hover:opacity-90"
                onClick={onOpenSchoolModal}
              >
                학교 추가
              </button>
            )}
          </div>
          {schools.length > 0 && (
            <div className="flex flex-col gap-3 mt-2">
              {Object.entries(
                schools.reduce<Record<string, typeof schools>>((acc, school) => {
                  const year = school.year;
                  if (!acc[year]) {
                    acc[year] = [];
                  }
                  acc[year].push(school);
                  return acc;
                }, {})
              )
                .sort(([a], [b]) => b.localeCompare(a))
                .map(([year, yearSchools]) => (
                  <div key={year} className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-[#4c4c4c]">{year}</span>
                    <div className="flex flex-wrap gap-2">
                      {yearSchools.map((school) => (
                        <div key={`${school.year}-${school.schoolId}`} className="flex items-center gap-2">
                          <span className="flex items-center px-4 py-2 border border-[#c6c6c6] rounded-lg bg-white text-[15px] text-[#4c4c4c]">{school.schoolName}</span>
                          <div className="flex items-center px-4 py-2 border border-[#c6c6c6] rounded-lg bg-white text-[15px] text-[#4c4c4c]">
                            {isEditMode && onSchoolPriceChange ? (
                              <>
                                <input
                                  type="number"
                                  className="w-20 border-none bg-transparent text-[15px] text-[#4c4c4c] text-right outline-none"
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
                              className="flex items-center justify-center w-5 h-5 border-none bg-transparent cursor-pointer text-bg-400 text-lg hover:text-error"
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
          )}
        </div>
      </div>
    </Modal>
  );
};
