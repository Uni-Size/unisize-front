import { useState, useEffect } from 'react';
import { Modal, Select, Input } from '@components/atoms';
import type { SchoolProductItem } from '../SchoolAddModal';

export interface PurchaseInfo {
  id: string;
  purchaseStatus: string;
  purchaseYear: string;
  expectedStudents: number;
  measurementStartDate: string;
  measurementEndDate: string;
}

export interface SchoolDetailData {
  id: string;
  schoolName: string;
  registeredDate: string;
  lastModifiedDate: string;
  purchases: PurchaseInfo[];
  winterProducts: SchoolProductItem[];
  summerProducts: SchoolProductItem[];
}

export interface SchoolDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  school: SchoolDetailData | null;
  onUpdate: (data: SchoolDetailData) => void;
  onOpenProductModal?: (season: 'winter' | 'summer') => void;
  winterProducts?: SchoolProductItem[];
  summerProducts?: SchoolProductItem[];
  onRemoveProduct?: (season: 'winter' | 'summer', productId: string) => void;
  onProductChange?: (
    season: 'winter' | 'summer',
    productId: string,
    field: keyof SchoolProductItem,
    value: string | number
  ) => void;
}

const purchaseStatusOptions = [
  { value: 'in-progress', label: '진행' },
  { value: 'completed', label: '종료' },
  { value: 'pending', label: '대기' },
];

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 10 }, (_, i) => ({
  value: String(currentYear - 5 + i),
  label: String(currentYear - 5 + i),
}));

const categoryOptions = [
  { value: 'top', label: '상의' },
  { value: 'bottom', label: '하의' },
  { value: 'hood', label: '후드' },
  { value: 'outer', label: '아우터' },
];

const genderOptions = [
  { value: 'male', label: '남' },
  { value: 'female', label: '여' },
  { value: 'unisex', label: '공용' },
];

const getPurchaseStatusLabel = (value: string) =>
  purchaseStatusOptions.find((opt) => opt.value === value)?.label || value;
const getCategoryLabel = (value: string) =>
  categoryOptions.find((opt) => opt.value === value)?.label || value;
const getGenderLabel = (value: string) =>
  genderOptions.find((opt) => opt.value === value)?.label || value;

