import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../../components/atoms/Input';
import { Button } from '../../../components/atoms/Button';
import { registerStaff } from '../../../api/auth';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [employeeId, setEmployeeId] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [gender, setGender] = useState<'M' | 'F'>('M');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isFormValid =
    employeeId.trim() !== '' &&
    employeeName.trim() !== '' &&
    password.trim() !== '' &&
    passwordConfirm.trim() !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isLoading) return;

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
      alert('가입 신청이 완료되었습니다. 관리자 승인 후 로그인할 수 있습니다.');
      navigate('/staff/login');
    } catch {
      setError('가입에 실패했습니다. 사번이 중복되었을 수 있습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="px-4 py-12 max-w-150 mx-auto">
      <h1 className="text-2xl font-semibold text-gray-800 text-center mb-8">스태프 가입 신청</h1>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {error && <div className="p-3 bg-red-50 border border-red-300 text-red-600 rounded-lg text-sm text-center">{error}</div>}

        <div className="flex flex-col gap-3">
          <Input
            placeholder="사번"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            disabled={isLoading}
            fullWidth
          />
          <Input
            placeholder="이름"
            value={employeeName}
            onChange={(e) => setEmployeeName(e.target.value)}
            disabled={isLoading}
            fullWidth
          />

          <div className="flex items-center gap-4 px-4 py-3 border border-gray-200 rounded-lg bg-white">
            <span className="text-[15px] text-gray-500 min-w-7.5">성별</span>
            <div className="flex gap-4">
              <label className="flex items-center gap-1 text-[15px] text-gray-700 cursor-pointer">
                <input
                  type="radio"
                  name="page-gender"
                  value="M"
                  checked={gender === 'M'}
                  onChange={() => setGender('M')}
                  disabled={isLoading}
                />
                남
              </label>
              <label className="flex items-center gap-1 text-[15px] text-gray-700 cursor-pointer">
                <input
                  type="radio"
                  name="page-gender"
                  value="F"
                  checked={gender === 'F'}
                  onChange={() => setGender('F')}
                  disabled={isLoading}
                />
                여
              </label>
            </div>
          </div>

          <Input
            type="password"
            placeholder="비밀번호 (8자 이상)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            fullWidth
          />
          <Input
            type="password"
            placeholder="비밀번호 확인"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            disabled={isLoading}
            fullWidth
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          disabled={!isFormValid || isLoading}
          className="mt-2 w-full"
        >
          {isLoading ? '신청 중...' : '가입 신청'}
        </Button>

        <p className="text-center text-sm text-gray-400">
          이미 계정이 있으신가요?{' '}
          <a href="/staff/login" className="text-blue-600 no-underline hover:underline">
            로그인
          </a>
        </p>
      </form>
    </div>
  );
};
