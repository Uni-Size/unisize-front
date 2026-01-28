import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentFormStore } from '@/stores/useStudentFormStore';
import { useStudentResponseStore } from '@/stores/useStudentResponseStore';
import { addStudent } from '@/api/student';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import './MeasurementInputPage.css';

const VALIDATION_RANGES = {
  height: { min: 130, max: 200 },
  weight: { min: 30, max: 150 },
  shoulder: { min: 30, max: 60 },
  waist: { min: 20, max: 40 },
};

export const MeasurementInputPage = () => {
  const navigate = useNavigate();
  const { formData, setBodyMeasurements, resetFormData } = useStudentFormStore();
  const { setStudentData } = useStudentResponseStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isFormValid =
    formData.body.height > 0 &&
    formData.body.weight > 0 &&
    formData.body.shoulder > 0 &&
    formData.body.waist > 0;

  const handleBack = () => {
    navigate('/register/measurement-guide');
  };

  const handleSubmit = async () => {
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    setError('');

    try {
      const result = await addStudent(formData);
      setStudentData(result);
      resetFormData();
      navigate('/register/complete');
    } catch (err) {
      console.error('학생 등록 실패:', err);

      let errorMessage = '학생 정보 등록에 실패했습니다.';

      if (err && typeof err === 'object') {
        if ('response' in err && err.response && typeof err.response === 'object') {
          const response = err.response as { data?: { message?: string } };
          if (response.data?.message) {
            errorMessage = response.data.message;
          }
        } else if ('message' in err && typeof err.message === 'string') {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="measurement-input-page">
      <div className="measurement-input-page__header">
        <button
          type="button"
          onClick={handleBack}
          className="measurement-input-page__back-button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="measurement-input-page__back-icon"
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

      <h2 className="measurement-input-page__title">
        학생의 신체 사이즈를 측정해주세요
      </h2>
      <p className="measurement-input-page__subtitle">
        두꺼운 옷을 입으신 경우,
        <br />
        교복 반팔을 매장에서 구매 후 착용하시면 <br /> 더 편리하게 측정할 수
        있습니다.
      </p>

      <div className="measurement-input-page__form">
        <div className="measurement-input-page__field">
          <label htmlFor="height" className="measurement-input-page__label">
            키 (cm)
          </label>
          <Input
            id="height"
            type="number"
            min={VALIDATION_RANGES.height.min}
            max={VALIDATION_RANGES.height.max}
            value={formData.body.height || ''}
            onChange={(e) => setBodyMeasurements('height', Number(e.target.value))}
            placeholder="키를 입력하세요"
            fullWidth
          />
        </div>

        <div className="measurement-input-page__field">
          <label htmlFor="weight" className="measurement-input-page__label">
            몸무게 (kg)
          </label>
          <Input
            id="weight"
            type="number"
            min={VALIDATION_RANGES.weight.min}
            max={VALIDATION_RANGES.weight.max}
            value={formData.body.weight || ''}
            onChange={(e) => setBodyMeasurements('weight', Number(e.target.value))}
            placeholder="몸무게를 입력하세요"
            fullWidth
          />
        </div>

        <div className="measurement-input-page__field">
          <label htmlFor="shoulder" className="measurement-input-page__label">
            어깨넓이 (cm)
          </label>
          <Input
            id="shoulder"
            type="number"
            min={VALIDATION_RANGES.shoulder.min}
            max={VALIDATION_RANGES.shoulder.max}
            value={formData.body.shoulder || ''}
            onChange={(e) => setBodyMeasurements('shoulder', Number(e.target.value))}
            placeholder="어깨넓이를 입력하세요"
            fullWidth
          />
        </div>

        <div className="measurement-input-page__field">
          <label htmlFor="waist" className="measurement-input-page__label">
            허리둘레 (cm)
          </label>
          <Input
            id="waist"
            type="number"
            min={VALIDATION_RANGES.waist.min}
            max={VALIDATION_RANGES.waist.max}
            value={formData.body.waist || ''}
            onChange={(e) => setBodyMeasurements('waist', Number(e.target.value))}
            placeholder="허리둘레를 입력하세요"
            fullWidth
          />
        </div>

        {error && <p className="measurement-input-page__error">{error}</p>}

        <div className="measurement-input-page__buttons">
          <Button
            type="button"
            onClick={handleBack}
            variant="secondary"
            className="measurement-input-page__button"
          >
            이전
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            className="measurement-input-page__button"
          >
            {isSubmitting ? '제출 중...' : '제출하기'}
          </Button>
        </div>
      </div>
    </section>
  );
};
