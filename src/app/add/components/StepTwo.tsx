import { useStudentFormStore } from "@/stores/useStudentFormStore";
import { useState } from "react";
import Button from "@/components/ui/Button";

const PRIVACY_POLICY = {
  title: "개인정보 수집·이용에 동의합니다. (필수)",
  items: [
    "수집항목: 학생 이름, 생년월일, 성별, 연락처, 보호자 연락처",
    "이용목적: 무상교복 지원 사업 신청 및 교복 수선 서비스 제공",
    "보유기간: 업무 처리 완료 후 3년",
  ],
};

export default function StepTwo({
  next,
  prev,
}: {
  next: () => void;
  prev: () => void;
}) {
  const { formData, setFormData } = useStudentFormStore();

  const [errors, setErrors] = useState("");

  // 모든 필드가 입력되었는지 확인
  const isFormValid =
    formData.name.trim() !== "" &&
    formData.studentPhone.trim() !== "" &&
    formData.guardianPhone.trim() !== "" &&
    formData.birthDate !== "" &&
    (formData.gender === "M" || formData.gender === "F") &&
    formData.privacyConsent === true;

  const handleNext = () => {
    console.log(formData);

    if (
      !formData.name ||
      !formData.studentPhone ||
      !formData.guardianPhone ||
      !formData.birthDate ||
      !formData.gender
    ) {
      setErrors("모든 항목을 입력해주세요.");
      alert("모든 항목을 입력해주세요.");
      return;
    }

    next();
  };

  // 전화번호 포맷팅 함수
  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/[^0-9]/g, "");
    let formatted = "";

    if (numbers.length > 0) {
      if (numbers.length <= 3) {
        formatted = numbers;
      } else if (numbers.length <= 7) {
        formatted = `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
      } else {
        formatted = `${numbers.slice(0, 3)}-${numbers.slice(
          3,
          7
        )}-${numbers.slice(7, 11)}`;
      }
    }

    return formatted;
  };

  return (
    <section>
      <h2 className="title2 text-center mb-14">
        {formData.admissionSchool}에
        {formData.admissionGrade === 1 ? "입학하는" : "전학오는"} <br />
        학생의 정보를 알려주세요
      </h2>

      <div className="space-y-4">
        {/* 학생 생년월일 */}
        <div>
          <label
            htmlFor="birthDate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            학생 생년월일
          </label>
          <input
            id="birthDate"
            type="date"
            value={formData.birthDate}
            onChange={(e) => setFormData("birthDate", e.target.value)}
            className="w-full"
          />
        </div>

        {/* 학생이름 */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            학생이름
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData("name", e.target.value)}
            className="w-full"
            placeholder="학생 이름을 입력하세요"
          />
        </div>

        {/* 성별 - 라디오 버튼 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            성별
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="gender"
                value="M"
                checked={formData.gender === "M"}
                onChange={(e) => setFormData("gender", e.target.value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">남자</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="gender"
                value="F"
                checked={formData.gender === "F"}
                onChange={(e) => setFormData("gender", e.target.value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">여자</span>
            </label>
          </div>
        </div>

        {/* 학생 연락처 */}
        <div>
          <label
            htmlFor="studentPhone"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            학생 연락처
          </label>
          <input
            id="studentPhone"
            type="tel"
            value={formData.studentPhone}
            onChange={(e) => {
              const formatted = formatPhoneNumber(e.target.value);
              setFormData("studentPhone", formatted);
            }}
            className="w-full"
            placeholder="010-0000-0000"
            maxLength={13}
          />
        </div>

        {/* 보호자 연락처 */}
        <div>
          <label
            htmlFor="guardianPhone"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            보호자 연락처
          </label>
          <input
            id="guardianPhone"
            type="tel"
            value={formData.guardianPhone}
            onChange={(e) => {
              const formatted = formatPhoneNumber(e.target.value);
              setFormData("guardianPhone", formatted);
            }}
            className="w-full"
            placeholder="010-0000-0000"
            maxLength={13}
          />
        </div>

        {/* 개인정보 처리 동의 */}
        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <div className="flex items-start">
            <input
              id="privacyConsent"
              type="checkbox"
              checked={formData.privacyConsent || false}
              onChange={(e) => setFormData("privacyConsent", e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
            />
            <label
              htmlFor="privacyConsent"
              className="ml-3 text-sm text-gray-700 cursor-pointer"
            >
              <span className="font-medium text-gray-900">
                {PRIVACY_POLICY.title}
              </span>
              <div className="mt-1 text-xs text-gray-600">
                {PRIVACY_POLICY.items.map((item, index) => (
                  <div key={index}>
                    • {item}
                    {index < PRIVACY_POLICY.items.length - 1 && <br />}
                  </div>
                ))}
              </div>
            </label>
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex gap-4 mt-6">
          <Button
            type="button"
            onClick={prev}
            variant="secondary"
            className="flex-1"
          >
            이전
          </Button>
          <Button
            type="button"
            onClick={handleNext}
            disabled={!isFormValid}
            className="flex-1"
          >
            다음
          </Button>
        </div>
      </div>
    </section>
  );
}
