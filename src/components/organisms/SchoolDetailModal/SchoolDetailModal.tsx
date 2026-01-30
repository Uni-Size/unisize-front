import { useState, useEffect } from 'react';
import { Modal, Select, Input } from '@components/atoms';
import type { SchoolProductItem } from '../SchoolAddModal';
import './SchoolDetailModal.css';

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
        <div className="school-detail-modal__product-row">
          {isEditMode && (
            <div className="school-detail-modal__product-field school-detail-modal__product-field--delete" />
          )}
          <div className="school-detail-modal__product-field school-detail-modal__product-field--category">
            <span className="school-detail-modal__product-label">카테고리</span>
          </div>
          <div className="school-detail-modal__product-field school-detail-modal__product-field--gender">
            <span className="school-detail-modal__product-label">성별</span>
          </div>
          <div className="school-detail-modal__product-field school-detail-modal__product-field--name">
            <span className="school-detail-modal__product-label">표시명</span>
          </div>
          <div className="school-detail-modal__product-field school-detail-modal__product-field--price">
            <span className="school-detail-modal__product-label">계약가격</span>
          </div>
          <div className="school-detail-modal__product-field school-detail-modal__product-field--quantity">
            <span className="school-detail-modal__product-label">무상개수</span>
          </div>
        </div>
      )}
      <div className="school-detail-modal__product-row">
        {isEditMode && onRemoveProduct && (
          <div className="school-detail-modal__product-field school-detail-modal__product-field--delete">
            <button
              className="school-detail-modal__delete-btn"
              onClick={() => onRemoveProduct(season, product.id)}
            >
              삭제
            </button>
          </div>
        )}
        <div className="school-detail-modal__product-field school-detail-modal__product-field--category">
          {isEditMode && onProductChange ? (
            <Select
              options={categoryOptions}
              value={product.category}
              onChange={(value) => onProductChange(season, product.id, 'category', value)}
              fullWidth
            />
          ) : (
            <div className="school-detail-modal__product-value">
              {getCategoryLabel(product.category)}
            </div>
          )}
        </div>
        <div className="school-detail-modal__product-field school-detail-modal__product-field--gender">
          {isEditMode && onProductChange ? (
            <Select
              options={genderOptions}
              value={product.gender}
              onChange={(value) => onProductChange(season, product.id, 'gender', value)}
              fullWidth
            />
          ) : (
            <div className="school-detail-modal__product-value">
              {getGenderLabel(product.gender)}
            </div>
          )}
        </div>
        <div className="school-detail-modal__product-field school-detail-modal__product-field--name">
          {isEditMode && onProductChange ? (
            <Input
              value={product.displayName}
              onChange={(e) => onProductChange(season, product.id, 'displayName', e.target.value)}
              fullWidth
            />
          ) : (
            <div className="school-detail-modal__product-value">{product.displayName}</div>
          )}
        </div>
        <div className="school-detail-modal__product-field school-detail-modal__product-field--price">
          {isEditMode && onProductChange ? (
            <div className="school-detail-modal__price-input-wrapper">
              <input
                type="number"
                className="school-detail-modal__price-input-field"
                value={product.contractPrice || ''}
                onChange={(e) =>
                  onProductChange(season, product.id, 'contractPrice', Number(e.target.value))
                }
              />
              <span className="school-detail-modal__price-unit">원</span>
            </div>
          ) : (
            <div className="school-detail-modal__product-value">
              {product.contractPrice.toLocaleString()}원
            </div>
          )}
        </div>
        <div className="school-detail-modal__product-field school-detail-modal__product-field--quantity">
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
            <div className="school-detail-modal__product-value">{product.freeQuantity}</div>
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
            <button className="modal__btn modal__btn--cancel" onClick={() => setIsEditMode(false)}>
              취소
            </button>
            <button className="modal__btn modal__btn--edit" onClick={handleSave}>
              저장
            </button>
          </>
        ) : (
          <>
            <button className="modal__btn modal__btn--edit" onClick={handleEdit}>
              수정
            </button>
            <button className="modal__btn modal__btn--close" onClick={handleClose}>
              닫기
            </button>
          </>
        )
      }
    >
      <div className="school-detail-modal__form">
        <div className="school-detail-modal__header-info">
          <span className="school-detail-modal__date-info">등록일</span>
          <span className="school-detail-modal__date-info">{school.registeredDate}</span>
          <span className="school-detail-modal__date-info">최종 수정일</span>
          <span className="school-detail-modal__date-info">{school.lastModifiedDate}</span>
        </div>

        <div className="school-detail-modal__row">
          <div className="school-detail-modal__field">
            {isEditMode ? (
              <Input
                label="학교명"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                fullWidth
              />
            ) : (
              <div className="school-detail-modal__readonly">
                <span className="school-detail-modal__readonly-label">학교명</span>
                <div className="school-detail-modal__readonly-value">{school.schoolName}</div>
              </div>
            )}
          </div>
        </div>

        {purchases.map((purchase) => (
          <div key={purchase.id} className="school-detail-modal__purchase-group">
            <div className="school-detail-modal__row">
              <div className="school-detail-modal__field school-detail-modal__field--small">
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
                  <div className="school-detail-modal__readonly">
                    <span className="school-detail-modal__readonly-label">주관구매</span>
                    <div className="school-detail-modal__readonly-value">
                      {getPurchaseStatusLabel(purchase.purchaseStatus)}
                    </div>
                  </div>
                )}
              </div>
              <div className="school-detail-modal__field school-detail-modal__field--medium">
                {isEditMode ? (
                  <Select
                    label="주관구매 진행년도"
                    options={yearOptions}
                    value={purchase.purchaseYear}
                    onChange={(value) => handlePurchaseChange(purchase.id, 'purchaseYear', value)}
                    fullWidth
                  />
                ) : (
                  <div className="school-detail-modal__readonly">
                    <span className="school-detail-modal__readonly-label">주관구매 진행년도</span>
                    <div className="school-detail-modal__readonly-value">
                      {purchase.purchaseYear}
                    </div>
                  </div>
                )}
              </div>
              <div className="school-detail-modal__field school-detail-modal__field--small">
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
                  <div className="school-detail-modal__readonly">
                    <span className="school-detail-modal__readonly-label">
                      {purchase.purchaseYear} 예상인원
                    </span>
                    <div className="school-detail-modal__readonly-value">
                      {purchase.expectedStudents}
                    </div>
                  </div>
                )}
              </div>
              <div className="school-detail-modal__field">
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
                  <div className="school-detail-modal__readonly">
                    <span className="school-detail-modal__readonly-label">주관구매 측정기간</span>
                    <div className="school-detail-modal__readonly-value">
                      {purchase.measurementStartDate}
                    </div>
                  </div>
                )}
              </div>
              <span className="school-detail-modal__date-separator">~</span>
              <div className="school-detail-modal__field school-detail-modal__field--medium">
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
                  <div className="school-detail-modal__readonly">
                    <span className="school-detail-modal__readonly-label"> </span>
                    <div className="school-detail-modal__readonly-value">
                      {purchase.measurementEndDate}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {isEditMode && (
          <button className="school-detail-modal__add-purchase-btn" onClick={handleAddPurchase}>
            주관구매 추가
          </button>
        )}

        <div className="school-detail-modal__section">
          <div className="school-detail-modal__section-header">
            <span className="school-detail-modal__section-title">교복</span>
            {isEditMode && onOpenProductModal && (
              <button
                className="modal__btn modal__btn--primary modal__btn--small"
                onClick={() => onOpenProductModal('winter')}
              >
                신규 품목 추가
              </button>
            )}
          </div>

          <div className="school-detail-modal__season-group">
            <span className="school-detail-modal__season-title">동복</span>
            <div className="school-detail-modal__product-list">
              {winterProducts.map((product, index) =>
                renderProductRow(product, 'winter', index === 0)
              )}
            </div>
            {isEditMode && (
              <button
                className="school-detail-modal__add-product-btn"
                onClick={() => onOpenProductModal?.('winter')}
              >
                동복 품목 추가
              </button>
            )}
          </div>

          <div className="school-detail-modal__season-group">
            <span className="school-detail-modal__season-title">하복</span>
            <div className="school-detail-modal__product-list">
              {summerProducts.map((product, index) =>
                renderProductRow(product, 'summer', index === 0)
              )}
            </div>
            {isEditMode && (
              <button
                className="school-detail-modal__add-product-btn"
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
