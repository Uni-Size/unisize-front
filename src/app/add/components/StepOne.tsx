import { useStudentFormStore } from "@/stores/useStudentFormStore";
import { useState, useEffect } from "react";
import {
  getSupportedSchoolsByYear,
  type School,
} from "@/api/school";
import { getTargetYear, getDefaultBirthDate } from "@/utils/schoolUtils";
import Button from "@/components/ui/Button";
import Image from "next/image";

const GRADE_OPTIONS = [
  { value: 1, label: "1학년" },
  { value: 2, label: "2학년" },
  { value: 3, label: "3학년" },
];

export default function StepOne({ next }: { next: () => void }) {
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
        const schoolList = await getSupportedSchoolsByYear(getTargetYear());
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

  // 모든 필드가 입력되었는지 확인
  const isFormValid =
    formData.previousSchool.trim() !== "" &&
    formData.admissionYear !== 0 &&
    formData.admissionGrade !== 0 &&
    formData.admissionSchool !== "";

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
    <section>
      <h2 className="title2 text-center mb-14">
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
            className="w-full"
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
            className="w-full"
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
            className="w-full"
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
            onChange={(e) => {
              const selectedSchool = e.target.value;
              setFormData("admissionSchool", selectedSchool);

              // 학교 선택 시 생년월일 기본값 설정
              if (selectedSchool && formData.admissionYear) {
                const defaultBirthDate = getDefaultBirthDate(
                  selectedSchool,
                  formData.admissionYear
                );
                setFormData("birthDate", defaultBirthDate);
              }
            }}
            disabled={isLoadingSchools}
            className="w-full"
          >
            <option value="">
              {isLoadingSchools
                ? "학교 목록 불러오는 중..."
                : "학교를 선택해주세요"}
            </option>
            {schools.map((school) => (
              <option key={school.id} value={school.name}>
                {school.name}
              </option>
            ))}
          </select>
        </div>
        <Image
          src="/student/congrats.svg"
          alt="logo"
          width={200}
          height={100}
          className="mx-auto"
        />

        {/* 등록 버튼 */}
        <Button
          type="button"
          onClick={handleNext}
          disabled={!isFormValid}
          className="mt-6"
        >
          다음
        </Button>
      </div>
    </section>
  );
}
