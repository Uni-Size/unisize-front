import { apiClient } from "@/lib/apiClient";
import type { ApiResponse } from "./auth";
import type { StartMeasurementResponse } from "./student";

// ============================================================================
// 결제 대기 관련 타입
// ============================================================================

export interface PaymentPendingStudent {
  order_id: number;
  order_number: string;
  student_id: number;
  student_name: string;
  gender: string;
  school_name: string;
  school: string;
  grade: string;
  student_phone: string;
  parent_phone: string;
  measurement_end_time: string;
  category_summary: string;
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  estimated_amount: number;
  reservation_status: string;
  reservation_date: string;
  result_status: string;
  result_date: string;
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

// ============================================================================
// Staff 주문 관련 타입
// ============================================================================

export interface StaffOrderDetailResponse {
  order_id: number;
  order_number: string;
  status: string;
  student: {
    id: number;
    name: string;
    gender: string;
    school_name: string;
    phone: string;
    parent_phone: string;
  };
  body_measurements: {
    height: number;
    weight: number;
    shoulder: number;
    waist: number;
  };
  uniform_items: {
    winter: Array<{
      product_name: string;
      size: string;
      quantity: number;
      supported_quantity: number;
      unit_price: number;
      subtotal: number;
      customization: string;
    }>;
    summer: Array<{
      product_name: string;
      size: string;
      quantity: number;
      supported_quantity: number;
      unit_price: number;
      subtotal: number;
      customization: string;
    }>;
  };
  supply_items: Array<{
    product_name: string;
    size: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
  }>;
  total_amount: number;
  paid_amount: number;
  signature: string;
  order_date: string;
  measurement_end_time: string;
  school_deadline: string;
  created_at: string;
}

export interface UpdateStaffOrderRequest {
  notes?: string;
  uniform_items: Array<{
    item_id: number;
    name: string;
    season: string;
    selected_size: number;
    customization: string;
    purchase_count: number;
  }>;
  supply_items: Array<{
    item_id: number;
    name: string;
    selected_size: string;
    purchase_count: number;
  }>;
}

// ============================================================================
// 결제 대기 리스트 API
// ============================================================================

/**
 * 결제 대기 리스트 조회
 * GET /api/v1/staff/my-payment-pending
 */
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

// ============================================================================
// Staff 주문 관련 API
// ============================================================================

/**
 * Staff 주문 상세 조회
 * GET /api/v1/staff/orders/:orderId
 */
export async function getStaffOrderDetail(
  orderId: number
): Promise<StartMeasurementResponse> {
  const response = await apiClient.get<ApiResponse<StaffOrderDetailResponse>>(
    `/api/v1/staff/orders/${orderId}`
  );

  const orderDetail =
    response.data &&
    typeof response.data === "object" &&
    "data" in response.data
      ? (response.data as ApiResponse<StaffOrderDetailResponse>).data
      : (response.data as StaffOrderDetailResponse);

  // StaffOrderDetailResponse를 StartMeasurementResponse 형식으로 변환
  const convertedResponse: StartMeasurementResponse = {
    student_id: orderDetail.student.id,
    student_name: orderDetail.student.name,
    from_school: "",
    to_school: orderDetail.student.school_name,
    parent_phone: orderDetail.student.parent_phone,
    school_deadline: orderDetail.school_deadline,
    body_measurements: orderDetail.body_measurements,
    uniform_products: [],
    accessory_products: null,
    recommended_uniforms: {
      winter:
        orderDetail.uniform_items.winter?.map((item) => ({
          product: item.product_name,
          recommended_size: item.size,
          supported_quantity: item.supported_quantity,
          quantity: item.quantity + item.supported_quantity,
          price: item.unit_price,
          available_sizes: [
            {
              size: item.size,
              in_stock: true,
              stock_count: 999,
            },
          ],
          selectable_with: [],
          gender:
            orderDetail.student.gender === "M"
              ? ("male" as const)
              : ("female" as const),
          is_customization_required: item.customization ? true : false,
          customization: item.customization || "",
        })) || [],
      summer:
        orderDetail.uniform_items.summer?.map((item) => ({
          product: item.product_name,
          recommended_size: item.size,
          supported_quantity: item.supported_quantity,
          quantity: item.quantity + item.supported_quantity,
          price: item.unit_price,
          available_sizes: [
            {
              size: item.size,
              in_stock: true,
              stock_count: 999,
            },
          ],
          selectable_with: [],
          gender:
            orderDetail.student.gender === "M"
              ? ("male" as const)
              : ("female" as const),
          is_customization_required: item.customization ? true : false,
          customization: item.customization || "",
        })) || [],
    },
    supply_items:
      orderDetail.supply_items?.map((item) => ({
        product_id: 0,
        name: item.product_name,
        category: "",
        season: "",
        price: item.unit_price,
        quantity: item.quantity,
      })) || [],
    registered_at: orderDetail.created_at,
    measurement_start_at: orderDetail.order_date,
    measurement_end_at: orderDetail.measurement_end_time,
  };

  return convertedResponse;
}

/**
 * Staff 주문 수정 (결제 전)
 * PUT /api/v1/staff/orders/:orderId
 */
export async function updateStaffOrder(
  orderId: number,
  orderData: UpdateStaffOrderRequest
): Promise<void> {
  await apiClient.put(`/api/v1/staff/orders/${orderId}`, orderData);
}
