import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/atoms/Button';
import './MeasurementGuidePage.css';

export const MeasurementGuidePage = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/register/student-info');
  };

  const handleNext = () => {
    navigate('/register/measurement');
  };

  return (
    <section className="measurement-guide-page">
      <div className="measurement-guide-page__header">
        <button
          type="button"
          onClick={handleBack}
          className="measurement-guide-page__back-button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="measurement-guide-page__back-icon"
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

      <h2 className="measurement-guide-page__title">
        학생의 신체 사이즈를 측정해주세요
      </h2>
      <p className="measurement-guide-page__subtitle">
        정확한 교복 사이즈를 위해, <br /> 두꺼운 옷은 벗고 측정해주세요.
      </p>

      <div className="measurement-guide-page__image-container">
        <img
          src="/student/body.svg"
          alt="신체 측정 안내"
          className="measurement-guide-page__image"
        />
      </div>

      <p className="measurement-guide-page__note">
        시착 시, 얇은 반팔이 필요하신 경우 <br /> 교복용 반팔을 구매하실 수
        있습니다.
      </p>

      <div className="measurement-guide-page__buttons">
        <Button
          type="button"
          onClick={handleBack}
          variant="secondary"
          className="measurement-guide-page__button"
        >
          이전
        </Button>
        <Button
          type="button"
          onClick={handleNext}
          className="measurement-guide-page__button"
        >
          다음
        </Button>
      </div>
    </section>
  );
};
