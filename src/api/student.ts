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
  isManuallySupported?: boolean;
}

// dev 사이트 등록에서 신체 정보를 생략할 수 있어, 등록 요청의 body는 각 항목이 선택적이다
// (0은 "입력 안 함"을 의미하며 백엔드에 아예 보내지 않아야 optional 처리된다)
interface StudentApiRequestBody {
  height?: number;
  weight?: number;
  shoulder?: number;
  waist?: number;
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
  body: StudentApiRequestBody;
  address: string;
  delivery: boolean;
  is_manually_supported?: boolean;
}

export interface RecommendedSizeItem {
  product_name: string;
  category?: string;
  recommended_size: string;
  supported_quantity: number;
  is_selectable?: boolean;
  selectable_with?: string[];
  gender: "M" | "F" | "U";
}

export interface AddStudentResponse {
  id: string;
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
  is_eligible_for_public_purchase?: boolean;
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
  id: string;
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
  product_id: string;
  product_name: string;
  category: string;
  season?: string; // "W"(동복) | "S"(하복)
  gender: "male" | "female" | "unisex";
  price: number;
  recommended_size: string;
  available_sizes: string[];
  alternative_product_names: string[];
  is_custom_detail_required: boolean;
  free_quantity: number;
}

export interface RecommendedUniformItem {
  product_id: string;
  item_id: string;
  product_name: string;
  category?: string;
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
  name_tag_count?: number;
  name_tag_name?: string;
  name_tag_attach?: boolean;
  delivery_status?: string;
}

export interface SupplyItemResponse {
  product_id: string;
  name: string;
  category?: string;
  season?: string;
  price: number;
  quantity?: number;
  purchase_quantity?: number;
  available_sizes?: { size: string; in_stock: boolean; stock_count: number }[];
}

// 측정 화면(바텀시트)용 통합 품목 카탈로그 항목. 학교의 해당 시즌 전체 품목을
// 성별 무관하게 담고 있으며, supported_quantity는 이 학생 기준 무상지원 가능
// 개수다. selectable_with로 묶인 그룹(예: 치마/바지)의 모든 멤버는 항상 동일한
// supported_quantity 값을 가지도록 백엔드가 보장한다(CreateMeasurementOrder와
// 동일한 계산 규칙 재사용) — 프론트에서 그룹 지원개수를 별도로 계산/가정할
// 필요가 없다. 백엔드 합의: recommended_uniforms/uniform_products를 완전히
// 대체하는 단일 진실 소스.
export interface CatalogUniformItem {
  product_id: string;
  item_id: string;
  product_name: string;
  category?: string;
  season: string; // "W" | "S"
  gender: string; // 상품 자체의 등록 성별("M"|"F"|"U") — 학생 성별과 다를 수 있음
  price: number;
  recommended_size: string;
  available_sizes: Array<{
    size: string;
    in_stock: boolean;
    stock_count: number;
  }>;
  supported_quantity: number;
  purchase_quantity: number;
  selectable_with?: string[];
  is_customization_required?: boolean;
  customization?: string;
  is_reserved?: boolean;
  name_tag_count?: number;
  name_tag_attach?: boolean;
  // 임시저장/확정 주문에 이 품목이 실제로 저장돼 있으면 true. selectable_with
  // 그룹은 항상 한 멤버만 실제로 저장되므로, 대표 행을 고를 때 성별 추정보다
  // 이 값을 우선해야 저장된 교체 선택(예: 치마→바지)이 재조회 시 유지된다.
  is_selected?: boolean;
}

export interface StartMeasurementResponse {
  student_id: string;
  student_name: string;
  from_school: string;
  to_school: string;
  parent_phone: string;
  school_deadline: string;
  name_tag_service?: {
    available: boolean;
    unit_price: number;
    attach_price: number;
    min_unit: number;
  };
  name_tag_name?: string;
  body_measurements: {
    height: number;
    weight: number;
    shoulder: number;
    waist: number;
  };
  accessory_products: UniformProduct[] | null;
  catalog_uniforms: {
    winter: CatalogUniformItem[];
    summer: CatalogUniformItem[];
  };
  supply_items?: SupplyItemResponse[];
  registered_at: string | null;
  measurement_start_at: string | null;
  measurement_end_at: string | null;
  signature?: string;
}

