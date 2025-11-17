import { useStudentFormStore } from "@/stores/useStudentFormStore";
import { useState, useEffect } from "react";
import { GRADE_OPTIONS } from "@/mocks/signupData";
import { getSupportedSchools, type School } from "@/api/schoolApi";

export default function StepOne({
  next,
  setShowUnsupportedSchool,
}: {
  next: () => void;
  setShowUnsupportedSchool: (show: boolean) => void;
}) {
  // Zustand 스토어에서 직접 가져오기
  const { formData, setFormData } = useStudentFormStore();

  const [errors, setErrors] = useState("");
  const [schools, setSchools] = useState<School[]>([]);
  const [isLoadingSchools, setIsLoadingSchools] = useState(false);
  const currentYear = new Date().getFullYear();

  // 학교 리스트 가져오기
  useEffect(() => {
    const fetchSchools = async () => {
      setIsLoadingSchools(true);
      try {
        const schoolList = await getSupportedSchools();
        setSchools(schoolList);
      } catch (error) {
        console.error("학교 리스트 조회 실패:", error);
        setErrors("학교 리스트를 불러오는데 실패했습니다.");
      } finally {
        setIsLoadingSchools(false);
      }
    };

    fetchSchools();
  }, []);

  const generateYearOptions = () =>
    Array.from({ length: 4 }, (_, index) => currentYear - 1 + index);

  const handleNext = () => {
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
          <select
            id="admissionSchool"
            value={formData.admissionSchool}
            onChange={(e) => setFormData("admissionSchool", e.target.value)}
            disabled={isLoadingSchools}
            className="w-full border border-gray-300 rounded-md px-3 py-2
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">
              {isLoadingSchools ? "학교 목록 불러오는 중..." : "학교를 선택해주세요"}
            </option>
            {schools.map((school) => (
              <option key={school.id} value={school.name}>
                {school.name}
              </option>
            ))}
          </select>
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