export const SchoolDetailModal = ({
  isOpen,
  onClose,
  school,
  onUpdate,
  onOpenProductModal,
  winterProducts: externalWinterProducts,
  summerProducts: externalSummerProducts,
  onRemoveProduct,
  onProductChange,
}: SchoolDetailModalProps) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [schoolName, setSchoolName] = useState('');
  const [purchases, setPurchases] = useState<PurchaseInfo[]>([]);

  useEffect(() => {
    if (school) {
      setSchoolName(school.schoolName);
      setPurchases(school.purchases);
    }
  }, [school]);

  const handleClose = () => {
    setIsEditMode(false);
    onClose();
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleSave = () => {
    if (school) {
      onUpdate({
        ...school,
        schoolName,
        purchases,
        winterProducts: externalWinterProducts || school.winterProducts,
        summerProducts: externalSummerProducts || school.summerProducts,
      });
    }
    setIsEditMode(false);
  };

  const handlePurchaseChange = (
    purchaseId: string,
    field: keyof PurchaseInfo,
    value: string | number
  ) => {
    setPurchases((prev) =>
      prev.map((p) => (p.id === purchaseId ? { ...p, [field]: value } : p))
    );
  };

  const handleAddPurchase = () => {
    const newPurchase: PurchaseInfo = {
      id: `purchase-${Date.now()}`,
      purchaseStatus: 'pending',
      purchaseYear: String(currentYear),
      expectedStudents: 0,
      measurementStartDate: '',
      measurementEndDate: '',
    };
    setPurchases((prev) => [...prev, newPurchase]);
  };

  const winterProducts = externalWinterProducts || school?.winterProducts || [];
  const summerProducts = externalSummerProducts || school?.summerProducts || [];

  if (!school) return null;

  const renderProductRow = (
    product: SchoolProductItem,
    season: 'winter' | 'summer',
    showLabels: boolean
  ) => (
    <div key={product.id}>
      {showLabels && (
        <div className="flex gap-2 items-start">
          {isEditMode && (
            <div className="flex-none w-10 flex items-center justify-center pt-3" />
          )}
          <div className="flex-none w-30 min-w-0">
            <span className="text-sm text-bg-800 px-2">카테고리</span>
          </div>
          <div className="flex-none w-17.5 min-w-0">
            <span className="text-sm text-bg-800 px-2">성별</span>
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-sm text-bg-800 px-2">표시명</span>
          </div>
          <div className="flex-none w-27.5 min-w-0">
            <span className="text-sm text-bg-800 px-2">계약가격</span>
          </div>
          <div className="flex-none w-17.5 min-w-0">
            <span className="text-sm text-bg-800 px-2">무상개수</span>
          </div>
        </div>
      )}
      <div className="flex gap-2 items-start">
        {isEditMode && onRemoveProduct && (
          <div className="flex-none w-10 flex items-center justify-center pt-3">
            <button
              className="flex items-center justify-center w-10 h-11 px-3 py-2 bg-[#9b4d4d] border-none rounded-lg text-[13px] text-[#f9fafb] cursor-pointer hover:opacity-90"
              onClick={() => onRemoveProduct(season, product.id)}
            >
              삭제
            </button>
          </div>
        )}
        <div className="flex-none w-30 min-w-0">
          {isEditMode && onProductChange ? (
            <Select
              options={categoryOptions}
              value={product.category}
              onChange={(value) => onProductChange(season, product.id, 'category', value)}
              fullWidth
            />
          ) : (
            <div className="flex items-center h-11 px-4 py-3 border border-[#c6c6c6] rounded-lg bg-white text-[15px] text-[#4c4c4c]">
              {getCategoryLabel(product.category)}
            </div>
          )}
        </div>
        <div className="flex-none w-17.5 min-w-0">
          {isEditMode && onProductChange ? (
            <Select
              options={genderOptions}
              value={product.gender}
              onChange={(value) => onProductChange(season, product.id, 'gender', value)}
              fullWidth
            />
          ) : (
            <div className="flex items-center h-11 px-4 py-3 border border-[#c6c6c6] rounded-lg bg-white text-[15px] text-[#4c4c4c]">
              {getGenderLabel(product.gender)}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          {isEditMode && onProductChange ? (
            <Input
              value={product.displayName}
              onChange={(e) => onProductChange(season, product.id, 'displayName', e.target.value)}
              fullWidth
            />
          ) : (
            <div className="flex items-center h-11 px-4 py-3 border border-[#c6c6c6] rounded-lg bg-white text-[15px] text-[#4c4c4c]">{product.displayName}</div>
          )}
        </div>
        <div className="flex-none w-27.5 min-w-0">
          {isEditMode && onProductChange ? (
            <div className="flex items-center h-11 px-4 py-3 border border-[#c6c6c6] rounded-lg bg-white">
              <input
                type="number"
                className="flex-1 border-none bg-transparent text-[15px] text-[#4c4c4c] text-right outline-none"
                value={product.contractPrice || ''}
                onChange={(e) =>
                  onProductChange(season, product.id, 'contractPrice', Number(e.target.value))
                }
              />
              <span className="text-[15px] text-[#4c4c4c] ml-1">원</span>
            </div>
          ) : (
            <div className="flex items-center h-11 px-4 py-3 border border-[#c6c6c6] rounded-lg bg-white text-[15px] text-[#4c4c4c]">
              {product.contractPrice.toLocaleString()}원
            </div>
          )}
        </div>
        <div className="flex-none w-17.5 min-w-0">
          {isEditMode && onProductChange ? (
            <Input
              type="number"
              value={String(product.freeQuantity || '')}
              onChange={(e) =>
                onProductChange(season, product.id, 'freeQuantity', Number(e.target.value))
              }
              fullWidth
            />
          ) : (
            <div className="flex items-center h-11 px-4 py-3 border border-[#c6c6c6] rounded-lg bg-white text-[15px] text-[#4c4c4c]">{product.freeQuantity}</div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={school.schoolName}
      width={850}
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
              className="px-6 py-2.5 bg-[#7a3c00] text-[#f9fafb] text-sm font-medium rounded-lg border-none cursor-pointer hover:opacity-90"
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
        <div className="flex flex-col items-end gap-1 absolute top-3.75 right-30">
          <span className="text-xs text-bg-400">등록일</span>
          <span className="text-xs text-bg-400">{school.registeredDate}</span>
          <span className="text-xs text-bg-400">최종 수정일</span>
          <span className="text-xs text-bg-400">{school.lastModifiedDate}</span>
        </div>

        <div className="flex gap-2 items-end">
          <div className="flex-1 min-w-0">
            {isEditMode ? (
              <Input
                label="학교명"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                fullWidth
              />
            ) : (
              <div className="flex flex-col gap-1">
                <span className="px-2 text-base text-bg-800">학교명</span>
                <div className="flex items-center h-12.5 px-4 border border-[#c6c6c6] rounded-lg bg-white text-[15px] text-[#4c4c4c]">{school.schoolName}</div>
              </div>
            )}
          </div>
        </div>

        {purchases.map((purchase) => (
          <div key={purchase.id} className="flex flex-col gap-3 py-2 border-b border-gray-200 last:border-b-0">
            <div className="flex gap-2 items-end">
              <div className="flex-none w-25 min-w-0">
                {isEditMode ? (
                  <Select
                    label="주관구매"
                    options={purchaseStatusOptions}
                    value={purchase.purchaseStatus}
                    onChange={(value) =>
                      handlePurchaseChange(purchase.id, 'purchaseStatus', value)
                    }
                    fullWidth
                  />
                ) : (
                  <div className="flex flex-col gap-1">
                    <span className="px-2 text-base text-bg-800">주관구매</span>
                    <div className="flex items-center h-12.5 px-4 border border-[#c6c6c6] rounded-lg bg-white text-[15px] text-[#4c4c4c]">
                      {getPurchaseStatusLabel(purchase.purchaseStatus)}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex-none w-35 min-w-0">
                {isEditMode ? (
                  <Select
                    label="주관구매 진행년도"
                    options={yearOptions}
                    value={purchase.purchaseYear}
                    onChange={(value) => handlePurchaseChange(purchase.id, 'purchaseYear', value)}
                    fullWidth
                  />
                ) : (
                  <div className="flex flex-col gap-1">
                    <span className="px-2 text-base text-bg-800">주관구매 진행년도</span>
                    <div className="flex items-center h-12.5 px-4 border border-[#c6c6c6] rounded-lg bg-white text-[15px] text-[#4c4c4c]">
                      {purchase.purchaseYear}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex-none w-25 min-w-0">
                {isEditMode ? (
                  <Input
                    label={`${purchase.purchaseYear} 예상인원`}
                    type="number"
                    value={String(purchase.expectedStudents)}
                    onChange={(e) =>
                      handlePurchaseChange(purchase.id, 'expectedStudents', Number(e.target.value))
                    }
                    fullWidth
                  />
                ) : (
                  <div className="flex flex-col gap-1">
                    <span className="px-2 text-base text-bg-800">
                      {purchase.purchaseYear} 예상인원
                    </span>
                    <div className="flex items-center h-12.5 px-4 border border-[#c6c6c6] rounded-lg bg-white text-[15px] text-[#4c4c4c]">
                      {purchase.expectedStudents}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                {isEditMode ? (
                  <Input
                    label="주관구매 측정기간"
                    value={purchase.measurementStartDate}
                    onChange={(e) =>
                      handlePurchaseChange(purchase.id, 'measurementStartDate', e.target.value)
                    }
                    fullWidth
                  />
                ) : (
                  <div className="flex flex-col gap-1">
                    <span className="px-2 text-base text-bg-800">주관구매 측정기간</span>
                    <div className="flex items-center h-12.5 px-4 border border-[#c6c6c6] rounded-lg bg-white text-[15px] text-[#4c4c4c]">
                      {purchase.measurementStartDate}
                    </div>
                  </div>
                )}
              </div>
              <span className="text-[15px] text-[#4c4c4c] pb-4">~</span>
              <div className="flex-none w-35 min-w-0">
                {isEditMode ? (
                  <Input
                    label=" "
                    value={purchase.measurementEndDate}
                    onChange={(e) =>
                      handlePurchaseChange(purchase.id, 'measurementEndDate', e.target.value)
                    }
                    fullWidth
                  />
                ) : (
                  <div className="flex flex-col gap-1">
                    <span className="px-2 text-base text-bg-800"> </span>
                    <div className="flex items-center h-12.5 px-4 border border-[#c6c6c6] rounded-lg bg-white text-[15px] text-[#4c4c4c]">
                      {purchase.measurementEndDate}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {isEditMode && (
          <button
            className="flex items-center justify-center px-5 py-2.5 bg-[#374151] border-none rounded-lg text-[15px] text-[#f9fafb] cursor-pointer mx-auto mt-2 hover:opacity-90"
            onClick={handleAddPurchase}
          >
            주관구매 추가
          </button>
        )}

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-base font-medium text-bg-800">교복</span>
            {isEditMode && onOpenProductModal && (
              <button
                className="px-6 py-2.5 bg-primary-900 text-[#f9fafb] text-sm font-medium rounded-lg border-none cursor-pointer hover:opacity-90"
                onClick={() => onOpenProductModal('winter')}
              >
                신규 품목 추가
              </button>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm text-[#4c4c4c]">동복</span>
            <div className="flex flex-col gap-2">
              {winterProducts.map((product, index) =>
                renderProductRow(product, 'winter', index === 0)
              )}
            </div>
            {isEditMode && (
              <button
                className="flex items-center justify-center px-5 py-2.5 bg-primary-900 border-none rounded-lg text-[15px] text-[#f9fafb] cursor-pointer mx-auto hover:opacity-90"
                onClick={() => onOpenProductModal?.('winter')}
              >
                동복 품목 추가
              </button>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm text-[#4c4c4c]">하복</span>
            <div className="flex flex-col gap-2">
              {summerProducts.map((product, index) =>
                renderProductRow(product, 'summer', index === 0)
              )}
            </div>
            {isEditMode && (
              <button
                className="flex items-center justify-center px-5 py-2.5 bg-primary-900 border-none rounded-lg text-[15px] text-[#f9fafb] cursor-pointer mx-auto hover:opacity-90"
                onClick={() => onOpenProductModal?.('summer')}
              >
                하복 품목 추가
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
