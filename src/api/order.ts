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
  inventory_id?: string;
  size: string;
  stock: number;
  ordered: number;
  remaining: number;
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

export interface OrderInventoryResponse {
  school_name: string;
  products: InventoryProduct[];
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
