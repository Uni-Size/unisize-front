import { useState, useEffect } from 'react';
import { Modal, Input } from '@components/atoms';
import { resetStaffPassword } from '@/api/staff';
import './StaffEditModal.css';

export interface StaffEditData {
  id: number;
  employeeId: string;
  name: string;
  gender: '남' | '여';
  phone: string;
  registeredDate: string;
}

export interface StaffEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: StaffEditData | null;
  onUpdate: (data: StaffEditData) => void;
}

export const StaffEditModal = ({
  isOpen,
  onClose,
  staff,
  onUpdate,
}: StaffEditModalProps) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'남' | '여'>('남');
  const [phone, setPhone] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    if (staff) {
      setName(staff.name);
      setGender(staff.gender);
      setPhone(staff.phone);
      setIsEditMode(false);
    }
  }, [staff]);

  const handleClose = () => {
    setIsEditMode(false);
    onClose();
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleSave = () => {
    if (staff) {
      onUpdate({
        ...staff,
        name,
        gender,
        phone,
      });
    }
    setIsEditMode(false);
  };

  const handleResetPassword = async () => {
    if (!staff) return;

    const confirmed = window.confirm(
      `${staff.name} 스태프의 비밀번호를 초기화하시겠습니까?`
    );
    if (!confirmed) return;

    setIsResetting(true);
    try {
      await resetStaffPassword(staff.employeeId);
      alert('비밀번호가 초기화되었습니다.');
    } catch {
      alert('비밀번호 초기화에 실패했습니다.');
    } finally {
      setIsResetting(false);
    }
  };

  if (!staff) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="스태프 정보"
      width={500}
      actions={
        isEditMode ? (
          <>
            <button
              className="modal__btn modal__btn--cancel"
              onClick={() => setIsEditMode(false)}
            >
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
      <div className="staff-edit-modal__form">
        <div className="staff-edit-modal__header-info">
          <span className="staff-edit-modal__date-info">
            등록일: {staff.registeredDate}
          </span>
        </div>

        <div className="staff-edit-modal__row">
          <div className="staff-edit-modal__field">
            <div className="staff-edit-modal__readonly">
              <span className="staff-edit-modal__readonly-label">사번</span>
              <div className="staff-edit-modal__readonly-value">
                {staff.employeeId}
              </div>
            </div>
          </div>
        </div>

        <div className="staff-edit-modal__row">
          <div className="staff-edit-modal__field">
            {isEditMode ? (
              <Input
                label="이름"
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
              />
            ) : (
              <div className="staff-edit-modal__readonly">
                <span className="staff-edit-modal__readonly-label">이름</span>
                <div className="staff-edit-modal__readonly-value">
                  {staff.name}
                </div>
              </div>
            )}
          </div>
          <div className="staff-edit-modal__field staff-edit-modal__field--small">
            {isEditMode ? (
              <div className="staff-edit-modal__gender-field">
                <span className="staff-edit-modal__gender-label">성별</span>
                <div className="staff-edit-modal__gender-options">
                  <label className="staff-edit-modal__radio-label">
                    <input
                      type="radio"
                      name="gender"
                      value="남"
                      checked={gender === '남'}
                      onChange={() => setGender('남')}
                    />
                    남
                  </label>
                  <label className="staff-edit-modal__radio-label">
                    <input
                      type="radio"
                      name="gender"
                      value="여"
                      checked={gender === '여'}
                      onChange={() => setGender('여')}
                    />
                    여
                  </label>
                </div>
              </div>
            ) : (
              <div className="staff-edit-modal__readonly">
                <span className="staff-edit-modal__readonly-label">성별</span>
                <div className="staff-edit-modal__readonly-value">
                  {staff.gender}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="staff-edit-modal__row">
          <div className="staff-edit-modal__field">
            {isEditMode ? (
              <Input
                label="연락처"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                fullWidth
              />
            ) : (
              <div className="staff-edit-modal__readonly">
                <span className="staff-edit-modal__readonly-label">연락처</span>
                <div className="staff-edit-modal__readonly-value">
                  {staff.phone}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="staff-edit-modal__divider" />

        <div className="staff-edit-modal__password-section">
          <span className="staff-edit-modal__section-title">비밀번호 관리</span>
          <button
            className="staff-edit-modal__reset-btn"
            onClick={handleResetPassword}
            disabled={isResetting}
          >
            {isResetting ? '초기화 중...' : '비밀번호 초기화'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
