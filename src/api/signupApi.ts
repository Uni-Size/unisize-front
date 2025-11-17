import { apiClient } from "@/lib/apiClient";
import { getSupportedSchools, type School } from "./schoolApi";
import type { ApiResponse } from "./authApi";

// 학생 등록 요청 타입 (프론트엔드)
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

// API 요청 타입 (백엔드)
interface StudentRegistrationApiRequest {
  previous_school: string;
  admission_year: number;
  admission_grade: number;
  admission_school: string;
  name: string;
  student_phone: string;
  guardian_phone: string;
  birth_date: string;
  gender: string;
  privacy_consent: boolean;
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

// 학생 정보 등록
export async function registerStudent(
  data: StudentRegistrationRequest
): Promise<StudentRegistrationResponse> {
  // camelCase를 snake_case로 변환
  const requestData: StudentRegistrationApiRequest = {
    previous_school: data.previousSchool,
    admission_year: data.admissionYear,
    admission_grade: data.admissionGrade,
    admission_school: data.admissionSchool,
    name: data.name,
    student_phone: data.studentPhone,
    guardian_phone: data.guardianPhone,
    birth_date: data.birthDate,
    gender: data.gender,
    privacy_consent: data.privacyConsent,
    body: data.body,
  };

  const response = await apiClient.post<ApiResponse<StudentRegistrationResponse>>(
    "/api/v1/students/register",
    requestData
  );

  return response.data.data;
}

// 전화번호 형식 검증
export function validatePhoneNumber(phoneNumber: string): boolean {
  const phoneRegex = /^\d{3}-\d{4}-\d{4}$/;
  return phoneRegex.test(phoneNumber);
}

// 생년월일 형식 검증 (YYYY-MM-DD)
export function validateBirthDate(birthDate: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  return dateRegex.test(birthDate);
}

// Re-export getSupportedSchools for convenience
export { getSupportedSchools, type School };
