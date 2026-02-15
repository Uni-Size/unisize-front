import { useState } from 'react';
import { Modal, Input } from '@components/atoms';
import { registerStaff } from '@/api/auth';

export interface StaffRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const StaffRegisterModal = ({
  isOpen,
  onClose,
  onSuccess,
}: StaffRegisterModalProps) => {
  const [employeeId, setEmployeeId] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [gender, setGender] = useState<'M' | 'F'>('M');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setEmployeeId('');
    setEmployeeName('');
    setGender('M');
    setPassword('');
    setPasswordConfirm('');
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!employeeId.trim() || !employeeName.trim() || !password.trim()) {
      setError('모든 항목을 입력해주세요.');
      return;
    }

    if (password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.');
      return;
    }

    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setError('');
    setIsLoading(true);
    try {
      await registerStaff({
        employee_id: employeeId,
        employee_name: employeeName,
        gender,
        password,
      });
      handleClose();
      onSuccess();
    } catch {
      setError('등록에 실패했습니다. 사번이 중복되었을 수 있습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="스태프 추가"
      width={500}
      actions={
        <>
          <button
            className="px-6 py-2.5 bg-[#6c757d] text-white text-sm font-medium rounded-lg border-none cursor-pointer hover:opacity-90"
            onClick={handleClose}
          >
            취소
          </button>
          <button
            className="px-6 py-2.5 bg-primary-900 text-[#f9fafb] text-sm font-medium rounded-lg border-none cursor-pointer hover:opacity-90"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? '등록 중...' : '등록'}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4 w-full">
        <div className="flex gap-2 items-end">
          <div className="flex-1 min-w-0">
            <Input
              label="사번"
              placeholder="사번을 입력하세요"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              fullWidth
            />
          </div>
        </div>

        <div className="flex gap-2 items-end">
          <div className="flex-1 min-w-0">
            <Input
              label="이름"
              placeholder="이름을 입력하세요"
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
              fullWidth
            />
          </div>
          <div className="flex-none w-30 min-w-0">
            <div className="flex flex-col gap-1">
              <span className="px-2 text-base text-bg-800">성별</span>
              <div className="flex items-center h-12.5 gap-4 px-4 border border-[#c6c6c6] rounded-lg bg-white">
                <label className="flex items-center gap-1 text-[15px] text-[#4c4c4c] cursor-pointer">
                  <input
                    type="radio"
                    name="register-gender"
                    value="M"
                    checked={gender === 'M'}
                    onChange={() => setGender('M')}
                  />
                  남
                </label>
                <label className="flex items-center gap-1 text-[15px] text-[#4c4c4c] cursor-pointer">
                  <input
                    type="radio"
                    name="register-gender"
                    value="F"
                    checked={gender === 'F'}
                    onChange={() => setGender('F')}
                  />
                  여
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 items-end">
          <div className="flex-1 min-w-0">
            <Input
              label="비밀번호"
              type="password"
              placeholder="8자 이상 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
            />
          </div>
        </div>

        <div className="flex gap-2 items-end">
          <div className="flex-1 min-w-0">
            <Input
              label="비밀번호 확인"
              type="password"
              placeholder="비밀번호를 다시 입력하세요"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              fullWidth
            />
          </div>
        </div>

        {error && <p className="text-sm text-[#991b1b] text-center m-0">{error}</p>}
      </div>
    </Modal>
  );
};
