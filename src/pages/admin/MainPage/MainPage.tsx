import { useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { AdminLayout } from "@components/templates/AdminLayout";
import { AdminHeader } from "@components/organisms/AdminHeader";
import { InvoiceModal } from "@components/organisms/InvoiceModal";
import type { StudentDetailData } from "@components/organisms/StudentModal";
import { Table } from "@components/atoms/Table";
import { Pagination } from "@components/atoms/Pagination";
import { Toast } from "@components/atoms/Toast";
import type { Column } from "@components/atoms/Table";
import {
  getPaymentPendingOrders,
  type PaymentPendingOrder,
  type PaymentPendingListResponse,
} from "@/api/order";
import { getStudentDetail, getOrderHistory } from "@/api/student";
import type { AdminOrderItem, AdminStudentOrder } from "@/api/student";
import { completePayment } from "@/api/staff";
import { getApiErrorMessage, getApiErrorString } from "@/utils/errorUtils";
import { formatDate, formatDateTime } from "@/utils/dateUtils";
import { formatGender } from "@/utils/genderUtils";

interface PendingRow {
  id: number;
  orderId: number;
  studentId: number;
  no: number;
  measuredAt: string;
  studentName: string;
  gender: string;
  school: string;
  remainingAmount: string;
  remainingAmountRaw: number;
}

const toRow = (item: PaymentPendingOrder, absoluteIndex: number): PendingRow => ({
  id: item.order_id,
  orderId: item.order_id,
  studentId: item.student_id,
  no: absoluteIndex + 1,
  measuredAt: formatDateTime(item.measurement_end_time),
  studentName: item.student_name,
  gender: formatGender(item.gender),
  school: item.school_name,
  remainingAmount: `${item.remaining_amount.toLocaleString()}원`,
  remainingAmountRaw: item.remaining_amount,
});

const ITEMS_PER_PAGE = 10;

export const MainPage = () => {
  const [orders, setOrders] = useState<PendingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ReactNode>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] =
    useState<StudentDetailData | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const fetchOrders = useCallback(async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const response: PaymentPendingListResponse = await getPaymentPendingOrders({ page, limit: ITEMS_PER_PAGE });
      setOrders(response.orders.map((item, i) => toRow(item, (page - 1) * ITEMS_PER_PAGE + i)));
      setTotalPages(response.meta.total_pages ?? 1);
    } catch (err) {
      console.error("결제 대기자 목록 조회 실패:", err);
      setError(
        getApiErrorMessage(
          err,
          "결제 대기자 목록을 불러오는 중 오류가 발생했습니다.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage, fetchOrders]);

  const parseAdminOrderItems = (orderItems: AdminOrderItem[], nameTagService?: AdminStudentOrder['name_tag_service']) => {
    const winterUniforms: import("@components/organisms/StudentModal").UniformItem[] = [];
    const summerUniforms: import("@components/organisms/StudentModal").UniformItem[] = [];
    const allUniforms: import("@components/organisms/StudentModal").UniformItem[] = [];
    for (const item of orderItems) {
      const productName = item.product?.name ?? "";
      const nameUpper = productName.toUpperCase();
      const rawSeason = item.product?.season?.toUpperCase();
      const seasonCode: "W" | "S" | "A" =
        rawSeason === "W" ? "W" :
        rawSeason === "S" ? "S" :
        rawSeason === "A" ? "A" :
        nameUpper.includes("동복") || nameUpper.includes("WINTER") ? "W" :
        nameUpper.includes("하복") || nameUpper.includes("SUMMER") ? "S" : "A";
      const uniform: import("@components/organisms/StudentModal").UniformItem = {
        id: String(item.id),
        productId: item.product_id,
        name: productName,
        size: item.selected_size,
        supportedQuantity: item.supported_quantity,
        additionalQuantity: item.purchase_quantity - item.supported_quantity,
        unitPrice: item.unit_price,
        repair: item.customization ?? "",
        reservation: item.delivery_status === "reserved",
        received: item.delivery_status === "receipt",
        nameTag: item.name_tag_count || null,
        nameTagName: item.name_tag_name || undefined,
        attachCount: item.name_tag_attach ? 1 : 0,
        nameTagUnitPrice: nameTagService?.unit_price ?? undefined,
        nameTagAttachPrice: nameTagService?.attach_price ?? undefined,
        itemStatus: item.delivery_status,
        seasonCode,
      };
      if (seasonCode === "W") winterUniforms.push(uniform);
      else if (seasonCode === "S") summerUniforms.push(uniform);
      else allUniforms.push(uniform);
    }
    return { winterUniforms, summerUniforms, allUniforms };
  };

  const handleDetailClick = async (e: React.MouseEvent, row: PendingRow) => {
    e.stopPropagation();
    setDetailLoading(true);
    try {
      const detail = await getStudentDetail(row.studentId);
      const adminOrders = detail.orders ?? [];

      const orderSnapshots: import("@components/organisms/StudentModal").OrderSnapshot[] =
        adminOrders.map((order: AdminStudentOrder) => {
          const { winterUniforms, summerUniforms, allUniforms } = parseAdminOrderItems(order.order_items ?? [], order.name_tag_service);
          return {
            orderId: order.id,
            date: order.order_date ?? order.created_at,
            status: order.order_status,
            winterUniforms,
            summerUniforms,
            allUniforms,
            supplies: [],
            history: [],
            modifiedDate: formatDate(order.updated_at),
            name_tag_service: order.name_tag_service,
            nameTagName: order.name_tag_name,
          };
        });

      const targetSnapshot = orderSnapshots.find((s) => s.orderId === row.orderId) ?? orderSnapshots[0];

      const historyData = targetSnapshot
        ? await getOrderHistory(targetSnapshot.orderId).catch(() => null)
        : null;
      const history = historyData?.histories.map((h) => {
        const who = h.changedBy?.employeeName ?? '알 수 없음';
        let content = h.reason ?? '';
        if (!content) {
          const actionMap: Record<string, string> = { created: '생성', updated: '수정', deleted: '삭제', cancelled: '취소', confirmed: '확정' };
          content = actionMap[h.action] ?? h.action;
        }
        if (h.fieldName) content += ` (${h.fieldName}${h.oldValue != null ? `: ${h.oldValue} → ${h.newValue}` : ''})`;
        return { date: h.createdAt, content: `[${who}] ${content}` };
      }) ?? [];

      if (targetSnapshot) {
        targetSnapshot.history = history;
      }

      const allOrderItems = (targetSnapshot
        ? [...(targetSnapshot.winterUniforms ?? []), ...(targetSnapshot.summerUniforms ?? []), ...(targetSnapshot.allUniforms ?? [])]
        : []);
      const nameTagOrderQtyFromItems = allOrderItems.reduce((sum, i) => sum + (i.nameTag ?? 0), 0);
      const nameTagOrderQty = nameTagOrderQtyFromItems > 0 ? nameTagOrderQtyFromItems : (detail.total_name_tag_count ?? 0);
      const nameTagAttachQty = allOrderItems.reduce((sum, i) => sum + (i.attachCount ?? 0), 0);
      const nameTagUnitPrice = detail.name_tag_service?.unit_price ?? undefined;
      const nameTagAttachPrice = detail.name_tag_service?.attach_price ?? undefined;

      const detailData: StudentDetailData = {
        id: String(detail.id),
        orderId: targetSnapshot?.orderId,
        admissionSchool: detail.admission_school ?? detail.school_name ?? "",
        previousSchool: detail.previous_school ?? "",
        name: detail.name,
        gender: detail.gender,
        birthDate: detail.birth_date ?? undefined,
        admissionYear: detail.admission_year,
        admissionGrade: detail.admission_grade,
        studentPhone: detail.student_phone,
        guardianPhone: detail.guardian_phone,
        address: detail.address ?? undefined,
        height: detail.body_measurements?.height ?? undefined,
        weight: detail.body_measurements?.weight ?? undefined,
        shoulder: detail.body_measurements?.shoulder ?? undefined,
        waist: detail.body_measurements?.waist ?? undefined,
        studentType: detail.student_type,
        isEligibleForPublicPurchase: detail.is_eligible_for_public_purchase,
        registeredDate: formatDate(detail.created_at) || undefined,
        modifiedDate: targetSnapshot?.modifiedDate,
        orderSnapshots,
        nameTagMinUnit: detail.name_tag_service?.min_unit ?? undefined,
        nameTagPrice: nameTagUnitPrice,
        nameTagAttachPrice: nameTagAttachPrice,
        winterUniforms: targetSnapshot?.winterUniforms ?? [],
        summerUniforms: targetSnapshot?.summerUniforms ?? [],
        allUniforms: targetSnapshot?.allUniforms ?? [],
        supplies: [],
        nameTag: {
          orderQuantity: nameTagOrderQty,
          attachQuantity: nameTagAttachQty,
          unitPrice: nameTagUnitPrice,
          attachPrice: nameTagAttachPrice,
        },
        nameTagName: targetSnapshot?.nameTagName ?? detail.name,
        totalNameTagCount: detail.total_name_tag_count,
        history,
        isManuallySupported: detail.is_manually_supported,
      };

      setSelectedStudent(detailData);
      setIsDetailOpen(true);
    } catch (err) {
      console.error("상세 조회 실패:", err);
      alert(err instanceof Error ? err.message : "상세 조회에 실패했습니다.");
    } finally {
      setDetailLoading(false);
    }
  };

  const columns: Column<PendingRow>[] = [
    { key: "no", header: "No.", width: "34px", align: "center" },
    { key: "measuredAt", header: "측정완료", width: "130px", align: "center" },
    { key: "studentName", header: "학생이름", width: "100px", align: "center" },
    { key: "gender", header: "성별", width: "28px", align: "center" },
    { key: "school", header: "입학학교", align: "center" },
    { key: "remainingAmount", header: "결제 예정 금액", align: "center" },
    {
      key: "detail",
      header: "상세",
      width: "42px",
      align: "center",
      render: (row) => (
        <button
          className="flex items-center justify-center w-10.5 h-6 bg-transparent border-none cursor-pointer p-0 hover:opacity-70 disabled:opacity-40"
          aria-label="상세 보기"
          disabled={detailLoading}
          onClick={(e) => handleDetailClick(e, row)}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7 17L17 7M17 7H7M17 7V17"
              stroke="#374151"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="flex flex-col p-5">
        <AdminHeader title="결제 대기자" />

        <div className="flex-1">
          <Table
            columns={columns}
            data={loading ? [] : orders}
            onRowClick={(order) => console.log("Order clicked:", order)}
            emptyMessage={
              loading ? "로딩 중..." : (error ?? "데이터가 없습니다.")
            }
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      <InvoiceModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        student={selectedStudent}
        onPaymentComplete={async (orderId: number) => {
          const amount = orders.find((o) => o.orderId === orderId)?.remainingAmountRaw ?? 0;
          try {
            await completePayment(orderId, { amount, method: "cash" });
            setIsDetailOpen(false);
            setPaymentSuccess(true);
            fetchOrders(currentPage);
          } catch (err) {
            setPaymentError(getApiErrorString(err, "결제 처리 중 오류가 발생했습니다."));
          }
        }}
      />

      {paymentSuccess && (
        <Toast
          message="결제가 완료되었습니다."
          variant="success"
          onClose={() => setPaymentSuccess(false)}
        />
      )}
      {paymentError && (
        <Toast
          message={paymentError}
          variant="error"
          onClose={() => setPaymentError(null)}
        />
      )}
    </AdminLayout>
  );
};
