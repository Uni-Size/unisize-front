import { useState } from "react";
import { Modal, Select, Input } from "@components/atoms";
import { CATEGORY_GROUPS } from "@/constants/productCategories";
import { GENDER_OPTIONS } from "@/constants/gender";
import {
  SEASON_OPTIONS,
  REPAIRABLE_OPTIONS,
  REPAIR_REQUIRED_OPTIONS,
  SIZE_TYPE_OPTIONS,
} from "@/constants/product";

export interface SchoolPrice {
  schoolId: string;
  schoolName: string;
  price: number;
  year: string;
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
  schools: SchoolPrice[];
}

export interface ProductAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductAddData) => void;
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

  const handleSubmit = () => {
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

    onSubmit({
      season,
      category,
      gender,
      displayName,
      originalPrice: Number(originalPrice),
      isRepairable,
      isRepairRequired,
      sizeType,
      schools: selectedSchools,
    });
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
          >
            취소
          </button>
          <button
            className="px-6 py-2.5 bg-primary-900 text-bg-050 text-sm font-medium rounded-lg border-none cursor-pointer hover:opacity-90"
            onClick={handleSubmit}
          >
            추가
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
          <div className="flex-1 min-w-0">
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

        {/* 사이즈 */}
        <div className="flex gap-2 items-start">
          <div className="flex-1 min-w-0">
            <Select
              label="사이즈"
              placeholder="사이즈 유형 선택"
              options={SIZE_TYPE_OPTIONS}
              value={sizeType}
              onChange={setSizeType}
              fullWidth
            />
          </div>
          <div className="flex-1 min-w-0" />
        </div>

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