export interface StudentMeasurementData {
  id: string;
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
  uniform_items: MeasurementOrderItem[];
  supply_items: SupplyOrderItem[];
  notes?: string;
  signature: string;
}

export interface MeasurementOrderItem {
  item_id: string | number;
  name: string;
  season: "동복" | "하복";
  selected_size: string | number;
  purchase_count: number;
  is_reserved?: boolean;
  customization?: string;
  name_tag_count?: number;
  name_tag_attach?: number;
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
  name_tag_name?: string;
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
  // 0은 "입력 안 함"이므로 요청에서 아예 제외한다 (dev 사이트에서 생략된 항목)
  const { height, weight, shoulder, waist } = formData.body;
  const body: StudentApiRequestBody = {
    height: height > 0 ? height : undefined,
    weight: weight > 0 ? weight : undefined,
    shoulder: shoulder > 0 ? shoulder : undefined,
    waist: waist > 0 ? waist : undefined,
  };

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
    body,
    address: formData.address,
    delivery: formData.delivery,
    is_manually_supported: formData.isManuallySupported,
  };

  const response = await apiClient.post<ApiResponse<AddStudentResponse>>(
    "/api/v1/students/register",
    requestData,
  );

  return response.data.data;
}

// ============================================================================
// 재학생 체크인 API
// ============================================================================

export interface CheckinResponse {
  id: string;
  measurement_id: string | null;
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
  school_name: string;
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
  recommended_uniforms?: {
    winter?: RecommendedSizeItem[];
    summer?: RecommendedSizeItem[];
  };
  created_at: string;
  updated_at: string;
}

/**
 * 신체 측정값 수정
 * PUT /api/v1/measurements/:id
 */
export async function updateMeasurement(
  measurementId: string,
  body: { height: number; weight: number; shoulder_width: number; waist: number },
): Promise<void> {
  await apiClient.put(`/api/v1/measurements/${measurementId}`, body);
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
export async function getMeasurementPage(studentId: string): Promise<StartMeasurementResponse> {
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
  studentId: string,
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
  studentId: string | number,
  orderData: MeasurementOrderRequest,
): Promise<AdminStudentOrder> {
  const response = await apiClient.post<ApiResponse<AdminStudentOrder>>(
    `/api/v1/students/${studentId}/measurement-order`,
    orderData,
  );
  return response.data.data;
}

// ----------------------------------------------------------------------
// 측정 완료(확정) 응답 — A6 인쇄 인보이스에 필요한 필드를 포함한다.
// backend-dev(order_service.go/models/order.go 실제 코드 확인 완료)와 확정한 계약.
// 기존 order_items 배열 구조를 그대로 유지하고(별도 uniform_items/supply_items
// 분리 없음), 각 항목의 item_group("W"|"S"|"supply")으로 동복/하복/용품을
// 클라이언트에서 분류한다. 아직 서버에 실제 배포되지는 않았다는 안내를
// 받았으므로, 배포 후 실제 응답과 다르면 이 타입들과 invoiceMapper의 매핑을
// 함께 갱신해야 한다.
// ----------------------------------------------------------------------

export interface FinalizeMeasurementProduct {
  id: string;
  name: string;
  category: string;
  season: string; // "W" | "S" | 드물게 "A"
  price: number;
}

export interface FinalizeMeasurementOrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product: FinalizeMeasurementProduct;
  selected_size: string;
  purchase_quantity: number; // 총수량(지원+추가)
  supported_quantity: number; // 지원수량
  additional_quantity: number; // 추가수량 = purchase_quantity - supported_quantity
  unit_price: number;
  subtotal: number;
  customization: string; // 수선
  item_group: 'W' | 'S' | 'supply'; // 동복 / 하복 / 용품
  name_tag_count: number; // 명찰 배정 개수
  name_tag_attach: boolean; // 부착 서비스 구매 여부(배치 단위, 부분 수량 없음)
  name_tag_attach_count: number; // name_tag_count면 attach=true, 아니면 0
  delivery_status: DeliveryStatus;
  is_reserved: boolean; // true→예약, false(=delivery_status "receipt")→수령
  created_at: string;
}

