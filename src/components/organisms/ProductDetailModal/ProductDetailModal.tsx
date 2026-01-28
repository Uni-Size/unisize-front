import { useState, useEffect } from 'react';
import { Modal, Select, Input } from '@components/atoms';
import type { SchoolPrice } from '../ProductAddModal';
import './ProductDetailModal.css';

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
  { value: 'summer', label: '하복' },
  { value: 'winter', label: '동복' },
  { value: 'spring-fall', label: '춘추복' },
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
  { value: 'male', label: '남' },
  { value: 'female', label: '여' },
  { value: 'unisex', label: '공용' },
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
            <button className="modal__btn modal__btn--cancel" onClick={() => setIsEditMode(false)}>
              취소
            </button>
            <button className="modal__btn modal__btn--primary" onClick={handleSave}>
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
      <div className="product-detail-modal__form">
        <div className="product-detail-modal__row">
          <div className="product-detail-modal__field">
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
              <div className="product-detail-modal__readonly">
                <span className="product-detail-modal__readonly-label">시즌</span>
                <div className="product-detail-modal__readonly-value">
                  {getSeasonLabel(product.season)}
                </div>
              </div>
            )}
          </div>
          <div className="product-detail-modal__field">
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
              <div className="product-detail-modal__readonly">
                <span className="product-detail-modal__readonly-label">카테고리</span>
                <div className="product-detail-modal__readonly-value">
                  {getCategoryLabel(product.category)}
                </div>
              </div>
            )}
          </div>
          <div className="product-detail-modal__field">
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
              <div className="product-detail-modal__readonly">
                <span className="product-detail-modal__readonly-label">성별</span>
                <div className="product-detail-modal__readonly-value">
                  {getGenderLabel(product.gender)}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="product-detail-modal__row">
          <div className="product-detail-modal__field">
            {isEditMode ? (
              <Input
                label="표시명"
                placeholder="흰색 오각"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                fullWidth
              />
            ) : (
              <div className="product-detail-modal__readonly">
                <span className="product-detail-modal__readonly-label">표시명</span>
                <div className="product-detail-modal__readonly-value">{product.displayName}</div>
              </div>
            )}
          </div>
          <div className="product-detail-modal__field">
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
              <div className="product-detail-modal__readonly">
                <span className="product-detail-modal__readonly-label">가격</span>
                <div className="product-detail-modal__readonly-value">
                  {product.originalPrice.toLocaleString()}원
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="product-detail-modal__row">
          <div className="product-detail-modal__field">
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
              <div className="product-detail-modal__readonly">
                <span className="product-detail-modal__readonly-label">수선 가능여부</span>
                <div className="product-detail-modal__readonly-value">
                  {getRepairableLabel(product.isRepairable)}
                </div>
              </div>
            )}
          </div>
          <div className="product-detail-modal__field">
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
              <div className="product-detail-modal__readonly">
                <span className="product-detail-modal__readonly-label">수선 필수 여부</span>
                <div className="product-detail-modal__readonly-value">
                  {getRepairRequiredLabel(product.isRepairRequired)}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="product-detail-modal__row">
          <div className="product-detail-modal__field">
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
              <div className="product-detail-modal__readonly">
                <span className="product-detail-modal__readonly-label">사이즈</span>
                <div className="product-detail-modal__readonly-value">
                  {getSizeUnitLabel(product.sizeUnit)}
                </div>
              </div>
            )}
          </div>
          <div className="product-detail-modal__field" />
        </div>

        <div className="product-detail-modal__school-section">
          <div className="product-detail-modal__school-header">
            <span className="product-detail-modal__school-label">사용 학교</span>
            {isEditMode && onOpenSchoolModal && (
              <button
                className="modal__btn modal__btn--primary modal__btn--small"
                onClick={onOpenSchoolModal}
              >
                학교 추가
              </button>
            )}
          </div>
          {schools.length > 0 && (
            <div className="product-detail-modal__school-groups">
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
                  <div key={year} className="product-detail-modal__school-year-group">
                    <span className="product-detail-modal__school-year">{year}</span>
                    <div className="product-detail-modal__school-list">
                      {yearSchools.map((school) => (
                        <div key={`${school.year}-${school.schoolId}`} className="product-detail-modal__school-item">
                          <span className="product-detail-modal__school-name">{school.schoolName}</span>
                          <div className="product-detail-modal__school-price">
                            {isEditMode && onSchoolPriceChange ? (
                              <>
                                <input
                                  type="number"
                                  className="product-detail-modal__school-price-input"
                                  value={school.price}
                                  onChange={(e) =>
                                    onSchoolPriceChange(school.schoolId, Number(e.target.value))
                                  }
                                />
                                <span className="product-detail-modal__school-price-unit">원</span>
                              </>
                            ) : (
                              <>{school.price.toLocaleString()}원</>
                            )}
                          </div>
                          {isEditMode && onRemoveSchool && (
                            <button
                              className="product-detail-modal__school-remove"
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
