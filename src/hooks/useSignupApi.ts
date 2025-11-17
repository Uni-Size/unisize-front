import {
  useQuery,
  useMutation,
  UseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";
import {
  getSupportedSchools,
  registerStudent,
  type School,
  type StudentRegistrationRequest,
  type StudentRegistrationResponse,
  type SchoolSupportResponse,
} from "@/api/signupApi";

// Re-export types
export type { StudentRegistrationRequest, StudentRegistrationResponse, SchoolSupportResponse, School };

// Query Keys
export const signupKeys = {
  all: ["signup"] as const,
  supportedSchools: () => [...signupKeys.all, "supportedSchools"] as const,
  schoolSupport: (schoolName: string) =>
    [...signupKeys.all, "schoolSupport", schoolName] as const,
};

// 학교 지원 여부 확인 함수
async function fetchSchoolSupport(
  schoolName: string
): Promise<SchoolSupportResponse> {
  // 지원 학교 목록 가져오기
  const schools = await getSupportedSchools();
  const supported = schools.some((school) => school.name === schoolName);

  return {
    supported,
    schoolName,
    message: supported
      ? `${schoolName}은(는) 지원 가능한 학교입니다.`
      : `${schoolName}은(는) 현재 지원되지 않는 학교입니다.`,
  };
}

// React Query Hooks

// 1. 지원 학교 목록 조회
export function useSupportedSchools(
  options?: Omit<
    UseQueryOptions<School[], Error, School[], readonly string[]>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: signupKeys.supportedSchools(),
    queryFn: getSupportedSchools,
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
