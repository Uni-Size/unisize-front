import { apiClient } from "@/lib/apiClient";
import type { ApiResponse } from "./auth";
import type { AdminOrderItem } from "./student";

export type OrderStatus =
  | 'pending'    // 대기중
  | 'confirmed'  // 확인됨
  | 'preparing'  // 준비중
  | 'ready'      // 준비완료
  | 'receive'    // 수령완료
  | 'complete'   // 완료
  | 'cancelled'; // 취소됨

export type DeliveryStatus =
  | 'pending'      // 출고 대기
  | 'out_of_stock' // 재고 부족
  | 'reserved'     // 예약
  | 'shipped'      // 출고 완료
  | 'delivered'    // 배송 완료
  | 'receipt'      // 수령 완료
  | 'cancelled';   // 취소됨

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending:   '대기중',
  confirmed: '확인됨',
  preparing: '준비중',
  ready:     '준비완료',
  receive:   '수령완료',
  complete:  '완료',
  cancelled: '취소됨',
};

export const DELIVERY_STATUS_LABELS: Record<DeliveryStatus, string> = {
  pending:      '출고 대기',
  out_of_stock: '재고 부족',
  reserved:     '예약',
  shipped:      '출고 완료',
  delivered:    '배송 완료',
  receipt:      '수령 완료',
  cancelled:    '취소됨',
};

// ============================================================================
// 주문 목록 조회 (status 필터)
// ============================================================================

export interface PendingOrderStudent {
  id: string;
  name: string;
  gender: string;
}

export interface PendingOrderItem {
  id: string;
  order_id: string;
  product_id: string;
  size: string;
  quantity: number;
  supported_quantity: number;
  unit_price: number;
  subtotal: number;
  name_tag_count: number;
  name_tag_name: string;
  name_tag_attach: boolean;
  created_at: string;
}

export interface PendingOrder {
  id: string;
  order_number: string;
  student_id: string;
  student: PendingOrderStudent;
  total_amount: number;
  status: OrderStatus;
  status_display: string;
  order_date: string;
  delivery_date: string | null;
  notes: string;
  order_items: PendingOrderItem[];
  can_cancel: boolean;
  can_modify: boolean;
  is_completed: boolean;
  is_cancelled: boolean;
  signature?: string;
  created_at: string;
  updated_at: string;
}

export interface GetOrdersResponse {
  orders: PendingOrder[];
  total: number;
}

