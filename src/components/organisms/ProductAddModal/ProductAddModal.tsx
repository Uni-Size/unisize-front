import { useState } from 'react';
import { Modal, Select, Input } from '@components/atoms';
import './ProductAddModal.css';

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
  sizeUnit: string;
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

export const ProductAddModal = ({
  isOpen,
  onClose,
  onSubmit,
  onOpenSchoolModal,
  selectedSchools,
  onRemoveSchool,
  onSchoolPriceChange,
}: ProductAddModalProps) => {
  const [season, setSeason] = useState('');
  const [category, setCategory] = useState('');
  const [gender, setGender] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [isRepairable, setIsRepairable] = useState('');
  const [isRepairRequired, setIsRepairRequired] = useState('');
  const [sizeUnit, setSizeUnit] = useState('');

  const handleSubmit = () => {
    onSubmit({
      season,
      category,
      gender,
      displayName,
      originalPrice: Number(originalPrice),
      isRepairable,
      isRepairRequired,
      sizeUnit,
      schools: selectedSchools,
    });
    handleClose();
  };

  const handleClose = () => {
    setSeason('');
    setCategory('');
    setGender('');
    setDisplayName('');
    setOriginalPrice('');
    setIsRepairable('');
    setIsRepairRequired('');
    setSizeUnit('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="품목추가"
      width={800}
      actions={
        <>
          <button className="modal__btn modal__btn--cancel" onClick={handleClose}>
            취소
          </button>
          <button className="modal__btn modal__btn--primary" onClick={handleSubmit}>
            추가
          </button>
        </>
      }
    >
      <div className="product-add-modal__form">
        <div className="product-add-modal__row">
          <div className="product-add-modal__field">
            <Select
              label="시즌"
              placeholder="시즌"
              options={seasonOptions}
              value={season}
              onChange={setSeason}
              fullWidth
            />
          </div>
          <div className="product-add-modal__field">
            <Select
              label="카테고리"
              placeholder="카테고리"
              options={categoryOptions}
              value={category}
              onChange={setCategory}
              fullWidth
            />
          </div>
          <div className="product-add-modal__field">
            <Select
              label="성별"
              placeholder="성별"
              options={genderOptions}
              value={gender}
              onChange={setGender}
              fullWidth
            />
          </div>
        </div>

        <div className="product-add-modal__row">
          <div className="product-add-modal__field">
            <Input
              label="표시명"
              placeholder="흰색 오각"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              fullWidth
            />
          </div>
          <div className="product-add-modal__field">
            <Input
              label="가격"
              placeholder="가격"
              type="number"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(e.target.value)}
              fullWidth
            />
          </div>
        </div>

        <div className="product-add-modal__row">
          <div className="product-add-modal__field">
            <Select
              label="수선 가능여부"
              placeholder="불가능"
              options={repairableOptions}
              value={isRepairable}
              onChange={setIsRepairable}
              fullWidth
            />
          </div>
          <div className="product-add-modal__field">
            <Select
              label="수선 필수 여부"
              placeholder="선택사항"
              options={repairRequiredOptions}
              value={isRepairRequired}
              onChange={setIsRepairRequired}
              fullWidth
            />
          </div>
        </div>

        <div className="product-add-modal__row">
          <div className="product-add-modal__field">
            <Select
              label="사이즈"
              placeholder="5단위"
              options={sizeUnitOptions}
              value={sizeUnit}
              onChange={setSizeUnit}
              fullWidth
            />
          </div>
          <div className="product-add-modal__field" />
        </div>

        <div className="product-add-modal__school-section">
          <div className="product-add-modal__school-header">
            <span className="product-add-modal__school-label">사용 학교</span>
            <button
              className="modal__btn modal__btn--primary modal__btn--small"
              onClick={onOpenSchoolModal}
            >
              학교 추가
            </button>
          </div>
          {selectedSchools.length === 0 ? (
            <p className="product-add-modal__school-empty">사용하는 학교가 없습니다</p>
          ) : (
            <div className="product-add-modal__school-groups">
              {Object.entries(
                selectedSchools.reduce<Record<string, SchoolPrice[]>>((acc, school) => {
                  const year = school.year;
                  if (!acc[year]) {
                    acc[year] = [];
                  }
                  acc[year].push(school);
                  return acc;
                }, {})
              )
                .sort(([a], [b]) => b.localeCompare(a))
                .map(([year, schools]) => (
                  <div key={year} className="product-add-modal__school-year-group">
                    <span className="product-add-modal__school-year">{year}</span>
                    <div className="product-add-modal__school-list">
                      {schools.map((school) => (
                        <div key={`${school.year}-${school.schoolId}`} className="product-add-modal__school-item">
                          <span className="product-add-modal__school-name">{school.schoolName}</span>
                          <div className="product-add-modal__school-price">
                            <input
                              type="number"
                              className="product-add-modal__school-price-input"
                              value={school.price}
                              onChange={(e) =>
                                onSchoolPriceChange(school.schoolId, Number(e.target.value))
                              }
                            />
                            <span className="product-add-modal__school-price-unit">원</span>
                          </div>
                          <button
                            className="product-add-modal__school-remove"
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
