import { useNavigate } from 'react-router-dom';

export const OnboardingPage = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/register/school');
  };

  return (
    <main className="p-4 text-center min-h-screen bg-[#dbe0f8] flex flex-col items-center justify-center">
      <h4 className="text-2xl font-bold leading-[1.4] mb-[3.75rem] text-[#262626]">
        스마트학생복 청주점 <br />
        교복 측정 대기 등록
      </h4>
      <button
        type="button"
        onClick={handleStart}
        className="flex flex-col items-center gap-2 bg-none border-none cursor-pointer p-4 transition-transform duration-200 ease-in-out hover:scale-105"
      >
        <img
          src="/student/onboarding.svg"
          alt="Self Check In"
          className="w-[200px] h-auto"
        />
        <span className="text-lg font-semibold text-[#393939]">Self Check In</span>
      </button>
    </main>
  );
};
