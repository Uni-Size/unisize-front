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
  product_name: string;
  recommended_size: string;
  supported_quantity: number;
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
  admission_school: string;
  school_name: string;
  class_name: string;
  student_number: string;
  address: string;
  privacy_consent: boolean;
  delivery: boolean;
  student_type: string;
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
  product_id: number;
  item_id: string;
  product_name: string;
  season: string;
  recommended_size: string;
  supported_quantity: number;
  purchase_quantity: number;
  price: number;
  available_sizes: Array<{
    size: string;
    in_stock: boolean;
    stock_count: number;
  }>;
  selectable_with: string[];
  gender: string;
  is_customization_required?: boolean;
  customization?: string;
  is_reserved?: boolean;
  has_name_tag?: boolean;
  name_tag_price?: number | null;
  name_tag_attach_price?: number | null;
  name_tag_min_unit?: number | null;
  name_tag_count?: number;
  name_tag_name?: string;
  name_tag_attach?: boolean;
  delivery_status?: string;
}

export interface SupplyItemResponse {
  product_id: number;
  name: string;
  category?: string;
  season?: string;
  price: number;
  quantity?: number;
  purchase_quantity?: number;
  available_sizes?: { size: string; in_stock: boolean; stock_count: number }[];
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
  signature?: string;
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
  item_id: number;
  name: string;
  season: "동복" | "하복";
  selected_size: string | number;
  purchase_count: number;
  is_reserved?: boolean;
  customization?: string;
  name_tag_count?: number;
  name_tag_name?: string;
  name_tag_attach?: boolean;
}

export interface SupplyOrderItem {
  item_id: number | string;
  name: string;
  selected_size?: string;
  purchase_count: number;
}

export interface MeasurementOrderNameTag {
  order_quantity: number;
  attach_quantity: number;
}

