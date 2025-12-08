import { apiClient } from "@/lib/apiClient";

// 결제 대기 학생 정보
export interface PaymentPendingStudent {
  id: number;
  grade: string;
  school: string;
  student_name: string;
  gender: string;
  student_phone: string;
  parent_phone: string;
  estimated_amount: number;
  reservation_status: string;
  reservation_date: string;
  result_status: string;
  result_date: string;
}

interface PaymentPendingResponse {
  data: {
    students: PaymentPendingStudent[];
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
