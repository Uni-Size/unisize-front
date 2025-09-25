import { useState } from "react";
const progressSchools = [
  "서울고등학교",
  "경기고등학교",
  "부산고등학교",
  "대구고등학교",
  "인천고등학교",
];
export default function StepOne({
  next,
  setShowUnsupportedSchool,
  handleInputChange,
  formData,
}: {
  next: () => void;
  setShowUnsupportedSchool: (isShow: boolean) => void;
  handleInputChange: (field: string, value: string | number | boolean) => void;
  formData: {
    previousSchool: string;
    admissionYear: number;
    admissionGrade: number;
    admissionSchool: string;
  };
}) {
  const [errors, setErrors] = useState("");
  const currentYear = new Date().getFullYear();

  const gradeOptions = [
    { value: 1, label: "1학년" },
    { value: 2, label: "2학년" },
    { value: 3, label: "3학년" },
  ];
  const generateYearOptions = () =>
    Array.from({ length: 4 }, (_, index) => currentYear - 1 + index);

  const handleNext = () => {
    console.log(formData);
    setErrors("");
    const isProgressSchool = progressSchools.includes(formData.admissionSchool);

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
    if (!isProgressSchool) {
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
            onChange={(e) =>
              handleInputChange("previousSchool", e.target.value)
            }
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
              handleInputChange("admissionYear", parseInt(e.target.value))
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
              handleInputChange("admissionGrade", parseInt(e.target.value))
            }
            className="w-full border border-gray-300 rounded-md px-3 py-2
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         focus:border-transparent"
          >
            {gradeOptions.map((grade) => (
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
            onChange={(e) =>
              handleInputChange("admissionSchool", e.target.value)
            }
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
