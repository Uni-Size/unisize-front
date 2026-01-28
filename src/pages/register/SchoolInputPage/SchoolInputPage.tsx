import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentFormStore } from '@/stores/useStudentFormStore';
import { getSupportedSchoolsByYear, type School } from '@/api/school';
import { getTargetYear, getDefaultBirthDate } from '@/utils/schoolUtils';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import './SchoolInputPage.css';

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
    <section className="school-input-page">
      <div className="school-input-page__header">
        <button
          type="button"
          onClick={handleBack}
          className="school-input-page__back-button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="school-input-page__back-icon"
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

      <h2 className="school-input-page__title">
        출신학교와 입학학교를 알려주세요
      </h2>

      <div className="school-input-page__form">
        <div className="school-input-page__field">
          <label htmlFor="previousSchool" className="school-input-page__label">
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

        <div className="school-input-page__field">
          <label htmlFor="admissionYear" className="school-input-page__label">
            입학년도
          </label>
          <select
            id="admissionYear"
            value={formData.admissionYear}
            onChange={(e) => setFormData('admissionYear', parseInt(e.target.value))}
            className="school-input-page__select"
          >
            {generateYearOptions().map((year) => (
              <option key={year} value={year}>
                {year}년
              </option>
            ))}
          </select>
        </div>

        <div className="school-input-page__field">
          <label htmlFor="admissionGrade" className="school-input-page__label">
            입학학년
          </label>
          <select
            id="admissionGrade"
            value={formData.admissionGrade}
            onChange={(e) => setFormData('admissionGrade', parseInt(e.target.value))}
            className="school-input-page__select"
          >
            {GRADE_OPTIONS.map((grade) => (
              <option key={grade.value} value={grade.value}>
                {grade.label}
              </option>
            ))}
          </select>
        </div>

        <div className="school-input-page__field">
          <label htmlFor="admissionSchool" className="school-input-page__label">
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
            className="school-input-page__select"
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

        <div className="school-input-page__image-container">
          <img
            src="/student/congrats.svg"
            alt="축하 이미지"
            className="school-input-page__image"
          />
        </div>

        {error && <p className="school-input-page__error">{error}</p>}

        <Button
          type="button"
          onClick={handleNext}
          disabled={!isFormValid}
          className="school-input-page__submit-button"
        >
          다음
        </Button>
      </div>
    </section>
  );
};
