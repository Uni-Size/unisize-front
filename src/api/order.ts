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

/**
 * 결제 대기자 목록
 * GET /api/v1/admin/payment-pending
 */
export async function getPaymentPendingOrders(): Promise<
  PaymentPendingOrder[]
> {
  const response = await apiClient.get<ApiResponse<PaymentPendingResponse>>(
    "/api/v1/admin/payment-pending",
  );
  return response.data.data.orders;
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
  customization: string;
  reservation: boolean;
  name_tag: number | null;
}

export interface OrderSupplyItem {
  item_id: string;
  category: string;
  name: string;
  selected_size: string;
  quantity: number;
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
