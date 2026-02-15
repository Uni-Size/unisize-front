import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/atoms/Button';

export const MeasurementGuidePage = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/register/student-info');
  };

  const handleNext = () => {
    navigate('/register/measurement');
  };

  return (
    <section className="max-w-[24rem] mx-auto p-4 min-h-screen">
      <div className="mb-7">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-1 bg-none border-none cursor-pointer text-[#4b5563] font-medium p-0 transition-colors duration-200 ease-in-out hover:text-[#262626]"
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

      <h2 className="text-2xl font-bold text-center mb-4 text-[#262626]">
        학생의 신체 사이즈를 측정해주세요
      </h2>
      <p className="text-lg font-medium text-center mb-8 text-[#1f2937] leading-relaxed">
        정확한 교복 사이즈를 위해, <br /> 두꺼운 옷은 벗고 측정해주세요.
      </p>

      <div className="flex justify-center my-8">
        <img
          src="/student/body.svg"
          alt="신체 측정 안내"
          className="w-[200px] h-auto"
        />
      </div>

      <p className="my-2 text-center text-[#6b7280] text-sm leading-relaxed">
        시착 시, 얇은 반팔이 필요하신 경우 <br /> 교복용 반팔을 구매하실 수
        있습니다.
      </p>

      <div className="flex gap-4 mt-6">
        <Button
          type="button"
          onClick={handleBack}
          variant="secondary"
          className="flex-1"
        >
          이전
        </Button>
        <Button
          type="button"
          onClick={handleNext}
          className="flex-1"
        >
          다음
        </Button>
      </div>
    </section>
  );
};
