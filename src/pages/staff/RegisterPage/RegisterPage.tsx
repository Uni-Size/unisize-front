import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../../components/atoms/Input';
import { Button } from '../../../components/atoms/Button';
import { registerStaff } from '../../../api/auth';
import './RegisterPage.css';

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
    <div className="staff-register-page">
      <h1 className="staff-register-page__title">스태프 가입 신청</h1>

      <form className="staff-register-page__form" onSubmit={handleSubmit}>
        {error && <div className="staff-register-page__error">{error}</div>}

        <div className="staff-register-page__inputs">
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

          <div className="staff-register-page__gender">
            <span className="staff-register-page__gender-label">성별</span>
            <div className="staff-register-page__gender-options">
              <label className="staff-register-page__radio-label">
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
              <label className="staff-register-page__radio-label">
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
          className="staff-register-page__button"
        >
          {isLoading ? '신청 중...' : '가입 신청'}
        </Button>

        <p className="staff-register-page__help-text">
          이미 계정이 있으신가요?{' '}
          <a href="/staff/login" className="staff-register-page__link">
            로그인
          </a>
        </p>
      </form>
    </div>
  );
};
