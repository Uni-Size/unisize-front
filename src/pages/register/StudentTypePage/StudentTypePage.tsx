import { useNavigate } from 'react-router-dom';
import { useStudentFormStore } from '@/stores/useStudentFormStore';

type StudentType = 'new' | 'transfer' | 'existing';

const TYPE_OPTIONS: { type: StudentType; label: string; desc: string }[] = [
  { type: 'new', label: '신입생', desc: '처음 입학하는 학생' },
  { type: 'transfer', label: '전학생', desc: '다른 학교에서 전학 오는 학생' },
  { type: 'existing', label: '재학생', desc: '이미 재학 중인 학생' },
];

export const StudentTypePage = () => {
  const navigate = useNavigate();
  const { formData, setFormData } = useStudentFormStore();

  const handleSelect = (type: StudentType) => {
    setFormData('studentType', type);
    if (type === 'existing') {
      navigate('/register/existing-lookup');
    } else {
      navigate('/register/school-info');
    }
  };

  const handleBack = () => {
    navigate('/register');
  };

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

      <h2 className="text-2xl font-bold text-center mb-14 text-bg-900">
        학생 유형을 선택해주세요
      </h2>

      <div className="flex flex-col gap-4">
        {TYPE_OPTIONS.map(({ type, label, desc }) => (
          <button
            key={type}
            type="button"
            onClick={() => handleSelect(type)}
            className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all duration-150 cursor-pointer ${
              formData.studentType === type
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 bg-white hover:border-primary-300'
            }`}
          >
            <p className="text-base font-semibold text-bg-900">{label}</p>
            <p className="text-sm text-slate-500 mt-0.5">{desc}</p>
          </button>
        ))}
      </div>
    </section>
  );
};
