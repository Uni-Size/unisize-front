import { useState } from 'react';
import { Modal, Select } from '@components/atoms';
import './SchoolSelectModal.css';

export interface School {
  id: string;
  name: string;
}

export interface SchoolSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (schoolId: string, schoolName: string, price: number, year: string) => void;
  schools: School[];
  title?: string;
}

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 5 }, (_, i) => ({
  value: String(currentYear + i),
  label: String(currentYear + i),
}));

export const SchoolSelectModal = ({
  isOpen,
  onClose,
  onSubmit,
  schools,
  title = '학교 추가',
}: SchoolSelectModalProps) => {
  const [year, setYear] = useState(String(currentYear));
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [price, setPrice] = useState('');

  const schoolOptions = schools.map((school) => ({
    value: school.id,
    label: school.name,
  }));

  const handleSubmit = () => {
    const selectedSchool = schools.find((s) => s.id === selectedSchoolId);
    if (selectedSchool) {
      onSubmit(selectedSchoolId, selectedSchool.name, Number(price), year);
      handleClose();
    }
  };

  const handleClose = () => {
    setYear(String(currentYear));
    setSelectedSchoolId('');
    setPrice('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      width={580}
      actions={
        <>
          <button className="modal__btn modal__btn--cancel" onClick={handleClose}>
            취소
          </button>
          <button
            className="modal__btn modal__btn--primary"
            onClick={handleSubmit}
            disabled={!selectedSchoolId}
          >
            추가
          </button>
        </>
      }
    >
      <div className="school-select-modal__form">
        <div className="school-select-modal__row">
          <div className="school-select-modal__field school-select-modal__field--year">
            <Select
              label="년도"
              placeholder="년도"
              options={yearOptions}
              value={year}
              onChange={setYear}
              fullWidth
            />
          </div>
          <div className="school-select-modal__field school-select-modal__field--school">
            <Select
              label="학교"
              placeholder="학교명"
              options={schoolOptions}
              value={selectedSchoolId}
              onChange={setSelectedSchoolId}
              fullWidth
            />
          </div>
          <div className="school-select-modal__field school-select-modal__field--price">
            <div className="school-select-modal__price-wrapper">
              <span className="school-select-modal__price-label">계약금액</span>
              <div className="school-select-modal__price-input">
                <input
                  type="number"
                  placeholder=""
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
                <span className="school-select-modal__price-unit">원</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
