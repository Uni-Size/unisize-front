import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentFormStore } from '@/stores/useStudentFormStore';
import { getSupportedSchoolsByYear, type School } from '@/api/school';
import { getTargetYear, getDefaultBirthDate } from '@/utils/schoolUtils';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';

const GRADE_OPTIONS = [
  { value: 1, label: '1학년' },
  { value: 2, label: '2학년' },
  { value: 3, label: '3학년' },
];

export const SchoolInputPage = () => {
  const navigate = useNavigate();
  const { formData, setFormData } = useStudentFormStore();

  const [schools, setSchools] = useState<School[]>([]);
  const [isLoadingSchools, setIsLoadingSchools] = useState(false);
  const [error, setError] = useState('');
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchSchools = async () => {
      setIsLoadingSchools(true);
      try {
        const schoolList = await getSupportedSchoolsByYear(getTargetYear());
        setSchools(schoolList);
      } catch (err) {
        console.error('학교 리스트 조회 실패:', err);
        setError('학교 리스트를 불러오는데 실패했습니다.');
      } finally {
        setIsLoadingSchools(false);
      }
    };

    fetchSchools();
  }, []);

  const generateYearOptions = () =>
    Array.from({ length: 4 }, (_, index) => currentYear - 1 + index);

  const isFormValid =
    formData.previousSchool.trim() !== '' &&
    formData.admissionYear !== 0 &&
    formData.admissionGrade !== 0 &&
    formData.admissionSchool !== '';

  const handleBack = () => {
    navigate('/register');
  };

  const handleNext = () => {
    if (!isFormValid) {
      setError('모든 항목을 입력해주세요.');
      return;
    }
    setError('');
    navigate('/register/student-info');
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

      <h2 className="text-2xl font-bold text-center mb-14 text-[#262626]">
        출신학교와 입학학교를 알려주세요
      </h2>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="previousSchool" className="text-sm font-medium text-[#4c4c4c]">
            출신학교
          </label>
          <Input
            id="previousSchool"
            type="text"
            value={formData.previousSchool}
            onChange={(e) => setFormData('previousSchool', e.target.value)}
            placeholder="출신학교를 입력해주세요"
            fullWidth
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="admissionYear" className="text-sm font-medium text-[#4c4c4c]">
            입학년도
          </label>
          <select
            id="admissionYear"
            value={formData.admissionYear}
            onChange={(e) => setFormData('admissionYear', parseInt(e.target.value))}
            className="w-full py-3 px-4 border border-[#a3a3a3] rounded-lg text-base bg-white cursor-pointer focus:outline-none focus:border-[#6a73a7] focus:ring-2 focus:ring-[#6a73a7]/20 disabled:bg-[#e1e1e1] disabled:cursor-not-allowed"
          >
            {generateYearOptions().map((year) => (
              <option key={year} value={year}>
                {year}년
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="admissionGrade" className="text-sm font-medium text-[#4c4c4c]">
            입학학년
          </label>
          <select
            id="admissionGrade"
            value={formData.admissionGrade}
            onChange={(e) => setFormData('admissionGrade', parseInt(e.target.value))}
            className="w-full py-3 px-4 border border-[#a3a3a3] rounded-lg text-base bg-white cursor-pointer focus:outline-none focus:border-[#6a73a7] focus:ring-2 focus:ring-[#6a73a7]/20 disabled:bg-[#e1e1e1] disabled:cursor-not-allowed"
          >
            {GRADE_OPTIONS.map((grade) => (
              <option key={grade.value} value={grade.value}>
                {grade.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="admissionSchool" className="text-sm font-medium text-[#4c4c4c]">
            입학학교
          </label>
          <select
            id="admissionSchool"
            value={formData.admissionSchool}
            onChange={(e) => {
              const selectedSchool = e.target.value;
              setFormData('admissionSchool', selectedSchool);

              if (selectedSchool && formData.admissionYear) {
                const defaultBirthDate = getDefaultBirthDate(
                  selectedSchool,
                  formData.admissionYear
                );
                setFormData('birthDate', defaultBirthDate);
              }
            }}
            disabled={isLoadingSchools}
            className="w-full py-3 px-4 border border-[#a3a3a3] rounded-lg text-base bg-white cursor-pointer focus:outline-none focus:border-[#6a73a7] focus:ring-2 focus:ring-[#6a73a7]/20 disabled:bg-[#e1e1e1] disabled:cursor-not-allowed"
          >
            <option value="">
              {isLoadingSchools
                ? '학교 목록 불러오는 중...'
                : '학교를 선택해주세요'}
            </option>
            {schools.map((school) => (
              <option key={school.id} value={school.name}>
                {school.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-center my-4">
          <img
            src="/student/congrats.svg"
            alt="축하 이미지"
            className="w-[200px] h-auto"
          />
        </div>

        {error && <p className="text-[#ef4444] text-sm text-center">{error}</p>}

        <Button
          type="button"
          onClick={handleNext}
          disabled={!isFormValid}
          className="mt-6 w-full"
        >
          다음
        </Button>
      </div>
    </section>
  );
};