export interface FinalizeMeasurementStudent {
  id: string;
  name: string;
  gender: string;
  student_phone: string;
  guardian_phone: string;
  admission_school: string; // 입학학교
  previous_school: string; // 출신학교
}

export interface FinalizeMeasurementResponse {
  id: string;
  order_number: string;
  student_id: string;
  student: FinalizeMeasurementStudent;
  total_amount: number; // 총결제대금
  order_status: string;
  order_status_display: string;
  order_date: string;
  notes: string;
  total_name_tag_count: number;
  total_name_tag_attach_count: number;
  seller_name?: string; // 판매자 (백엔드 조회 실패 시 키 자체가 없을 수 있음)
  winter_subtotal: number;
  summer_subtotal: number;
  name_tag_subtotal: number;
  signature: string;
  order_items: FinalizeMeasurementOrderItem[];
  created_at: string;
  updated_at: string;
}

/**
 * 측정 완료
 * POST /api/v1/students/:studentId/finalize-measurement
 */
export async function completeMeasurement(
  studentId: string,
  body: { signature: string },
): Promise<FinalizeMeasurementResponse> {
  const response = await apiClient.post<ApiResponse<FinalizeMeasurementResponse>>(
    `/api/v1/students/${studentId}/finalize-measurement`,
    body,
  );

  if (
    response.data &&
    typeof response.data === "object" &&
    "data" in response.data
  ) {
    return (response.data as ApiResponse<FinalizeMeasurementResponse>).data;
  }

  return response.data as unknown as FinalizeMeasurementResponse;
}

// ============================================================================
// 학생 목록 조회 (관리자) API
// ============================================================================

export interface AdminOrderItemProduct {
  id: string;
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
  id: string;
  order_id: string;
  product_id: string;
  product?: AdminOrderItemProduct;
  selected_size: string;
  purchase_quantity: number;
  supported_quantity: number;
  unit_price: number;
  subtotal: number;
  name_tag_count: number;
  name_tag_attach: boolean;
  /**
   * 부착 개수. 부착이면 name_tag_count 전체, 아니면 0.
   * purchase_quantity로 유추하면 안 된다 — 품목이 여러 행으로 분리됐을 때
   * 행마다 자기 수량으로 계산해 부착비가 중복 집계된다.
   */
  name_tag_attach_count?: number;
  customization?: string;
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
  id: string;
  order_number: string;
  student_id: string;
  student?: null;
  total_amount: number;
  order_status: OrderStatus;
  order_status_display: string;
  order_date: string;
  delivery_date: string | null;
  notes: string;
  signature?: string;
  name_tag_service?: {
    available: boolean;
    unit_price: number;
    attach_price: number;
    min_unit: number;
  };
  name_tag_name?: string;
  total_name_tag_count?: number;
  order_items: AdminOrderItem[];
  created_at: string;
  updated_at: string;
}

export type StudentType = '신입' | '재학' | '전학';

export interface SupportAllowance {
  product_id: string;
  display_name: string;
  total: number;
  used: number;
  remaining: number;
  selectable_with?: { product_id: string; display_name: string }[];
}

export interface AdminStudent {
  id: string;
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
    all?: RecommendedUniformItem[];
  };
  support_allowances?: SupportAllowance[];
  name_tag_service?: {
    available: boolean;
    unit_price: number;
    attach_price: number;
    min_unit: number;
  };
  name_tag_name?: string;
  orders?: AdminStudentOrder[];
  // 목록 조회 응답에서만 오는 필드
  school_name?: string;
  student_number?: string;
  grade?: number;
  government_purchase?: boolean;
  is_deleted: boolean;
  /** RFC3339라 파싱 가능. 같은 응답의 created_at/updated_at은 한국어 문자열이라 파싱되지 않는다 */
  deleted_at?: string;
  delete_reason?: string;
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
  /** 삭제된 학생 포함 */
  include_deleted?: boolean;
  /** 삭제된 학생만. true면 include_deleted는 붙이지 않아도 된다 */
  deleted_only?: boolean;
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
  name_tag_name?: string;
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
export async function getStudentDetail(
  id: string | number,
  options?: { includeDeleted?: boolean },
): Promise<AdminStudent> {
  const response = await apiClient.get<ApiResponse<AdminStudent>>(`/api/v1/students/${id}`, {
    params: options?.includeDeleted ? { include_deleted: true } : undefined,
  });
  return response.data.data;
}

