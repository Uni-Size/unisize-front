import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentFormStore } from '@/stores/useStudentFormStore';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import './StudentInfoPage.css';

const PRIVACY_POLICY = {
  title: '개인정보 수집·이용에 동의합니다. (필수)',
  items: [
    '수집항목: 학생 이름, 생년월일, 성별, 연락처, 보호자 연락처',
    '이용목적: 무상교복 지원 사업 신청 및 교복 수선 서비스 제공',
    '보유기간: 업무 처리 완료 후 3년',
  ],
};

export const StudentInfoPage = () => {
  const navigate = useNavigate();
  const { formData, setFormData } = useStudentFormStore();
  const [error, setError] = useState('');

  const isFormValid =
    formData.name.trim() !== '' &&
    formData.studentPhone.trim() !== '' &&
    formData.guardianPhone.trim() !== '' &&
    formData.birthDate !== '' &&
    (formData.gender === 'M' || formData.gender === 'F') &&
    formData.privacyConsent === true;

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/[^0-9]/g, '');
    let formatted = '';

    if (numbers.length > 0) {
      if (numbers.length <= 3) {
        formatted = numbers;
      } else if (numbers.length <= 7) {
        formatted = `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
      } else {
        formatted = `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
      }
    }

    return formatted;
  };

  const handleBack = () => {
    navigate('/register/school');
  };

  const handleNext = () => {
    if (!isFormValid) {
      setError('모든 항목을 입력해주세요.');
      return;
    }
    setError('');
    navigate('/register/measurement-guide');
  };

  return (
    <section className="student-info-page">
      <div className="student-info-page__header">
        <button
          type="button"
          onClick={handleBack}
          className="student-info-page__back-button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="student-info-page__back-icon"
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

      <h2 className="student-info-page__title">
        {formData.admissionSchool}에
        {formData.admissionGrade === 1 ? ' 입학하는' : ' 전학오는'} <br />
        학생의 정보를 알려주세요
      </h2>

      <div className="student-info-page__form">
        <div className="student-info-page__field">
          <label htmlFor="birthDate" className="student-info-page__label">
            학생 생년월일
          </label>
          <input
            id="birthDate"
            type="date"
            value={formData.birthDate}
            onChange={(e) => setFormData('birthDate', e.target.value)}
            className="student-info-page__date-input"
          />
        </div>

        <div className="student-info-page__field">
          <label htmlFor="name" className="student-info-page__label">
            학생이름
          </label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData('name', e.target.value)}
            placeholder="학생 이름을 입력하세요"
            fullWidth
          />
        </div>

        <div className="student-info-page__field">
          <label className="student-info-page__label">성별</label>
          <div className="student-info-page__radio-group">
            <label className="student-info-page__radio-label">
              <input
                type="radio"
                name="gender"
                value="M"
                checked={formData.gender === 'M'}
                onChange={(e) => setFormData('gender', e.target.value as 'M' | 'F')}
                className="student-info-page__radio"
              />
              <span>남자</span>
            </label>
            <label className="student-info-page__radio-label">
              <input
                type="radio"
                name="gender"
                value="F"
                checked={formData.gender === 'F'}
                onChange={(e) => setFormData('gender', e.target.value as 'M' | 'F')}
                className="student-info-page__radio"
              />
              <span>여자</span>
            </label>
          </div>
        </div>

        <div className="student-info-page__field">
          <label htmlFor="studentPhone" className="student-info-page__label">
            학생 연락처
          </label>
          <Input
            id="studentPhone"
            type="tel"
            value={formData.studentPhone}
            onChange={(e) => {
              const formatted = formatPhoneNumber(e.target.value);
              setFormData('studentPhone', formatted);
            }}
            placeholder="010-0000-0000"
            maxLength={13}
            fullWidth
          />
        </div>

        <div className="student-info-page__field">
          <label htmlFor="guardianPhone" className="student-info-page__label">
            보호자 연락처
          </label>
          <Input
            id="guardianPhone"
            type="tel"
            value={formData.guardianPhone}
            onChange={(e) => {
              const formatted = formatPhoneNumber(e.target.value);
              setFormData('guardianPhone', formatted);
            }}
            placeholder="010-0000-0000"
            maxLength={13}
            fullWidth
          />
        </div>

        <div className="student-info-page__privacy">
          <label className="student-info-page__privacy-label">
            <input
              type="checkbox"
              checked={formData.privacyConsent || false}
              onChange={(e) => setFormData('privacyConsent', e.target.checked)}
              className="student-info-page__checkbox"
            />
            <div className="student-info-page__privacy-content">
              <span className="student-info-page__privacy-title">
                {PRIVACY_POLICY.title}
              </span>
              <div className="student-info-page__privacy-items">
                {PRIVACY_POLICY.items.map((item, index) => (
                  <div key={index}>• {item}</div>
                ))}
              </div>
            </div>
          </label>
        </div>

        {error && <p className="student-info-page__error">{error}</p>}

        <div className="student-info-page__buttons">
          <Button
            type="button"
            onClick={handleBack}
            variant="secondary"
            className="student-info-page__button"
          >
            이전
          </Button>
          <Button
            type="button"
            onClick={handleNext}
            disabled={!isFormValid}
            className="student-info-page__button"
          >
            다음
          </Button>
        </div>
      </div>
    </section>
  );
};
