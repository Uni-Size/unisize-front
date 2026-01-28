import { useNavigate } from 'react-router-dom';
import { useStudentResponseStore } from '@/stores/useStudentResponseStore';
import { Button } from '@/components/atoms/Button';
import './ExistingStudentPage.css';

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
      <section className="existing-student-page">
        <div className="existing-student-page__loading">
          <p>데이터를 불러오는 중...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="existing-student-page">
      <div className="existing-student-page__content">
        <div className="existing-student-page__icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="existing-student-page__icon-svg"
          >
            <path
              fillRule="evenodd"
              d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        <h2 className="existing-student-page__title">
          이미 등록된 학생입니다
        </h2>

        <div className="existing-student-page__info">
          <div className="existing-student-page__info-row">
            <span className="existing-student-page__info-label">이름</span>
            <span className="existing-student-page__info-value">
              {studentData.name}
            </span>
          </div>
          <div className="existing-student-page__info-row">
            <span className="existing-student-page__info-label">학교</span>
            <span className="existing-student-page__info-value">
              {studentData.school_name}
            </span>
          </div>
          <div className="existing-student-page__info-row">
            <span className="existing-student-page__info-label">생년월일</span>
            <span className="existing-student-page__info-value">
              {studentData.birth_date}
            </span>
          </div>
          <div className="existing-student-page__info-row">
            <span className="existing-student-page__info-label">등록일</span>
            <span className="existing-student-page__info-value">
              {new Date(studentData.created_at).toLocaleDateString('ko-KR')}
            </span>
          </div>
        </div>

        <p className="existing-student-page__description">
          이미 등록된 정보가 있습니다. <br />
          새로 등록하시겠습니까?
        </p>

        <div className="existing-student-page__buttons">
          <Button
            type="button"
            onClick={handleViewComplete}
            variant="secondary"
            className="existing-student-page__button"
          >
            등록 정보 보기
          </Button>
          <Button
            type="button"
            onClick={handleNewRegistration}
            className="existing-student-page__button"
          >
            새로 등록하기
          </Button>
        </div>
      </div>
    </section>
  );
};
