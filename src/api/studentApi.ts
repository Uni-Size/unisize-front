import { apiClient } from "@/lib/apiClient";

interface BodyMeasurements {
  height: number;
  weight: number;
  shoulder: number;
  waist: number;
}

interface StudentFormData {
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

// addStudent 응답 데이터
export interface RecommendedSizeItem {
  product: string;
  recommended_size: string;
  quantity: number;
  is_selectable?: boolean; // deprecated, 호환성을 위해 유지
  selectable_with?: string[];
  gender: "male" | "female" | "unisex";
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

// 대기 리스트 학생 정보
export interface RegisterStudent {
  id: number;
  name: string;
  gender: string;
  birth_date: string;
  student_phone: string;
  guardian_phone: string;
  previous_school: string;
  admission_year: number;
  admission_grade: number;
  school_name: string;
  class_name: string;
  student_number: string;
  address: string;
  privacy_consent: boolean;
  delivery: boolean;
  grade: number;
  checked_in_at: string;
  created_at: string;
  updated_at: string;
}

interface RegisterStudentsResponse {
  data: {
    students: RegisterStudent[];
    total: number;
  };
  meta: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  success: boolean;
  error?: {
    code: string;
    message: string;
    details: string;
  };
}

// 대기 리스트 조회
export async function getRegisterStudents(params?: {
  page?: number;
  limit?: number;
}): Promise<RegisterStudentsResponse> {
  const response = await apiClient.get<RegisterStudentsResponse>(
    "/api/v1/students/pending-measurements",
    { params }
  );
  return response.data;
}

// API 응답 래퍼 타입
interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// 측정 데이터 응답
export interface StudentMeasurementData {
  id: number;
  name: string;
  gender: string;
  birth_date: string;
  student_phone: string;
  guardian_phone: string;
  previous_school: string;
  admission_year: number;
  admission_grade: number;
  school_name: string;
  address: string;
  delivery: boolean;
  body: {
    height: number;
    weight: number;
    shoulder: number;
    waist: number;
  };
  timestamps?: {
    reservation?: string;
    reception?: string;
    measurement_start?: string;
    measurement_complete?: string;
  };
  deadline?: string;
}

// 측정 시작
export async function startMeasurement(studentId: number): Promise<void> {
  await apiClient.post(`/api/v1/students/${studentId}/start-measurement`);
}

// 학생 측정 데이터 조회
export async function getStartMeasurement(
  studentId: number
): Promise<StudentMeasurementData> {
  const response = await apiClient.get<ApiResponse<StudentMeasurementData>>(
    `/api/v1/students/${studentId}`
  );
  return response.data.data;
}

// 학생 생성
export async function addStudent(
  formData: StudentFormData
): Promise<AddStudentResponse> {
  const startTime = performance.now();

  // camelCase를 snake_case로 변환
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
    "api/v1/students/register",
    requestData
  );

  const endTime = performance.now();
  const responseTime = Math.round(endTime - startTime);

  console.log("응답 시간:", `${responseTime}ms`);

  // API 응답이 { success: true, data: {...} } 형식이므로 data만 반환
  return response.data.data;
}
