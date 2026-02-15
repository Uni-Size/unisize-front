import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../../components/atoms/Input';
import { Button } from '../../../components/atoms/Button';
import { login } from '@/api/auth';
import { useAuthStore } from '@/stores/authStore';

export const LoginPage = () => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const isFormValid = id.trim() !== '' && password.trim() !== '';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isLoading) return;

    setError('');
    setIsLoading(true);
    try {
      const data = await login({ employee_id: id, password });
      setAuth(data.user, data.access_token, data.refresh_token);
      navigate('/admin');
    } catch {
      setError('아이디 또는 비밀번호가 올바르지 않습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white p-6 gap-21.5">
      <div className="w-176 px-4.75 py-6 bg-black/2 border border-[#2563eb] rounded-[20px] relative">
        <div className="flex items-center justify-center gap-[4.89px] mb-4">
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 4L4 12V20C4 31.1 11.88 41.38 22 44C32.12 41.38 40 31.1 40 20V12L22 4Z" stroke="#FCD34D" strokeWidth="2" fill="none"/>
            <path d="M22 4L4 12V20C4 31.1 11.88 41.38 22 44" stroke="#FCD34D" strokeWidth="2" fill="none"/>
            <line x1="22" y1="14" x2="22" y2="26" stroke="#FCD34D" strokeWidth="2"/>
            <circle cx="22" cy="32" r="2" fill="#FCD34D"/>
          </svg>
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 6L6 22L22 38L38 22L22 6Z" stroke="#FCD34D" strokeWidth="2" fill="none"/>
            <path d="M22 12L12 22L22 32L32 22L22 12Z" stroke="#FCD34D" strokeWidth="2" fill="none"/>
            <line x1="22" y1="16" x2="22" y2="28" stroke="#FCD34D" strokeWidth="2"/>
          </svg>
        </div>

        <div className="text-center mb-4">
          <p className="text-xl font-normal text-[#111827] leading-[1.2] mb-2">
            본 시스템은 스마트학생복 청주점만을 위해 개발된
            <br />
            내부 전용 고객/재고 관리 시스템입니다.
          </p>
          <p className="text-xl font-normal text-[#111827]">
            모든 스태프는 아래 사항을 반드시 준수해야 합니다.
          </p>
        </div>

        <div className="text-center [&_p]:text-[17px] [&_p]:font-medium [&_p]:text-[#374151] [&_p]:leading-[1.4] [&_p]:mb-0">
          <p>본 시스템에서 취급되는 모든 데이터는 기밀입니다.</p>
          <p>
            어떠한 경우에도 외부(타 지점, 협력업체, 지인, 온라인 등)로 유출하거나
            공유할 수 없습니다.
          </p>
          <p>
            본 시스템은 업무 목적에 한해서만 사용해야 하며, 개인적 용도나 무단
            열람·복제·촬영을 금지합니다.
          </p>
          <p>
            위 내용을 위반할 경우, 회사 규정 및 관련 법규에 따른 책임을 질 수
            있음을 이해하고 동의합니다.
          </p>
        </div>
      </div>

      <form className="w-118 flex flex-col gap-21.5" onSubmit={handleLogin}>
        <div className="flex flex-col gap-6 [&_.input-wrapper]:w-full [&_.input]:w-full">
          <Input
            placeholder="아이디"
            value={id}
            onChange={(e) => setId(e.target.value)}
            fullWidth
          />
          <Input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
          />
          {error && <p className="text-[15px] text-[#991b1b] text-center m-0">{error}</p>}
        </div>

        <Button
          type="submit"
          variant="primary"
          disabled={!isFormValid || isLoading}
          className="w-full"
        >
          {isLoading ? '로그인 중...' : '다음'}
        </Button>
      </form>
    </div>
  );
};
