import { useNavigate } from 'react-router-dom';
import './OnboardingPage.css';

export const OnboardingPage = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/register/school');
  };

  return (
    <main className="onboarding-page">
      <h4 className="onboarding-page__title">
        스마트학생복 청주점 <br />
        교복 측정 대기 등록
      </h4>
      <button
        type="button"
        onClick={handleStart}
        className="onboarding-page__button"
      >
        <img
          src="/student/onboarding.svg"
          alt="Self Check In"
          className="onboarding-page__image"
        />
        <span className="onboarding-page__button-text">Self Check In</span>
      </button>
    </main>
  );
};
