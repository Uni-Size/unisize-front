import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStudentFormStore } from '@/stores/useStudentFormStore';
import { useStudentResponseStore } from '@/stores/useStudentResponseStore';
import { addStudent, updateMeasurement } from '@/api/student';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';

const VALIDATION_RANGES = {
  height: { min: 130, max: 200 },
  weight: { min: 30, max: 149 },
  shoulder: { min: 21, max: 59 },
  waist: { min: 41, max: 119 },
};

export const MeasurementInputPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fromExisting = location.state?.fromExisting ?? false;
  const { formData, setBodyMeasurements } = useStudentFormStore();
  const { setStudentData, checkinData } = useStudentResponseStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (fromExisting ? !checkinData : !formData.name) {
      navigate(fromExisting ? '/register/existing-lookup' : '/register/student-info', { replace: true });
    }
  }, [fromExisting, checkinData, formData.name, navigate]);

  useEffect(() => {
    if (!fromExisting || !checkinData?.body_measurements) return;
    const m = checkinData.body_measurements;
    if (m.height) setBodyMeasurements('height', m.height);
    if (m.weight) setBodyMeasurements('weight', m.weight);
    if (m.shoulder) setBodyMeasurements('shoulder', m.shoulder);
    if (m.waist) setBodyMeasurements('waist', m.waist);
  }, []);

  const inRange = (value: number, range: { min: number; max: number }) =>
    value >= range.min && value <= range.max;

  // dev 환경(로컬 `npm run dev`, 또는 VITE_OPTIONAL_MEASUREMENT=true로 빌드된
  // dev 사이트)에서는 신체 사이즈 입력을 선택 사항으로 둔다 — 값이 없으면(0) 통과,
  // 값이 있으면 그 값은 여전히 범위를 만족해야 한다.
  const isMeasurementOptional =
    import.meta.env.DEV || import.meta.env.VITE_OPTIONAL_MEASUREMENT === 'true';

  const isFieldValid = (value: number, range: { min: number; max: number }) =>
    isMeasurementOptional ? value === 0 || inRange(value, range) : inRange(value, range);

  // 한글 단어 끝음절의 받침 유무에 따라 "은/는" 조사를 고른다.
  const eunNeun = (word: string) => {
    const lastChar = word.charCodeAt(word.length - 1);
    if (lastChar < 0xac00 || lastChar > 0xd7a3) return '은(는)';
    return (lastChar - 0xac00) % 28 === 0 ? '는' : '은';
  };

  const isFormValid =
    isFieldValid(formData.body.height, VALIDATION_RANGES.height) &&
    isFieldValid(formData.body.weight, VALIDATION_RANGES.weight) &&
    isFieldValid(formData.body.shoulder, VALIDATION_RANGES.shoulder) &&
    isFieldValid(formData.body.waist, VALIDATION_RANGES.waist);

  const FIELD_LABELS: Record<keyof typeof VALIDATION_RANGES, string> = {
    height: '키',
    weight: '몸무게',
    shoulder: '어깨넓이',
    waist: '허리둘레',
  };

  const rangeErrorMessage = (
    Object.keys(VALIDATION_RANGES) as (keyof typeof VALIDATION_RANGES)[]
  )
    .filter((field) => {
      const value = formData.body[field];
      return value > 0 && !inRange(value, VALIDATION_RANGES[field]);
    })
    .map((field) => {
      const { min, max } = VALIDATION_RANGES[field];
      const label = FIELD_LABELS[field];
      return `${label}${eunNeun(label)} ${min}~${max} 사이여야 합니다.`;
    })
    .join(' ');

  const handleBack = () => {
    navigate('/register/measurement-guide');
  };

  const handleSubmit = async () => {
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    setError('');

    try {
      if (fromExisting && checkinData) {
        if (checkinData.measurement_id) {
          await updateMeasurement(checkinData.measurement_id, {
            height: formData.body.height,
            weight: formData.body.weight,
            shoulder_width: formData.body.shoulder,
            waist: formData.body.waist,
          });
        }
        // formData 리셋은 여기서 하지 않는다 — resetFormData()를 호출하면 이 페이지가
        // 아직 구독 중인 동안 formData가 비워져 스텝 가드가 먼저 반응해 엉뚱한 페이지로
        // 밀려나는 문제가 있었다(navigate 이후에도 언마운트 타이밍을 보장할 수 없음).
        // 대신 도착 페이지인 CompletePage 마운트 시점에 리셋한다.
        navigate('/register/complete');
      } else {
        const result = await addStudent(formData);
        setStudentData(result);
        navigate('/register/complete');
      }
    } catch (err) {
      console.error('학생 등록 실패:', err);

      const axiosError = err as { response?: { data?: { error?: { message?: string } } } };
      const errorMessage =
        axiosError.response?.data?.error?.message ?? '학생 정보 등록에 실패했습니다.';

      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
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

      <h2 className="text-2xl font-bold text-center mb-2 text-bg-900">
        학생의 신체 사이즈를 측정해주세요
      </h2>
      <p className="text-lg font-medium text-center mb-4 text-slate-800 leading-relaxed">
        두꺼운 옷을 입으신 경우,
        <br />
        교복 반팔을 매장에서 구매 후 착용하시면 <br /> 더 편리하게 측정할 수
        있습니다.
      </p>

      {isMeasurementOptional && (
        <p className="text-sm text-center mb-10 text-slate-500">
          (dev) 신체 정보는 비워두고 제출할 수 있습니다.
        </p>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="height" className="text-sm font-medium text-gray-700">
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

        <div className="flex flex-col gap-1">
          <label htmlFor="weight" className="text-sm font-medium text-gray-700">
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

        <div className="flex flex-col gap-1">
          <label htmlFor="shoulder" className="text-sm font-medium text-gray-700">
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

        <div className="flex flex-col gap-1">
          <label htmlFor="waist" className="text-sm font-medium text-gray-700">
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

        {rangeErrorMessage && (
          <p className="text-red-500 text-sm text-center">{rangeErrorMessage}</p>
        )}

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

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
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? '제출 중...' : '제출하기'}
          </Button>
        </div>
      </div>
    </section>
  );
};
