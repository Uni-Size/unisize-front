import { useStudentFormStore } from "@/stores/useStudentFormStore";
import { useState } from "react";
import { SUPPORTED_SCHOOLS, GRADE_OPTIONS } from "@/mocks/signupData";
import { signupApi } from "@/api/signupApi";

export default function StepOne({
  next,
  setShowUnsupportedSchool,
}: {
  next: () => void;
  setShowUnsupportedSchool: (isShow: boolean) => void;
}) {
  // Zustand 스토어에서 직접 가져오기
  const { formData, setFormData } = useStudentFormStore();

  const [errors, setErrors] = useState("");
  const currentYear = new Date().getFullYear();

  const generateYearOptions = () =>
    Array.from({ length: 4 }, (_, index) => currentYear - 1 + index);

  const handleNext = async () => {
    console.log(formData);
    setErrors("");

    if (
      !formData.previousSchool ||
      !formData.admissionYear ||
      !formData.admissionGrade ||
      !formData.admissionSchool
    ) {
      setErrors("모든 항목을 입력해주세요.");
      alert("모든 항목을 입력해주세요.");
      return;
    }

    // API를 통해 학교 지원 여부 확인
    const supportCheck = await signupApi.checkSchoolSupport(formData.admissionSchool);

    if (!supportCheck.supported) {
      setShowUnsupportedSchool(true);
      return;
    }
    next();
  };

  return (
    <section className="rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        출신학교와 입학학교를 알려주세요
      </h2>

      <div className="space-y-4">
        {/* 출신학교 */}
        <div>
          <label
            htmlFor="previousSchool"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            출신학교
          </label>
          <input
            id="previousSchool"
            type="text"
            value={formData.previousSchool}
            onChange={(e) => setFormData("previousSchool", e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         focus:border-transparent"
            placeholder="출신학교를 입력해주세요"
          />
        </div>

        {/* 입학년도 */}
        <div>
          <label
            htmlFor="admissionYear"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            입학년도
          </label>
          <select
            id="admissionYear"
            value={formData.admissionYear}
            onChange={(e) =>
              setFormData("admissionYear", parseInt(e.target.value))
            }
            className="w-full border border-gray-300 rounded-md px-3 py-2
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         focus:border-transparent"
          >
            {generateYearOptions().map((year) => (
              <option key={year} value={year}>
                {year}년
              </option>
            ))}
          </select>
        </div>

        {/* 입학학년 */}
        <div>
          <label
            htmlFor="admissionGrade"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            입학학년
          </label>
          <select
            id="admissionGrade"
            value={formData.admissionGrade}
            onChange={(e) =>
              setFormData("admissionGrade", parseInt(e.target.value))
            }
            className="w-full border border-gray-300 rounded-md px-3 py-2
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         focus:border-transparent"
          >
            {GRADE_OPTIONS.map((grade) => (
              <option key={grade.value} value={grade.value}>
                {grade.label}
              </option>
            ))}
          </select>
        </div>

        {/* 입학학교 */}
        <div>
          <label
            htmlFor="admissionSchool"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            입학학교
          </label>
          <input
            id="admissionSchool"
            type="text"
            value={formData.admissionSchool}
            onChange={(e) => setFormData("admissionSchool", e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         focus:border-transparent"
            placeholder="입학학교를 입력해주세요"
          />
        </div>

        {/* 등록 버튼 */}
        <button
          type="button"
          onClick={handleNext}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium
                       py-2 px-4 rounded-md transition duration-200 ease-in-out
                       focus:outline-none focus:ring-2 focus:ring-blue-500
                       focus:ring-offset-2 mt-6"
        >
          등록하기
        </button>
      </div>
    </section>
  );
}
