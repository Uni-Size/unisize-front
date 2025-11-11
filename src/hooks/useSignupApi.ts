import {
  useQuery,
  useMutation,
  UseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";
import { SUPPORTED_SCHOOLS } from "@/mocks/signupData";

// 학생 등록 요청 타입
export interface StudentRegistrationRequest {
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
  body: {
    height: number;
    weight: number;
    shoulder: number;
    waist: number;
  };
}

// 학생 등록 응답 타입
export interface StudentRegistrationResponse {
  success: boolean;
  message: string;
  studentId?: string;
}

// 학교 지원 여부 확인 응답 타입
export interface SchoolSupportResponse {
  supported: boolean;
  schoolName: string;
  message?: string;
}

// Query Keys
export const signupKeys = {
  all: ["signup"] as const,
  supportedSchools: () => [...signupKeys.all, "supportedSchools"] as const,
  schoolSupport: (schoolName: string) =>
    [...signupKeys.all, "schoolSupport", schoolName] as const,
};

// API 함수들
async function fetchSupportedSchools(): Promise<string[]> {
  // 더미 데이터로 시뮬레이션
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("지원 학교 목록 조회:", SUPPORTED_SCHOOLS);
      resolve(SUPPORTED_SCHOOLS);
    }, 200);
  });
}

async function fetchSchoolSupport(
  schoolName: string
): Promise<SchoolSupportResponse> {
  // 더미 데이터로 시뮬레이션
  return new Promise((resolve) => {
    setTimeout(() => {
      const supported = SUPPORTED_SCHOOLS.includes(schoolName);
      const result = {
        supported,
        schoolName,
        message: supported
          ? `${schoolName}은(는) 지원 가능한 학교입니다.`
          : `${schoolName}은(는) 현재 지원되지 않는 학교입니다.`,
      };
      console.log("학교 지원 여부 확인:", result);
      resolve(result);
    }, 300);
  });
}

async function registerStudent(
  data: StudentRegistrationRequest
): Promise<StudentRegistrationResponse> {
  // 더미 데이터로 시뮬레이션
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 필수 항목 검증
      if (
        !data.previousSchool ||
        !data.admissionYear ||
        !data.admissionGrade ||
        !data.admissionSchool ||
        !data.name ||
        !data.studentPhone ||
        !data.guardianPhone ||
        !data.birthDate ||
        !data.gender ||
        !data.body.height ||
        !data.body.weight ||
        !data.body.shoulder ||
        !data.body.waist
      ) {
        reject({
          success: false,
          message: "모든 필수 항목을 입력해주세요.",
        });
        return;
      }

      // 개인정보 동의 확인
      if (!data.privacyConsent) {
        reject({
          success: false,
          message: "개인정보 수집·이용에 동의해주세요.",
        });
        return;
      }

      // 성공 응답
      console.log("학생 등록 데이터:", data);
      resolve({
        success: true,
        message: "학생 정보가 성공적으로 등록되었습니다.",
        studentId: `student-${Date.now()}`,
      });
    }, 500);
  });
}

// React Query Hooks

// 1. 지원 학교 목록 조회
export function useSupportedSchools(
  options?: Omit<
    UseQueryOptions<string[], Error, string[], readonly string[]>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: signupKeys.supportedSchools(),
    queryFn: fetchSupportedSchools,
    ...options,
  });
}

// 2. 학교 지원 여부 확인
export function useSchoolSupport(
  schoolName: string,
  options?: Omit<
    UseQueryOptions<
      SchoolSupportResponse,
      Error,
      SchoolSupportResponse,
      readonly string[]
    >,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: signupKeys.schoolSupport(schoolName),
    queryFn: () => fetchSchoolSupport(schoolName),
    enabled: !!schoolName, // schoolName이 있을 때만 실행
    ...options,
  });
}

// 3. 학생 정보 등록
export function useRegisterStudent(
  options?: UseMutationOptions<
    StudentRegistrationResponse,
    Error,
    StudentRegistrationRequest
  >
) {
  return useMutation({
    mutationFn: registerStudent,
    ...options,
  });
}
