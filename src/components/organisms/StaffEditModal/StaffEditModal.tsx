import { useState, useEffect } from 'react';
import { Modal, Input } from '@components/atoms';
import { resetStaffPassword } from '@/api/staff';

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
      <div className="flex flex-col gap-4 w-full">
        <div className="flex justify-end">
          <span className="text-xs text-bg-400">
            등록일: {staff.registeredDate}
          </span>
        </div>

        <div className="flex gap-2 items-end">
          <div className="flex-1 min-w-0">
            <div className="flex flex-col gap-1">
              <span className="px-2 text-base text-bg-800">사번</span>
              <div className="flex items-center h-12.5 px-4 border border-[#c6c6c6] rounded-lg bg-white text-[15px] text-[#4c4c4c]">
                {staff.employeeId}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 items-end">
          <div className="flex-1 min-w-0">
            {isEditMode ? (
              <Input
                label="이름"
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
              />
            ) : (
              <div className="flex flex-col gap-1">
                <span className="px-2 text-base text-bg-800">이름</span>
                <div className="flex items-center h-12.5 px-4 border border-[#c6c6c6] rounded-lg bg-white text-[15px] text-[#4c4c4c]">
                  {staff.name}
                </div>
              </div>
            )}
          </div>
          <div className="flex-none w-30 min-w-0">
            {isEditMode ? (
              <div className="flex flex-col gap-1">
                <span className="px-2 text-base text-bg-800">성별</span>
                <div className="flex items-center h-12.5 gap-4 px-4 border border-[#c6c6c6] rounded-lg bg-white">
                  <label className="flex items-center gap-1 text-[15px] text-[#4c4c4c] cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="남"
                      checked={gender === '남'}
                      onChange={() => setGender('남')}
                    />
                    남
                  </label>
                  <label className="flex items-center gap-1 text-[15px] text-[#4c4c4c] cursor-pointer">
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
              <div className="flex flex-col gap-1">
                <span className="px-2 text-base text-bg-800">성별</span>
                <div className="flex items-center h-12.5 px-4 border border-[#c6c6c6] rounded-lg bg-white text-[15px] text-[#4c4c4c]">
                  {staff.gender}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 items-end">
          <div className="flex-1 min-w-0">
            {isEditMode ? (
              <Input
                label="연락처"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                fullWidth
              />
            ) : (
              <div className="flex flex-col gap-1">
                <span className="px-2 text-base text-bg-800">연락처</span>
                <div className="flex items-center h-12.5 px-4 border border-[#c6c6c6] rounded-lg bg-white text-[15px] text-[#4c4c4c]">
                  {staff.phone}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="h-px bg-gray-200 my-1" />

        <div className="flex items-center justify-between">
          <span className="text-base font-medium text-bg-800">비밀번호 관리</span>
          <button
            className="flex items-center justify-center px-5 py-2.5 bg-[#991b1b] border-none rounded-lg text-sm text-[#f9fafb] cursor-pointer transition-opacity duration-200 hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
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
