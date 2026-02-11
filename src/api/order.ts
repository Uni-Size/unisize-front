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
export async function getPaymentPendingOrders(): Promise<PaymentPendingOrder[]> {
  const response = await apiClient.get<ApiResponse<PaymentPendingResponse>>(
    "/api/v1/admin/payment-pending"
  );
  return response.data.data.orders;
}
