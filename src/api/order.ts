import { apiClient } from "@/lib/apiClient";
import type { ApiResponse } from "./auth";

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

export type OrderInventoryStatus = 'pending' | 'out_of_stock' | 'reserved' | 'receipt' | 'delivered' | 'shipped';

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
