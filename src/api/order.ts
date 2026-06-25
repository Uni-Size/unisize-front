import { apiClient } from "@/lib/apiClient";
import type { ApiResponse } from "./auth";

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
  id: number;
  name: string;
  gender: string;
}

export interface PendingOrderItem {
  id: number;
  order_id: number;
  product_id: number;
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
  id: number;
  order_number: string;
  student_id: number;
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
  student_id?: number;
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
  order_id: number;
  order_number: string;
  student_id: number;
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
  has_name_tag?: boolean;
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
  order_id: number;
  student_id: number;
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
export async function getOrderDetail(orderId: number): Promise<OrderDetail> {
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
  item_id: number;
  name: string;
  season: string;
  selected_size: string;
  purchase_count: number;
  is_reserved: boolean;
  customization: string;
  name_tag_count: number;
  name_tag_name: string;
  name_tag_attach: boolean;
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
}

/**
 * 주문 수정 (어드민)
 * PUT /api/v1/admin/orders/:id
 */
export async function updateAdminOrder(
  orderId: number,
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
  orderId: number,
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
  id: number;
  product_id: number;
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
  orderId: number,
  data: UpdateOrderRequest,
): Promise<void> {
  await apiClient.put<ApiResponse<void>>(`/api/v1/orders/${orderId}`, data);
}

/**
 * 주문 상태 변경
 * PUT /api/v1/orders/:id/status
 */
export async function updateOrderStatus(
  orderId: number,
  status: OrderStatus,
): Promise<void> {
  await apiClient.put<ApiResponse<void>>(`/api/v1/orders/${orderId}/status`, { status });
}

/**
 * 주문 취소
 * POST /api/v1/orders/:id/cancel
 */
export async function cancelOrder(orderId: number): Promise<void> {
  await apiClient.post<ApiResponse<void>>(`/api/v1/orders/${orderId}/cancel`);
}

/**
 * 품목별 출고 상태 변경
 * PUT /api/v1/orders/:id/items/:item_id/delivery-status
 */
export async function updateItemDeliveryStatus(
  orderId: number,
  itemId: number,
  status: DeliveryStatus,
): Promise<void> {
  await apiClient.put<ApiResponse<void>>(
    `/api/v1/orders/${orderId}/items/${itemId}/delivery-status`,
    { status },
  );
}

/**
 * 학생 ID로 주문 상세 조회
 * GET /api/v1/orders/student/:id
 */
export async function getOrderDetailByStudentId(studentId: number): Promise<OrderDetail> {
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
  status: OrderInventoryStatus;
}

export interface StockRound {
  round_number: number;
  total_in: number;
}

export interface InventorySizeStat {
  inventory_id?: number;
  size: string;
  stock: number;
  ordered: number;
  remaining: number;
  orders: InventoryOrder[];
  rounds?: StockRound[];
}

export interface InventoryDetail {
  id: number;
  size: string;
  quantity: number;
  rounds: StockRound[];
}

/**
 * 재고 상세 조회 (rounds 포함)
 * GET /api/v1/inventories/:id
 */
export async function getInventoryDetail(inventoryId: number): Promise<InventoryDetail> {
  const response = await apiClient.get<ApiResponse<InventoryDetail>>(
    `/api/v1/inventories/${inventoryId}`,
  );
  return response.data.data;
}

export interface InventoryProduct {
  product_id: number;
  display_name: string;
  category: string;
  season: 'W' | 'S';
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
  product_id: number;
  size: string;
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
