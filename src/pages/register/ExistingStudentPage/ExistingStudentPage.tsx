import { useNavigate } from 'react-router-dom';
import { useStudentResponseStore } from '@/stores/useStudentResponseStore';
import { Button } from '@/components/atoms/Button';

export const ExistingStudentPage = () => {
  const navigate = useNavigate();
  const { studentData, clearStudentData } = useStudentResponseStore();

  const handleNewRegistration = () => {
    clearStudentData();
    navigate('/register');
  };

  const handleViewComplete = () => {
    navigate('/register/complete');
  };

  if (!studentData) {
    return (
      <section className="max-w-[24rem] mx-auto p-4 min-h-screen flex items-center justify-center">
        <div className="flex justify-center items-center text-[#4b5563]">
          <p>데이터를 불러오는 중...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-[24rem] mx-auto p-4 min-h-screen flex items-center justify-center">
      <div className="w-full text-center">
        <div className="flex justify-center mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-16 h-16 text-[#6a73a7]"
          >
            <path
              fillRule="evenodd"
              d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-[#262626] mb-6">
          이미 등록된 학생입니다
        </h2>

        <div className="bg-[#f9fafb] rounded-lg p-4 mb-6">
          <div className="flex justify-between py-2 border-b border-[#c6c6c6]">
            <span className="text-sm text-[#4b5563]">이름</span>
            <span className="text-sm font-medium text-[#262626]">
              {studentData.name}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-[#c6c6c6]">
            <span className="text-sm text-[#4b5563]">학교</span>
            <span className="text-sm font-medium text-[#262626]">
              {studentData.school_name}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-[#c6c6c6]">
            <span className="text-sm text-[#4b5563]">생년월일</span>
            <span className="text-sm font-medium text-[#262626]">
              {studentData.birth_date}
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-sm text-[#4b5563]">등록일</span>
            <span className="text-sm font-medium text-[#262626]">
              {new Date(studentData.created_at).toLocaleDateString('ko-KR')}
            </span>
          </div>
        </div>

        <p className="text-sm text-[#4b5563] leading-relaxed mb-6">
          이미 등록된 정보가 있습니다. <br />
          새로 등록하시겠습니까?
        </p>

        <div className="flex flex-col gap-3">
          <Button
            type="button"
            onClick={handleViewComplete}
            variant="secondary"
            className="w-full"
          >
            등록 정보 보기
          </Button>
          <Button
            type="button"
            onClick={handleNewRegistration}
            className="w-full"
          >
            새로 등록하기
          </Button>
        </div>
      </div>
    </section>
  );
};
