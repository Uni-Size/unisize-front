import { useState } from "react";

export default function StepTwo({
  back,
  next,
  submit,
  handleInputChange,
  formData,
}: {
  back: () => void;
  next: () => void;
  submit: () => void;
  handleInputChange: (field: string, value: string | number | boolean) => void;
  formData: {
    previousSchool: string;
    admissionYear: number;
    admissionGrade: number;
    admissionSchool: string;
    name: string;
    studentPhone: string;
    guardianPhone: string;
    birthDate: string;
    gender: string;
    privacyConsent: boolean;
  };
}) {
  const [errors, setErrors] = useState("");

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

  return (
    <section className="rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        {formData.admissionSchool}에{" "}
        {formData.admissionGrade === 1 ? "입학하는" : "전학오는"}
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
            onChange={(e) => handleInputChange("birthDate", e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         focus:border-transparent"
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
            onChange={(e) => handleInputChange("name", e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         focus:border-transparent"
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
                value="boy"
                checked={formData.gender === "boy"}
                onChange={(e) => handleInputChange("gender", e.target.value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">남자</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="gender"
                value="girl"
                checked={formData.gender === "girl"}
                onChange={(e) => handleInputChange("gender", e.target.value)}
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
              const value = e.target.value.replace(/[^0-9]/g, "");
              let formattedValue = "";

              if (value.length > 0) {
                if (value.length <= 3) {
                  formattedValue = value;
                } else if (value.length <= 7) {
                  formattedValue = `${value.slice(0, 3)}-${value.slice(3)}`;
                } else {
                  formattedValue = `${value.slice(0, 3)}-${value.slice(
                    3,
                    7
                  )}-${value.slice(7, 11)}`;
                }
              }

              handleInputChange("studentPhone", formattedValue);
            }}
            className="w-full border border-gray-300 rounded-md px-3 py-2
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         focus:border-transparent"
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
              const value = e.target.value.replace(/[^0-9]/g, "");
              let formattedValue = "";

              if (value.length > 0) {
                if (value.length <= 3) {
                  formattedValue = value;
                } else if (value.length <= 7) {
                  formattedValue = `${value.slice(0, 3)}-${value.slice(3)}`;
                } else {
                  formattedValue = `${value.slice(0, 3)}-${value.slice(
                    3,
                    7
                  )}-${value.slice(7, 11)}`;
                }
              }

              handleInputChange("guardianPhone", formattedValue);
            }}
            className="w-full border border-gray-300 rounded-md px-3 py-2
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         focus:border-transparent"
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
              onChange={(e) =>
                handleInputChange("privacyConsent", e.target.checked)
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
            />
            <label
              htmlFor="privacyConsent"
              className="ml-3 text-sm text-gray-700 cursor-pointer"
            >
              <span className="font-medium text-gray-900">
                개인정보 수집·이용에 동의합니다. (필수)
              </span>
              <div className="mt-1 text-xs text-gray-600">
                • 수집항목: 학생 이름, 생년월일, 성별, 연락처, 보호자 연락처
                <br />
                • 이용목적: 무상교복 지원 사업 신청 및 교복 수선 서비스 제공
                <br />• 보유기간: 업무 처리 완료 후 3년
              </div>
            </label>
          </div>
        </div>

        {/* 버튼들 */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={back}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium
                       py-2 px-4 rounded-md transition duration-200 ease-in-out
                       focus:outline-none focus:ring-2 focus:ring-gray-500
                       focus:ring-offset-2 mt-6"
          >
            학교 변경하기
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={!formData.privacyConsent}
            className={`w-full font-medium py-2 px-4 rounded-md transition duration-200 ease-in-out
                       focus:outline-none focus:ring-2 focus:ring-offset-2 mt-6 ${
                         formData.privacyConsent
                           ? "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500"
                           : "bg-gray-300 text-gray-500 cursor-not-allowed"
                       }`}
          >
            다음
          </button>
        </div>
      </div>
    </section>
  );
}
