import { apiClient } from "@/lib/apiClient";

// 결제 대기 주문 정보
export interface PaymentPendingStudent {
  order_id: number;
  order_number: string;
  student_name: string;
  gender: string;
  school_name: string;
  measurement_end_time: string;
  category_summary: string;
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
}

interface PaymentPendingResponse {
  data: {
    orders: PaymentPendingStudent[];
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

// 결제 대기 리스트 조회
export async function getPaymentPendingList(params?: {
  page?: number;
  limit?: number;
}): Promise<PaymentPendingResponse> {
  const response = await apiClient.get<PaymentPendingResponse>(
    "/api/v1/staff/my-payment-pending",
    { params }
  );
  return response.data;
}