export interface DeleteStudentResult {
  student_id: string;
  deleted_at: string;
  reason: string;
  /** 미출고라 자동 취소된 품목 수 */
  cancelled_item_count: number;
  /** 이미 출고돼 회수/환불 확인이 필요한 품목 수 */
  pending_review_item_count: number;
  affected_order_ids: string[];
}

/**
 * 학생 삭제
 * DELETE /api/v1/students/:id
 *
 * reason은 필수(1~255자)라 생략하면 서버가 400을 낸다. 프리셋과 자유입력을
 * 합친 한 문자열을 넘긴다.
 */
export async function deleteStudent(id: string, reason: string): Promise<DeleteStudentResult> {
  const response = await apiClient.delete<ApiResponse<DeleteStudentResult>>(
    `/api/v1/students/${id}`,
    { data: { reason } },
  );
  return response.data.data;
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
  address?: string | null;
  name_tag_name?: string;
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
  id: string | number,
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
  studentId: string | number,
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
  id: string;
  name: string;
  season: string;
  price: number;
}

export interface StudentOrderItem {
  id: string;
  orderId: string;
  productId: string;
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
  id: string;
  orderNumber: string;
  studentId: string;
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
  id: string;
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
  studentId: string,
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
  id: string;
  orderId: string;
  changedById: string;
  action: string;
  fieldName: string | null;
  oldValue: string | null;
  newValue: string | null;
  reason: string | null;
  createdAt: string;
  changedBy?: {
    id: string;
    employeeId: string;
    employeeName: string;
    role: string;
  };
}

export interface OrderHistoriesData {
  histories: OrderHistory[];
  total: number;
}

/**
 * 주문 히스토리 조회
 * GET /api/v1/orders/:id/history
 */
export async function getOrderHistory(
  orderId: string | number,
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
  orderId: string,
  itemId: string,
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
  orderId: string | number,
  data: UpdateOrderRequest,
): Promise<void> {
  await apiClient.put(`/api/v1/admin/orders/${orderId}`, data);
}


// ============================================================================
// 전화 주문 관련 타입
// ============================================================================

export interface PhoneOrderItem {
  product_id: string;
  size: string;
  supported_quantity: number;
  extra_quantity: number;
  is_repair: boolean;
  is_reserved: boolean;
  has_name_tag: boolean;
}

export interface PhoneOrderSupplyItem {
  item_id: string;
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
  id: string;
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
  id: string;
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

// ============================================================================
// 학생 감사 로그 (히스토리)
// ============================================================================

export type AuditAction =
  | 'student.create'
  | 'student.update'
  | 'student.delete'
  | 'student.checkin'
  | 'support.set'
  | 'measurement.start'
  | 'measurement.complete'
  | 'measurement.update'
  | 'order.create'
  | 'order.update'
  | 'order.finalize'
  | 'order.delete';

export interface AuditLog {
  id: string;
  student_id: string;
  actor: {
    id: string;
    employee_id: string;
    employee_name: string;
  } | null;
  action: AuditAction;
  diff: {
    field: string;
    before: unknown;
    after: unknown;
  }[] | null;
  meta: unknown | null;
  memo: string;
  created_at: string;
}

/**
 * action === 'student.delete'인 항목의 meta 형태.
 * AuditLog.meta가 unknown이라 키를 잘못 써도 컴파일에 안 걸리므로 이 타입으로 좁혀 쓴다.
 * 이 항목의 memo가 곧 삭제 사유이고, actor.employee_name이 삭제 처리자다.
 */
export interface StudentDeleteAuditMeta {
  cancelled_item_count: number;
  pending_review_item_count: number;
}

export interface AuditLogMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface AuditLogResponse {
  data: AuditLog[];
  meta: AuditLogMeta;
}

export async function getStudentAuditLogs(
  studentId: string,
  params?: { page?: number; limit?: number },
): Promise<AuditLogResponse> {
  const response = await apiClient.get<{ success: boolean; data: AuditLog[]; meta: AuditLogMeta }>(
    `/api/v1/students/${studentId}/audit-logs`,
    { params },
  );
  return { data: response.data.data, meta: response.data.meta };
}