export interface GetOrdersParams {
  student_id?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

/**
 * 주문 목록 조회
 * GET /api/v1/orders
 */
export async function getOrders(params?: GetOrdersParams): Promise<{
  orders: PendingOrder[];
  meta: { page: number; limit: number; total: number; total_pages: number };
}> {
  const response = await apiClient.get<ApiResponse<GetOrdersResponse>>(
    "/api/v1/orders",
    { params },
  );
  const { orders, total } = response.data.data;
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 20;
  return {
    orders,
    meta: { page, limit, total, total_pages: Math.ceil(total / limit) },
  };
}

export interface PaymentPendingOrder {
  order_id: string;
  order_number: string;
  student_id: string;
  student_name: string;
  gender: string;
  school_name: string;
  category_summary: string;
  measurement_end_time: string;
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
}

interface PaymentPendingResponse {
  orders: PaymentPendingOrder[];
  total: number;
}

export interface GetPaymentPendingParams {
  page?: number;
  limit?: number;
}

export interface PaymentPendingListResponse {
  orders: PaymentPendingOrder[];
  meta: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

/**
 * 결제 대기자 목록
 * GET /api/v1/admin/payment-pending
 */
export async function getPaymentPendingOrders(
  params?: GetPaymentPendingParams,
): Promise<PaymentPendingListResponse> {
  const response = await apiClient.get<ApiResponse<PaymentPendingResponse>>(
    "/api/v1/admin/payment-pending",
    { params },
  );
  const { orders, total } = response.data.data;
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;
  return {
    orders,
    meta: {
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit),
    },
  };
}

// ============================================================================
// 주문 상세 조회 타입
// ============================================================================

export interface OrderUniformItem {
  item_id: string;
  name: string;
  season: "winter" | "summer";
  selected_size: string;
  supported_quantity: number;
  additional_quantity: number;
  unit_price?: number;
  customization: string;
  reservation: boolean;
  name_tag: number | null;
  name_tag_price?: number | null;
  name_tag_attach_price?: number | null;
}

export interface OrderSupplyItem {
  item_id: string;
  category: string;
  name: string;
  selected_size: string;
  quantity: number;
  unit_price?: number;
}

export interface OrderNameTag {
  order_quantity: number;
  attach_quantity: number;
}

export interface OrderHistoryItem {
  date: string;
  content: string;
}

export interface OrderDetail {
  order_id: string;
  student_id: string;
  student_name: string;
  gender: string;
  admission_school: string;
  previous_school: string;
  class_name: string;
  student_phone: string;
  guardian_phone: string;
  created_at: string;
  registered_date: string;
  last_modified_date: string;
  measurement_dates: string[];
  winter_uniforms: OrderUniformItem[];
  summer_uniforms: OrderUniformItem[];
  supplies: OrderSupplyItem[];
  name_tag: OrderNameTag;
  history: OrderHistoryItem[];
}

/**
 * 주문 상세 조회
 * GET /api/v1/orders/:id
 */
export async function getOrderDetail(orderId: string): Promise<OrderDetail> {
  const response = await apiClient.get<ApiResponse<OrderDetail>>(
    `/api/v1/orders/${orderId}`,
  );
  return response.data.data;
}

export interface StaffOrderUniformItem {
  item_id: string;
  name: string;
  season: string;
  selected_size: number;
  purchase_count: number;
  customization: string;
  has_name_tag?: boolean;
}

export interface StaffOrderSupplyItem {
  item_id: string;
  name: string;
  selected_size: string;
  purchase_count: number;
}

export interface StaffOrderNameTag {
  order_quantity: number;
  attach_quantity: number;
}

export interface UpdateStaffOrderRequest {
  uniform_items: StaffOrderUniformItem[];
  supply_items: StaffOrderSupplyItem[];
  notes: string;
  name_tag?: StaffOrderNameTag;
}

export interface AdminOrderUniformItem {
  item_id: string;
  name: string;
  season: string;
  selected_size: string;
  purchase_count: number;
  delivery_status?: DeliveryStatus;
  customization?: string;
  name_tag_count?: number;
  name_tag_name?: string;
  name_tag_attach?: number;
}

export interface AdminOrderSupplyItem {
  item_id: string | number;
  name: string;
  selected_size: string;
  purchase_count: number;
}

export interface UpdateAdminOrderRequest {
  uniform_items?: AdminOrderUniformItem[];
  supply_items?: AdminOrderSupplyItem[];
  notes?: string;
  order_date?: string;
  name_tag_name?: string;
}

/**
 * 주문 수정 (어드민)
 * PUT /api/v1/admin/orders/:id
 */
export async function updateAdminOrder(
  orderId: string | number,
  data: UpdateAdminOrderRequest,
): Promise<void> {
  await apiClient.put<ApiResponse<void>>(
    `/api/v1/admin/orders/${orderId}`,
    data,
  );
}

/**
 * 주문 수정 (스태프)
 * PUT /api/v1/staff/orders/:id
 */
export async function updateStaffOrder(
  orderId: string,
  data: UpdateStaffOrderRequest,
): Promise<void> {
  await apiClient.put<ApiResponse<void>>(
    `/api/v1/staff/orders/${orderId}`,
    data,
  );
}

// ============================================================================
// 주문 수정 / 상태 변경 (스펙 기반)
// ============================================================================

export interface UpdateOrderItemRequest {
  id: string;
  product_id: string;
  size: string;
  quantity: number;
  unit_price: number;
}

export interface UpdateOrderRequest {
  order_items?: UpdateOrderItemRequest[];
  delivery_date?: string | null;
  notes?: string;
}

/**
 * 주문 수정
 * PUT /api/v1/orders/:id
 */
export async function updateOrder(
  orderId: string,
  data: UpdateOrderRequest,
): Promise<void> {
  await apiClient.put<ApiResponse<void>>(`/api/v1/orders/${orderId}`, data);
}

/**
 * 주문 상태 변경
 * PUT /api/v1/orders/:id/status
 */
export async function updateOrderStatus(
  orderId: string | number,
  status: OrderStatus,
): Promise<void> {
  await apiClient.put<ApiResponse<void>>(`/api/v1/orders/${orderId}/status`, { status });
}

/**
 * 주문 취소
 * POST /api/v1/orders/:id/cancel
 */
export async function cancelOrder(orderId: string): Promise<void> {
  await apiClient.post<ApiResponse<void>>(`/api/v1/orders/${orderId}/cancel`);
}

export interface UpdateDeliveryStatusOptions {
  /** 상태를 바꿀 수량. 생략하면 전량. 품목 수량보다 크면 400 */
  quantity?: number;
  /** 남는 수량이 가질 상태. 생략하면 현재 상태 유지 */
  remainder_status?: DeliveryStatus;
}

export interface UpdateDeliveryStatusResult {
  /** 갱신된 품목들. 주문 조회의 order_items와 동일 shape이라 그대로 교체하면 된다 */
  items: AdminOrderItem[];
  /** 형제 행과 병합되어 사라진 행. 화면에서 제거해야 한다 */
  deleted_item_ids: string[];
}

/**
 * 품목별 출고 상태 변경
 * PUT /api/v1/orders/:id/items/:item_id/delivery-status
 *
 * quantity를 주면 그 수량만 상태가 바뀌고 나머지는 별도 행으로 갈라진다. 원본 ID는
 * 남는 쪽이 유지하고 상태가 바뀐 수량이 새 행이 된다. 같은 (상품, 사이즈, 수선,
 * 상태, 차수) 형제 행이 있으면 서버가 합치므로, 응답의 items로 교체하고
 * deleted_item_ids는 제거해야 화면이 서버와 일치한다.
 *
 * 현재 상태가 receipt인 품목은 관리자만 되돌릴 수 있다(비관리자는 403).
 */
export async function updateItemDeliveryStatus(
  orderId: string,
  itemId: string,
  status: DeliveryStatus,
  options?: UpdateDeliveryStatusOptions,
): Promise<UpdateDeliveryStatusResult> {
  const response = await apiClient.put<ApiResponse<UpdateDeliveryStatusResult>>(
    `/api/v1/orders/${orderId}/items/${itemId}/delivery-status`,
    { delivery_status: status, ...options },
  );
  return response.data.data;
}

/**
 * 학생 ID로 주문 상세 조회
 * GET /api/v1/orders/student/:id
 */
export async function getOrderDetailByStudentId(studentId: string): Promise<OrderDetail> {
  const response = await apiClient.get<ApiResponse<OrderDetail>>(
    `/api/v1/orders/student/${studentId}`,
  );
  return response.data.data;
}

// ============================================================================
// 주문/재고 현황 타입
// ============================================================================

export type OrderInventoryStatus = DeliveryStatus;

export interface InventoryOrder {
  name: string;
  quantity: number;
  status: OrderInventoryStatus;
}

export interface StockRound {
  round_number: number;
  total_in: number;
  orders?: InventoryOrder[];
  unassigned?: InventoryOrder[];
}

export interface InventorySizeStat {
  /** 입고 이력이 한 번도 없는 사이즈 칸은 "". 판정에 쓰지 말고 is_unstocked를 볼 것. */
  inventory_id?: string;
  size: string;
  stock: number;
  ordered: number;
  /**
   * stock - ordered. 음수가 될 수 있으며, 음수는 오류가 아니라 예약 수량이다.
   * (측정 기간에는 재고가 부족해도 주문을 거부하지 않고 전부 예약으로 받는다.)
   */
  remaining: number;
  /** max(0, ordered - stock). 측정 종료 후 추가 발주할 수량. 항상 >= 0. */
  reserved: number;
  /**
   * 입고 이력이 한 번도 없는 사이즈 칸인가.
   * 서버 계약상 is_unstocked === true ⇔ inventory_id === "" ⇔ (stock === 0 && rounds가 비어 있음).
   * 프론트는 stock === 0 같은 암묵적 추론을 하지 말고 이 필드만 본다.
   */
  is_unstocked: boolean;
  /** 이 사이즈의 주문 전체. rounds[]와 같은 주문 라인의 다른 뷰이므로 둘을 더해서 세면 안 된다. */
  orders: InventoryOrder[];
  rounds?: StockRound[];
  unassigned?: InventoryOrder[];
}

export interface InventoryDetail {
  id: string;
  size: string;
  quantity: number;
  rounds: StockRound[];
}

/**
 * 재고 상세 조회 (rounds 포함)
 * GET /api/v1/inventories/:id
 */
export async function getInventoryDetail(inventoryId: string): Promise<InventoryDetail> {
  const response = await apiClient.get<ApiResponse<InventoryDetail>>(
    `/api/v1/inventories/${inventoryId}`,
  );
  return response.data.data;
}

export interface InventoryProduct {
  product_id: string;
  display_name: string;
  category: string;
  season: 'W' | 'S' | 'A';
  size_type?: "numeric" | "alpha" | "free";
  size_stats: InventorySizeStat[];
}

/**
 * 미등록 품목 주문의 사이즈 그룹.
 * 학교 카탈로그(school_uniforms)에 없는 품목이라 재고/잔여 개념 자체가 없다 — 주문만 있다.
 */
export interface UnregisteredSizeGroup {
  size: string;
  orders: InventoryOrder[];
}

/**
 * 학교 품목으로 등록되지 않은 품목에 걸린 주문.
 *
 * 재고 부족(예약) 주문이 아니다. 예약 주문은 products[].size_stats[]의 is_unstocked 칸에 들어간다.
 * 여기 나오는 건 "학교-품목 매핑 누락"이라는 데이터 정합성 경고이고, 필요한 조치도
 * 추가 발주가 아니라 학교 품목 등록이다.
 *
 * 서버 계약: products와 unregistered의 product_id 집합은 서로소이며, 취소되지 않은 모든
 * 주문 라인은 정확히 한쪽에 정확히 한 번만 나타난다. 프론트에서 dedupe하지 말 것
 * (dedupe를 넣으면 서버 버그를 가려서 이중 계상 문제가 재발한다).
 */
export interface UnregisteredProduct {
  product_id: string;
  product_name: string;
  /** school_uniforms가 없으므로 서버가 products.name을 그대로 넣는다. */
  display_name: string;
  category: string;
  gender: string;
  /** Go 쪽이 omitempty라 빈 값이면 아예 오지 않는다. */
  season?: 'W' | 'S' | 'A';
  sizes: UnregisteredSizeGroup[];
}

export interface OrderInventoryResponse {
  school_name: string;
  /** 학교에 등록된 품목. 서버 계약상 절대 null이 아니다(비면 []). */
  products: InventoryProduct[];
  /** 학교에 등록되지 않은 품목의 주문. 서버 계약상 절대 null이 아니다(비면 []). */
  unregistered: UnregisteredProduct[];
}

/**
 * 학교별 주문/재고 현황 조회
 * GET /api/v1/schools/:school_name/order-inventory
 */
export async function getOrderInventory(
  schoolName: string,
  categories?: string[],
): Promise<OrderInventoryResponse> {
  const params = new URLSearchParams();
  categories?.forEach((c) => params.append('category', c));
  const query = params.toString();
  const response = await apiClient.get<ApiResponse<OrderInventoryResponse>>(
    `/api/v1/schools/${encodeURIComponent(schoolName)}/order-inventory${query ? `?${query}` : ''}`,
  );
  return response.data.data;
}

// ============================================================================
// 재고 추가 타입
// ============================================================================

export interface StockUpdateItem {
  product_id: string;
  size: string;
  size_type?: "numeric" | "alpha" | "free";
  stock: number;
  round_number?: number;
}

export interface UpdateStockRequest {
  items: StockUpdateItem[];
}

/**
 * 학교별 품목 재고 업데이트
 * POST /api/v1/schools/:school_name/order-inventory/stock
 */
export async function updateInventoryStock(
  schoolName: string,
  data: UpdateStockRequest,
): Promise<void> {
  await apiClient.post(
    `/api/v1/schools/${encodeURIComponent(schoolName)}/order-inventory/stock`,
    data,
  );
}

// ============================================================================
// 학생 삭제 후 회수/환불 처리 (admin 전용)
// ============================================================================

/** 빈 문자열은 학생 삭제와 무관한 일반 품목이라는 뜻이다. */
export type ReturnStatus = '' | 'pending_review' | 'returned_to_stock' | 'not_refundable';

export interface UpdateReturnStatusResult {
  item_id: string;
  return_status: ReturnStatus;
  /** returned_to_stock일 때만 true — 이때만 재고가 복원된다 */
  stock_restored: boolean;
  refundable_amount: number;
  pending_review_left: number;
  order_status: OrderStatus;
}

/**
 * 회수 여부 확정
 * PATCH /api/v1/admin/orders/:id/items/:item_id/return-status
 *
 * pending_review가 아닌 품목에 호출하면 409.
 */
export async function updateOrderItemReturnStatus(
  orderId: string,
  itemId: string,
  data: { return_status: 'returned_to_stock' | 'not_refundable'; note?: string },
): Promise<UpdateReturnStatusResult> {
  const response = await apiClient.patch<ApiResponse<UpdateReturnStatusResult>>(
    `/api/v1/admin/orders/${orderId}/items/${itemId}/return-status`,
    data,
  );
  return response.data.data;
}

export interface RefundSummaryItem {
  item_id: string;
  product_name: string;
  size: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  delivery_status: DeliveryStatus;
  return_status: ReturnStatus;
  return_status_display: string;
  /** true면 관리자 선택 UI를 띄울 대상 */
  needs_review: boolean;
  refundable: boolean;
}

export interface RefundSummary {
  order_id: string;
  order_number: string;
  order_status: OrderStatus;
  total_amount: number;
  paid_amount: number;
  refunded_amount: number;
  /** 실수령액 - 기환불액으로 상한 처리된 값 */
  refundable_amount: number;
  pending_review_count: number;
  items: RefundSummaryItem[];
}

/**
 * 환불 요약 조회
 * GET /api/v1/admin/orders/:id/refund-summary
 */
export async function getRefundSummary(orderId: string): Promise<RefundSummary> {
  const response = await apiClient.get<ApiResponse<RefundSummary>>(
    `/api/v1/admin/orders/${orderId}/refund-summary`,
  );
  return response.data.data;
}

export type RefundMethod = 'cash' | 'card' | 'transfer';

export interface RefundResult {
  payment_id: string;
  order_id: string;
  amount: number;
  total_refunded: number;
  remaining_paid: number;
  refunded_at: string;
}

/**
 * 환불 기록
 * POST /api/v1/admin/orders/:id/refund
 *
 * amount가 (결제완료합 - 기환불합)을 넘으면 400. 부분환불을 여러 번 나눠 기록할 수 있다.
 */
export async function createOrderRefund(
  orderId: string,
  data: { amount: number; method: RefundMethod; reason: string },
): Promise<RefundResult> {
  const response = await apiClient.post<ApiResponse<RefundResult>>(
    `/api/v1/admin/orders/${orderId}/refund`,
    data,
  );
  return response.data.data;
}
