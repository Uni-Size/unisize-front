import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkinByPhone } from '@/api/student';
import { useStudentResponseStore } from '@/stores/useStudentResponseStore';
import { Button } from '@/components/atoms/Button';

const formatPhoneNumber = (value: string) => {
  const numbers = value.replace(/[^0-9]/g, '');
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
};

export const ExistingLookupPage = () => {
  const navigate = useNavigate();
  const { setCheckinData } = useStudentResponseStore();
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleBack = () => {
    navigate('/register/school');
  };

  const handleSearch = async () => {
    const raw = phone.replace(/[^0-9]/g, '');
    if (raw.length < 10) {
      setError('올바른 전화번호를 입력해주세요.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const data = await checkinByPhone(phone);
      setCheckinData(data);
      navigate('/register/measurement-guide', { state: { fromExisting: true } });
    } catch (err) {
      const axiosError = err as { response?: { data?: { error?: { code?: string; message?: string } } } };
      const code = axiosError.response?.data?.error?.code;
      if (code === 'NOT_FOUND') {
        setError('등록된 재학생 정보를 찾을 수 없습니다.');
      } else {
        setError('조회 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isValid = phone.replace(/[^0-9]/g, '').length >= 10;

  return (
    <section className="max-w-[24rem] mx-auto p-4 min-h-screen">
      <div className="mb-7">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-1 bg-none border-none cursor-pointer text-slate-600 font-medium p-0 transition-colors duration-200 ease-in-out hover:text-bg-900"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          <span>뒤로</span>
        </button>
      </div>

      <h2 className="text-2xl font-bold text-center mb-4 text-bg-900 leading-[1.4]">
        재학생 정보 조회
      </h2>
      <p className="text-sm text-slate-500 text-center mb-10">
        학생 전화번호로 조회합니다
      </p>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="phone" className="text-sm font-medium text-gray-700">
            전화번호
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => {
              setPhone(formatPhoneNumber(e.target.value));
              setError('');
            }}
            onKeyDown={(e) => e.key === 'Enter' && !isLoading && isValid && handleSearch()}
            placeholder="010-0000-0000"
            maxLength={13}
            className="w-full h-12.5 px-4 border border-gray-200 rounded-lg text-base text-gray-700 bg-transparent focus:outline-none focus:border-bg-400 placeholder:text-bg-400"
          />
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <Button
          type="button"
          onClick={handleSearch}
          disabled={isLoading || !isValid}
          className="mt-2 w-full"
        >
          {isLoading ? '조회 중...' : '조회'}
        </Button>
      </div>
    </section>
  );
};