export interface MeasurementOrderRequest {
  uniform_items: MeasurementOrderItem[];
  supply_items: SupplyOrderItem[];
  notes?: string;
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
// 재학생 체크인 API
// ============================================================================

export interface CheckinResponse {
  id: number;
  name: string;
  birth_date: string | null;
  gender: string;
  student_phone: string;
  guardian_phone: string;
  address: string;
  previous_school: string;
  admission_year: number;
  admission_grade: number;
  admission_school: string;
  checked_in_at: string;
  is_eligible_for_public_purchase: boolean;
  is_manually_supported: boolean;
  student_type: string;
  has_confirmed_order: boolean;
  body_measurements: {
    height: number | null;
    weight: number | null;
    shoulder: number | null;
    waist: number | null;
  } | null;
  created_at: string;
  updated_at: string;
}

/**
 * 전화번호로 재학생 체크인
 * POST /api/v1/students/checkin (인증 불필요)
 */
export async function checkinByPhone(
  phone: string,
): Promise<CheckinResponse> {
  const response = await apiClient.post<ApiResponse<CheckinResponse>>(
    '/api/v1/students/checkin',
    { phone },
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

/**
 * 측정 페이지 데이터 조회 (측정 중 재진입)
 * GET /api/v1/students/:id/measurement-page
 */
export async function getMeasurementPage(studentId: number): Promise<StartMeasurementResponse> {
  const response = await apiClient.get<ApiResponse<StartMeasurementResponse>>(
    `/api/v1/students/${studentId}/measurement-page`,
  );
  if (response.data && typeof response.data === 'object' && 'data' in response.data) {
    return (response.data as ApiResponse<StartMeasurementResponse>).data;
  }
  return response.data as StartMeasurementResponse;
}

/**
 * 측정 중인 학생 리스트 조회
 * GET /api/v1/students/measuring
 */
export async function getMeasuringStudents(params?: {
  page?: number;
  limit?: number;
}): Promise<RegisterStudentsResponse> {
  const response = await apiClient.get<RegisterStudentsResponse>(
    "/api/v1/students/measuring",
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
 * POST /api/v1/students/:studentId/finalize-measurement
 */
export async function completeMeasurement(
  studentId: number,
  body: { signature: string },
): Promise<void> {
  await apiClient.post(
    `/api/v1/students/${studentId}/finalize-measurement`,
    body,
  );
}

// ============================================================================
// 학생 목록 조회 (관리자) API
// ============================================================================

export interface AdminOrderItemProduct {
  id: number;
  name: string;
  category: string;
  gender: string;
  season?: string; // W / S / A
  price: number;
  is_repair?: boolean;
  is_repair_required?: boolean;
  created_at?: string;
  updated_at?: string;
}

export type DeliveryStatus =
  | 'pending'
  | 'out_of_stock'
  | 'shipped'
  | 'delivered'
  | 'reserved'
  | 'receipt'
  | 'cancelled';

export interface AdminOrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product?: AdminOrderItemProduct;
  selected_size: string;
  purchase_quantity: number;
  supported_quantity: number;
  unit_price: number;
  subtotal: number;
  name_tag_count: number;
  name_tag_name: string;
  name_tag_attach: boolean;
  name_tag_unit_price?: number;
  name_tag_attach_price?: number;
  delivery_status: DeliveryStatus;
  created_at: string;
}

export type OrderStatus =
  | 'pending'    // 대기중
  | 'confirmed'  // 확인됨
  | 'preparing'  // 준비중
  | 'ready'      // 준비완료
  | 'receive'    // 수령완료
  | 'complete'   // 완료
  | 'cancelled'; // 취소됨

export interface AdminStudentOrder {
  id: number;
  order_number: string;
  student_id: number;
  student?: null;
  total_amount: number;
  order_status: OrderStatus;
  order_status_display: string;
  order_date: string;
  delivery_date: string | null;
  notes: string;
  signature?: string;
  can_cancel_order: boolean;
  can_modify_order: boolean;
  is_order_completed: boolean;
  is_order_cancelled: boolean;
  order_items: AdminOrderItem[];
  created_at: string;
  updated_at: string;
}

export type StudentType = '신입' | '재학' | '전학';

export interface SupportAllowance {
  product_id: number;
  display_name: string;
  total: number;
  used: number;
  remaining: number;
}

export interface AdminStudent {
  id: number;
  name: string;
  birth_date?: string | null;
  gender: string;
  student_phone: string;
  guardian_phone: string;
  address?: string | null;
  previous_school: string;
  admission_year: number;
  admission_grade: number;
  admission_school: string;
  checked_in_at?: string;
  is_eligible_for_public_purchase: boolean;
  is_manually_supported: boolean;
  student_type: StudentType;
  has_confirmed_order: boolean;
  total_name_tag_count?: number;
  body_measurements?: {
    height: number | null;
    weight: number | null;
    shoulder: number | null;
    waist: number | null;
  } | null;
  recommended_uniforms?: {
    winter: RecommendedUniformItem[];
    summer: RecommendedUniformItem[];
  };
  support_allowances?: SupportAllowance[];
  orders?: AdminStudentOrder[];
  // 목록 조회 응답에서만 오는 필드
  school_name?: string;
  student_number?: string;
  grade?: number;
  government_purchase?: boolean;
  created_at: string;
  updated_at: string;
}

export interface GetStudentsParams {
  page?: number;
  limit?: number;
  school?: string;
  grade?: number;
  search?: string;
  student_type?: string;
  public_purchase?: boolean;
}

export interface GetStudentsResponse {
  data: AdminStudent[];
  meta: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

/**
 * 학생 목록 조회
 * GET /api/v1/students
 */
export async function getStudents(
  params?: GetStudentsParams,
): Promise<GetStudentsResponse> {
  const response = await apiClient.get<ApiResponse<{ students: AdminStudent[]; total: number }>>(
    "/api/v1/students",
    { params },
  );
  const { students, total } = response.data.data;
  const limit = params?.limit ?? 10;
  return {
    data: students,
    meta: {
      page: params?.page ?? 1,
      limit,
      total,
      total_pages: Math.ceil(total / limit),
    },
  };
}

export interface CreateStudentRequest {
  name: string;
  admission_year: number;
  admission_grade: number;
  admission_school: string;
  birth_date?: string;
  gender?: string;
  student_phone?: string;
  guardian_phone?: string;
  address?: string;
  delivery?: boolean;
  privacy_consent?: boolean;
  previous_school?: string;
  body?: {
    height?: number;
    weight?: number;
    shoulder?: number;
    waist?: number;
  };
}

/**
 * 학생 추가 (관리자)
 * POST /api/v1/students
 */
export async function createStudent(data: CreateStudentRequest): Promise<AdminStudent> {
  const response = await apiClient.post<ApiResponse<AdminStudent>>("/api/v1/students", data);
  return response.data.data;
}

/**
 * 학생 상세 조회 (주문 기록 포함)
 * GET /api/v1/students/:id
 */
export async function getStudentDetail(id: number): Promise<AdminStudent> {
  const response = await apiClient.get<ApiResponse<AdminStudent>>(`/api/v1/students/${id}`);
  return response.data.data;
}

/**
 * 학생 삭제
 * DELETE /api/v1/students/:id
 */
export async function deleteStudent(id: number): Promise<void> {
  await apiClient.delete<ApiResponse<void>>(`/api/v1/students/${id}`);
}

export interface UpdateStudentRequest {
  name?: string;
  gender?: string;
  birth_date?: string;
  admission_school?: string;
  previous_school?: string;
  admission_year?: number;
  admission_grade?: number;
  phone?: string;
  parent_phone?: string;
  address?: string;
  height?: number;
  weight?: number;
  shoulder?: number;
  waist?: number;

}

/**
 * 학생 정보 수정
 * PUT /api/v1/students/:id
 */
export async function updateStudent(
  id: number,
  data: UpdateStudentRequest,
): Promise<AdminStudent> {
  const response = await apiClient.put<ApiResponse<AdminStudent>>(
    `/api/v1/students/${id}`,
    data,
  );
  return response.data.data;
}

/**
 * 지원 대상 지정/해제
 * PATCH /api/v1/admin/students/:id/support
 */
export async function updateStudentSupport(
  studentId: number,
  supported: boolean,
): Promise<void> {
  await apiClient.patch(`/api/v1/admin/students/${studentId}/support`, {
    supported,
  });
}

// ============================================================================
// 학생 주문 조회 관련 타입 및 API
// ============================================================================

export interface OrderItemProduct {
  id: number;
  name: string;
  season: string;
  price: number;
}

export interface StudentOrderItem {
  id: number;
  orderId: number;
  productId: number;
  size: string;
  quantity: number;
  supportedQuantity: number;
  unitPrice: number;
  subtotal: number;
  customization: string;
  deliveryStatus: string;
  receivedAt: string | null;
  product: OrderItemProduct;
}

export interface StudentOrder {
  id: number;
  orderNumber: string;
  studentId: number;
  totalAmount: number;
  status: string;
  orderType: string;
  orderDate: string;
  notes: string;
  signature: string;
  createdAt: string;
  updatedAt: string;
  orderItems: StudentOrderItem[];
}

export interface StudentOrdersData {
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
  class_name: string;
  student_number: string;
  student_type: string;
  is_eligible_for_public_purchase: boolean;
  has_order: boolean;
  recommended_uniforms: {
    winter: RecommendedUniformItem[];
    summer: RecommendedUniformItem[];
  };
  orders: StudentOrder[];
  created_at: string;
  updated_at: string;
}

/**
 * 학생 주문 정보 조회
 * GET /api/v1/students/:id/orders
 */
export async function getStudentOrders(
  studentId: number,
): Promise<StudentOrdersData> {
  const response = await apiClient.get<ApiResponse<StudentOrdersData>>(
    `/api/v1/students/${studentId}/orders`,
  );
  return response.data.data;
}

// ============================================================================
// 주문 히스토리 관련 타입 및 API
// ============================================================================

export interface OrderHistory {
  changed_at: string;
  description: string;
}

export interface OrderHistoriesData {
  histories: OrderHistory[];
}

/**
 * 주문 히스토리 조회
 * GET /api/v1/orders/:id/history
 */
export async function getOrderHistory(
  orderId: number,
): Promise<OrderHistoriesData> {
  const response = await apiClient.get<ApiResponse<OrderHistoriesData>>(
    `/api/v1/orders/${orderId}/history`,
  );
  return response.data.data;
}

// ============================================================================
// 주문 아이템 수령 처리 API
// ============================================================================

/**
 * 주문 아이템 수령 여부 업데이트
 * PATCH /api/v1/orders/:id/items/:item_id/receive
 */
export async function updateOrderItemReceive(
  orderId: number,
  itemId: number,
  received: boolean,
): Promise<void> {
  await apiClient.patch(`/api/v1/orders/${orderId}/items/${itemId}/receive`, { received });
}

// ============================================================================
// 주문 수정 (관리자) 관련 타입 및 API
// ============================================================================

export interface UpdateOrderUniformItem {
  item_id: string;
  name: string;
  season: string;
  selected_size: number | string;
  purchase_count: number;
  supported_quantity?: number;
  customization?: string;
  is_reserved?: boolean;
  name_tag_count?: number;
  name_tag_name?: string;
  name_tag_attach?: boolean;
}

export interface UpdateOrderSupplyItem {
  item_id: string | number;
  name: string;
  selected_size: string;
  purchase_count: number;
}

export interface UpdateOrderNameTag {
  order_quantity: number;
  attach_quantity: number;
}

export interface UpdateOrderRequest {
  uniform_items: UpdateOrderUniformItem[];
  supply_items: UpdateOrderSupplyItem[];
  notes: string;
  name_tag?: UpdateOrderNameTag;
  order_date?: string;
}

/**
 * 주문 수정 (관리자 전용 엔드포인트)
 * PUT /api/v1/admin/orders/:id
 */
export async function updateAdminOrder(
  orderId: number,
  data: UpdateOrderRequest,
): Promise<void> {
  await apiClient.put(`/api/v1/admin/orders/${orderId}`, data);
}


// ============================================================================
// 전화 주문 관련 타입
// ============================================================================

export interface PhoneOrderItem {
  product_id: number;
  size: string;
  supported_quantity: number;
  extra_quantity: number;
  is_repair: boolean;
  is_reserved: boolean;
  has_name_tag: boolean;
}

export interface PhoneOrderSupplyItem {
  item_id: number;
  name: string;
  selected_size: string;
  purchase_count: number;
}

export interface PhoneOrderRequest {
  name: string;
  admission_school: string;
  admission_year: number;
  admission_grade: number;
  gender?: string;
  birth_date?: string;
  guardian_phone?: string;
  student_phone?: string;
  delivery?: boolean;
  address?: string | null;
  previous_school?: string;
  notes?: string;
  order_items?: PhoneOrderItem[];
  supply_items?: PhoneOrderSupplyItem[];
}

export interface PhoneOrderStudentResult {
  id: number;
  name: string;
  gender: string;
  school_name: string;
  student_type: string;
  is_eligible_for_public_purchase: boolean;
  has_order: boolean;
  orders: unknown[];
  created_at: string;
  updated_at: string;
}

export interface PhoneOrderResult {
  id: number;
  order_number: string;
  total_amount: number;
  status: string;
  item_count: number;
}

export interface PhoneOrderResponse {
  student: PhoneOrderStudentResult;
  order: PhoneOrderResult;
}

// ============================================================================
// 전화 주문 API
// ============================================================================

/**
 * 전화 주문 등록
 * POST /api/v1/students/phone-order
 */
export async function createPhoneOrder(
  data: PhoneOrderRequest,
): Promise<PhoneOrderResponse> {
  const response = await apiClient.post<ApiResponse<PhoneOrderResponse>>(
    "/api/v1/students/phone-order",
    data,
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
