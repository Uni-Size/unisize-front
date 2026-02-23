import { apiClient } from "@/lib/apiClient";
import type { ApiResponse } from "./auth";

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

// ============================================================================
// 학생 리스트 관련 타입
// ============================================================================

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

export interface RegisterStudentsResponse {
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

// ============================================================================
// 측정 관련 타입
// ============================================================================

export interface UniformProduct {
  product_id: number;
  product_name: string;
  category: string;
  gender: "male" | "female" | "unisex";
  price: number;
  recommended_size: string;
  available_sizes: string[];
  alternative_product_names: string[];
  is_custom_detail_required: boolean;
  free_quantity: number;
}

export interface RecommendedUniformItem {
  product: string;
  recommended_size: string;
  supported_quantity: number;
  quantity: number;
  price: number;
  available_sizes: Array<{
    size: string;
    in_stock: boolean;
    stock_count: number;
  }>;
  selectable_with?: string[];
  gender: "male" | "female" | "unisex";
  is_customization_required?: boolean;
  customization?: string;
}

export interface SupplyItemResponse {
  product_id: number;
  name: string;
  category: string;
  season: string;
  price: number;
  quantity: number;
}

export interface StartMeasurementResponse {
  student_id: number;
  student_name: string;
  from_school: string;
  to_school: string;
  parent_phone: string;
  school_deadline: string;
  body_measurements: {
    height: number;
    weight: number;
    shoulder: number;
    waist: number;
  };
  uniform_products: UniformProduct[];
  accessory_products: UniformProduct[] | null;
  recommended_uniforms?: {
    winter: RecommendedUniformItem[];
    summer: RecommendedUniformItem[];
    all?: RecommendedUniformItem[];
  };
  supply_items?: SupplyItemResponse[];
  registered_at: string | null;
  measurement_start_at: string | null;
  measurement_end_at: string | null;
}

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
  measurement_end_at: null | string;
  measurement_start_at: null | string;
  registered_at: null | string;
  deadline?: string;
}

// ============================================================================
// 주문 관련 타입
// ============================================================================

export interface CompleteMeasurementRequest {
  notes: string;
  signature: string;
}

export interface MeasurementOrderItem {
  item_id: string;
  name: string;
  season: "winter" | "summer" | "all";
  selected_size: number;
  customization: string;
  purchase_count: number;
}

export interface SupplyOrderItem {
  item_id: number;
  name: string;
  selected_size: string;
  purchase_count: number;
}

export interface MeasurementOrderRequest {
  uniform_items: MeasurementOrderItem[];
  supply_items: SupplyOrderItem[];
}

// ============================================================================
// 학생 등록 API
// ============================================================================

/**
 * 학생 등록
 * POST /api/v1/students/register
 */
export async function addStudent(
  formData: StudentFormData,
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
    "api/v1/students/register",
    requestData,
  );

  return response.data.data;
}

// ============================================================================
// 학생 리스트 조회 API
// ============================================================================

/**
 * 대기 리스트 조회
 * GET /api/v1/students/pending-measurements
 */
export async function getRegisterStudents(params?: {
  page?: number;
  limit?: number;
}): Promise<RegisterStudentsResponse> {
  const response = await apiClient.get<RegisterStudentsResponse>(
    "/api/v1/students/pending-measurements",
    { params },
  );
  return response.data;
}

// ============================================================================
// 측정 관련 API
// ============================================================================

/**
 * 측정 시작
 * POST /api/v1/students/:studentId/start-measurement
 */
export async function startMeasurement(
  studentId: number,
): Promise<StartMeasurementResponse> {
  const response = await apiClient.post<ApiResponse<StartMeasurementResponse>>(
    `/api/v1/students/${studentId}/start-measurement`,
  );

  if (
    response.data &&
    typeof response.data === "object" &&
    "data" in response.data
  ) {
    return (response.data as ApiResponse<StartMeasurementResponse>).data;
  }

  return response.data as StartMeasurementResponse;
}

/**
 * 측정 주문 저장
 * POST /api/v1/students/:studentId/measurement-order
 */
export async function submitMeasurementOrder(
  studentId: number,
  orderData: MeasurementOrderRequest,
): Promise<void> {
  await apiClient.post(
    `/api/v1/students/${studentId}/measurement-order`,
    orderData,
  );
}

/**
 * 측정 완료
 * POST /api/v1/students/:studentId/complete-measurement
 */
export async function completeMeasurement(
  studentId: number,
  orderData: CompleteMeasurementRequest,
): Promise<void> {
  await apiClient.post(
    `/api/v1/students/${studentId}/complete-measurement`,
    orderData,
  );
}

// ============================================================================
// 학생 목록 조회 (관리자) API
// ============================================================================

export interface AdminStudent {
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
  government_purchase: boolean;
  created_at: string;
  updated_at: string;
}

export interface GetStudentsParams {
  page?: number;
  limit?: number;
  school?: string;
  grade?: number;
  search?: string;
}

export interface GetStudentsResponse {
  data: AdminStudent[];
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

/**
 * 학생 목록 조회
 * GET /api/v1/students
 */
export async function getStudents(
  params?: GetStudentsParams,
): Promise<GetStudentsResponse> {
  const response = await apiClient.get<GetStudentsResponse>(
    "/api/v1/students",
    { params },
  );
  return response.data;
}

/**
 * 학생 상세 조회
 * GET /api/v1/admin/students/:id
 */
export async function getStudentDetail(id: number): Promise<AdminStudent> {
  const response = await apiClient.get<ApiResponse<AdminStudent>>(
    `/api/v1/admin/students/${id}`,
  );
  return response.data.data;
}

/**
 * 학생 삭제
 * DELETE /api/v1/admin/students/:id
 */
export async function deleteStudent(id: number): Promise<void> {
  await apiClient.delete<ApiResponse<void>>(`/api/v1/admin/students/${id}`);
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
