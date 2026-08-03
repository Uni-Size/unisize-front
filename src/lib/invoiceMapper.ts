import type { FinalizeMeasurementOrderItem, FinalizeMeasurementResponse } from '@/api/student';
import type { InvoiceData, InvoiceUniformRow, InvoiceSupplyRow } from '@components/organisms/InvoiceReceipt';

/**
 * finalize-measurement 응답을 InvoiceReceipt가 그리는 InvoiceData로 변환한다.
 *
 * backend-dev가 실제 order_service.go/models/order.go 코드를 읽고 확정한 계약대로
 * order_items는 하나의 평탄한 배열이며(별도 uniform_items/supply_items 없음),
 * 각 항목의 item_group("W" | "S" | "supply")으로 동복/하복/용품을 나눈다.
 * 아직 서버에 실제 배포되지는 않았다고 안내받았으므로, 배포 후 실제 응답이
 * 다르면 이 파일만 고치면 되도록 변환 책임을 여기에 모아둔다.
 */

function toUniformRow(item: FinalizeMeasurementOrderItem): InvoiceUniformRow {
  return {
    id: item.id,
    name: item.product?.name ?? '',
    size: item.selected_size,
    supportedQty: item.supported_quantity,
    additionalQty: item.additional_quantity,
    customization: item.customization ?? '',
    isReserved: item.is_reserved,
    tagAssigned: item.name_tag_count ?? 0,
    tagAttached: item.name_tag_attach_count ?? 0,
  };
}

function toSupplyRow(item: FinalizeMeasurementOrderItem): InvoiceSupplyRow {
  return {
    id: item.id,
    name: item.product?.name ?? '',
    size: item.selected_size,
    qty: item.purchase_quantity,
  };
}

export interface InvoiceMapperFallbacks {
  /** 응답에 seller_name이 비어 있는 경우 사용할 값 (예: 로그인한 스태프 이름) */
  sellerName?: string;
  /** 응답에 order_date가 비어 있는 경우 사용할 값 (예: 클라이언트의 현재 시각) */
  date?: string;
}

export function mapFinalizeMeasurementToInvoiceData(
  response: FinalizeMeasurementResponse,
  fallbacks: InvoiceMapperFallbacks = {},
): InvoiceData {
  const orderItems = response.order_items ?? [];
  const winterItems = orderItems.filter((i) => i.item_group === 'W').map(toUniformRow);
  const summerItems = orderItems.filter((i) => i.item_group === 'S').map(toUniformRow);
  const supplyItems = orderItems.filter((i) => i.item_group === 'supply').map(toSupplyRow);

  return {
    sellerName: response.seller_name || fallbacks.sellerName || '',
    date: response.order_date || fallbacks.date || '',
    toSchool: response.student.admission_school,
    fromSchool: response.student.previous_school,
    studentName: response.student.name,
    gender: response.student.gender,
    studentPhone: response.student.student_phone,
    guardianPhone: response.student.guardian_phone,
    signatureDataUrl: response.signature,
    winterItems,
    summerItems,
    supplyItems,
    totalTagAssigned: response.total_name_tag_count ?? 0,
    totalTagAttached: response.total_name_tag_attach_count ?? 0,
    totalAmount: response.total_amount ?? 0,
    winterSubtotal: response.winter_subtotal ?? 0,
    summerSubtotal: response.summer_subtotal ?? 0,
    tagSubtotal: response.name_tag_subtotal ?? 0,
  };
}
