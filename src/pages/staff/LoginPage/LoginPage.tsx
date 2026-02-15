import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../../components/atoms/Input';
import { Button } from '../../../components/atoms/Button';
import { login } from '../../../api/auth';
import { useAuthStore } from '../../../stores/authStore';
import { AxiosError } from 'axios';
import type { ApiResponse } from '../../../api/auth';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { setAuth, isAuthenticated, staff } = useAuthStore();
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isFormValid = employeeId.trim() !== '' && password.trim() !== '';

  useEffect(() => {
    if (isAuthenticated && staff) {
      if (staff.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/staff');
      }
    }
  }, [isAuthenticated, staff, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setError('');
    setIsLoading(true);

    try {
      const loginResponse = await login({
        employee_id: employeeId,
        password,
      });

      setAuth(
        loginResponse.user,
        loginResponse.access_token,
        loginResponse.refresh_token
      );

      if (loginResponse.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/staff');
      }
    } catch (err) {
      console.error('로그인 실패:', err);

      if (err instanceof AxiosError && err.response?.data) {
        const errorData = err.response.data as ApiResponse<unknown>;
        setError(errorData.error?.message || '로그인에 실패했습니다.');
      } else {
        setError('아이디 또는 비밀번호가 올바르지 않습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="px-4 py-12 max-w-150 mx-auto">
      <div className="bg-orange-50 p-6 rounded-xl border border-orange-600">
        <div className="flex gap-2.5 justify-center mb-4">
          <svg
            className="size-8 md:size-11"
            viewBox="0 0 44 44"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M40.3333 35.0625L36.6667 31.3959V12.8334H29.2417L25.8958 9.1667H18.1042L16.3625 11.0917L13.75 8.4792L16.5 5.50003H27.5L30.8917 9.1667H36.6667C37.675 9.1667 38.5382 9.52573 39.2562 10.2438C39.9743 10.9618 40.3333 11.825 40.3333 12.8334V35.0625ZM7.33332 38.5C6.32499 38.5 5.46179 38.141 4.74374 37.423C4.02568 36.7049 3.66665 35.8417 3.66665 34.8334V12.8334C3.66665 11.825 4.02568 10.9618 4.74374 10.2438C5.46179 9.52573 6.32499 9.1667 7.33332 9.1667H9.21249L12.8792 12.8334H7.33332V34.8334H34.8792L38.5458 38.5H7.33332ZM28.6917 28.6459C27.9278 29.6848 26.9729 30.5174 25.8271 31.1438C24.6812 31.7702 23.4055 32.0834 22 32.0834C19.7083 32.0834 17.7604 31.2813 16.1562 29.6771C14.5521 28.073 13.75 26.125 13.75 23.8334C13.75 22.4278 14.0632 21.1521 14.6896 20.0063C15.316 18.8604 16.1486 17.9056 17.1875 17.1417L19.8458 19.8C19.1125 20.1973 18.5243 20.7473 18.0812 21.45C17.6382 22.1528 17.4167 22.9473 17.4167 23.8334C17.4167 25.1167 17.8597 26.2014 18.7458 27.0875C19.6319 27.9736 20.7167 28.4167 22 28.4167C22.8861 28.4167 23.6805 28.1952 24.3833 27.7521C25.0861 27.3091 25.6361 26.7209 26.0333 25.9875L28.6917 28.6459ZM27.8667 17.9667C28.6305 18.7 29.2187 19.5709 29.6312 20.5792C30.0437 21.5875 30.25 22.6723 30.25 23.8334V24.3834C30.25 24.5667 30.2347 24.75 30.2042 24.9334L20.9 15.6292C21.0833 15.5986 21.2667 15.5834 21.45 15.5834H22C23.1611 15.5834 24.2458 15.7896 25.2542 16.2021C26.2625 16.6146 27.1333 17.2028 27.8667 17.9667ZM37.5375 42.7167L1.23749 6.4167L3.84999 3.8042L40.15 40.1042L37.5375 42.7167Z"
              fill="#fc994d"
            />
          </svg>
          <svg
            className="size-8 md:size-11"
            viewBox="0 0 44 44"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1.83337 38.4998L22 3.6665L42.1667 38.4998H1.83337ZM8.15837 34.8332H35.8417L22 10.9998L8.15837 34.8332ZM22 32.9998C22.5195 32.9998 22.9549 32.8241 23.3063 32.4728C23.6577 32.1214 23.8334 31.6859 23.8334 31.1665C23.8334 30.6471 23.6577 30.2116 23.3063 29.8603C22.9549 29.5089 22.5195 29.3332 22 29.3332C21.4806 29.3332 21.0452 29.5089 20.6938 29.8603C20.3424 30.2116 20.1667 30.6471 20.1667 31.1665C20.1667 31.6859 20.3424 32.1214 20.6938 32.4728C21.0452 32.8241 21.4806 32.9998 22 32.9998ZM20.1667 27.4998H23.8334V18.3332H20.1667V27.4998Z"
              fill="#fc994d"
            />
          </svg>
        </div>

        <div className="text-center mb-5">
          <p className="text-sm md:text-base font-semibold leading-relaxed text-gray-800">
            본 시스템은 스마트학생복 청주점만을 위해 개발된
            <br />
            내부 전용 고객/재고 관리 시스템입니다.
          </p>
          <p className="mt-2 text-sm text-gray-600">
            모든 스태프는 아래 사항을 반드시 준수해야 합니다.
          </p>
        </div>

        <div className="text-[13px] md:text-sm text-gray-500 text-center leading-[1.8]">
          <p>모든 데이터는 기밀이며, 외부로의 유출/공유를 금지합니다.</p>
          <p>업무 외 무단 열람/복제 및 개인적 사용을 금지합니다.</p>
          <p>이를 위반할 경우 관련 법규에 따른 책임을 질 수 있습니다.</p>
        </div>
      </div>

      <form className="mt-10 flex flex-col gap-4" onSubmit={handleSubmit}>
        {error && (
          <div className="p-3 bg-red-50 border border-red-300 text-red-600 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Input
            placeholder="아이디"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            disabled={isLoading}
            fullWidth
          />
          <Input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          {isLoading ? '로그인 중...' : '로그인'}
        </Button>

        <p className="text-center text-sm text-gray-400">
          staff 합류는 관리자에게 문의하세요.
        </p>
      </form>
    </div>
  );
};
