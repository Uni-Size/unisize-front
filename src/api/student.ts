import { apiClient } from '@/lib/apiClient';
import type { ApiResponse } from './auth';

// ============================================================================
// 학생 등록 관련 타입
// ============================================================================

export interface BodyMeasurements {
  height: number;
  weight: number;
  shoulder: number;
  waist: number;
}

export interface StudentFormData {
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
  body: BodyMeasurements;
  address: string;
  delivery: boolean;
}

interface StudentApiRequest {
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
  body: BodyMeasurements;
  address: string;
  delivery: boolean;
}

export interface RecommendedSizeItem {
  product: string;
  recommended_size: string;
  quantity: number;
  is_selectable?: boolean;
  selectable_with?: string[];
  gender: 'male' | 'female' | 'unisex';
}

export interface AddStudentResponse {
  id: number;
  name: string;
  birth_date: string;
  gender: string;
  student_phone: string;
  guardian_phone: string;
  address: string;
  delivery: boolean;
  privacy_consent: boolean;
  previous_school: string;
  admission_year: number;
  admission_grade: number;
  school_name: string;
  grade: number;
  checked_in_at: string;
  recommended_uniforms?: {
    winter?: RecommendedSizeItem[];
    summer?: RecommendedSizeItem[];
  };
  created_at: string;
  updated_at: string;
}

// ============================================================================
// 학생 등록 API
// ============================================================================

/**
 * 학생 등록
 * POST /api/v1/students/register
 */
export async function addStudent(
  formData: StudentFormData
): Promise<AddStudentResponse> {
  const requestData: StudentApiRequest = {
    previous_school: formData.previousSchool,
    admission_year: formData.admissionYear,
    admission_grade: formData.admissionGrade,
    admission_school: formData.admissionSchool,
    name: formData.name,
    student_phone: formData.studentPhone,
    guardian_phone: formData.guardianPhone,
    birth_date: formData.birthDate,
    gender: formData.gender,
    privacy_consent: formData.privacyConsent,
    body: formData.body,
    address: formData.address,
    delivery: formData.delivery,
  };

  const response = await apiClient.post<ApiResponse<AddStudentResponse>>(
    'api/v1/students/register',
    requestData
  );

  return response.data.data;
}

// ============================================================================
// 유효성 검증 헬퍼 함수
// ============================================================================

/**
 * 전화번호 형식 검증
 */
export function validatePhoneNumber(phoneNumber: string): boolean {
  const phoneRegex = /^\d{3}-\d{4}-\d{4}$/;
  return phoneRegex.test(phoneNumber);
}

/**
 * 생년월일 형식 검증 (YYYY-MM-DD)
 */
export function validateBirthDate(birthDate: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  return dateRegex.test(birthDate);
}
