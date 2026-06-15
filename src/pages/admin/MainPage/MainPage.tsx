import { useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { AdminLayout } from "@components/templates/AdminLayout";
import { AdminHeader } from "@components/organisms/AdminHeader";
import { StudentModal } from "@components/organisms/StudentModal";
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
import type { AdminStudentOrder, AdminOrderItem } from "@/api/student";
import { completePayment } from "@/api/staff";
import { getApiErrorMessage } from "@/utils/errorUtils";
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
  const [selectedRemainingAmount, setSelectedRemainingAmount] = useState(0);
  const [detailLoading, setDetailLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

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

  const parseOrderItems = (orderItems: AdminOrderItem[]) => {
    const winterUniforms: import("@components/organisms/StudentModal").UniformItem[] = [];
    const summerUniforms: import("@components/organisms/StudentModal").UniformItem[] = [];
    for (const item of orderItems) {
      const season = item.product?.season?.toUpperCase() ?? "";
      const uniform: import("@components/organisms/StudentModal").UniformItem = {
        id: String(item.id),
        name: item.product?.name ?? "",
        size: item.size,
        supportedQuantity: item.supportedQuantity,
        additionalQuantity: item.quantity - item.supportedQuantity,
        unitPrice: item.unitPrice,
        repair: item.customization ?? "",
        reservation: false,
        received: item.receivedAt !== null,
        nameTag: null,
        attachCount: 0,
      };
      if (season === "W" || season === "WINTER") {
        winterUniforms.push(uniform);
      } else {
        summerUniforms.push(uniform);
      }
    }
    return { winterUniforms, summerUniforms };
  };

  const handleDetailClick = async (e: React.MouseEvent, row: PendingRow) => {
    e.stopPropagation();
    setDetailLoading(true);
    setSelectedRemainingAmount(row.remainingAmountRaw);
    try {
      const detail = await getStudentDetail(row.studentId);
      const adminOrders = detail.orders ?? [];

      const orderSnapshots: import("@components/organisms/StudentModal").OrderSnapshot[] =
        adminOrders.map((order: AdminStudentOrder) => {
          const { winterUniforms, summerUniforms } = parseOrderItems(order.orderItems ?? []);
          return {
            orderId: order.id,
            date: order.orderDate ?? order.createdAt,
            winterUniforms,
            summerUniforms,
            supplies: [],
            history: [],
            modifiedDate: formatDate(order.updatedAt),
          };
        });

      const targetSnapshot = orderSnapshots.find((s) => s.orderId === row.orderId) ?? orderSnapshots[0];

      const historyData = targetSnapshot
        ? await getOrderHistory(targetSnapshot.orderId).catch(() => null)
        : null;
      const history = historyData?.histories.map((h) => ({
        date: formatDateTime(h.changed_at),
        content: h.description,
      })) ?? [];

      if (targetSnapshot) {
        targetSnapshot.history = history;
      }

      const detailData: StudentDetailData = {
        id: String(detail.id),
        orderId: targetSnapshot?.orderId,
        admissionSchool: detail.admission_school ?? detail.school_name,
        previousSchool: detail.previous_school,
        classNumber: detail.class_name || "",
        name: detail.name,
        gender: detail.gender,
        studentPhone: detail.student_phone,
        guardianPhone: detail.guardian_phone,
        registeredDate: formatDate(detail.created_at) || undefined,
        modifiedDate: targetSnapshot?.modifiedDate,
        orderSnapshots,
        winterUniforms: targetSnapshot?.winterUniforms ?? [],
        summerUniforms: targetSnapshot?.summerUniforms ?? [],
        supplies: [],
        nameTag: { orderQuantity: 0, attachQuantity: 0 },
        history,
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

      <StudentModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        mode="view"
        student={selectedStudent}
        onPaymentComplete={async (orderId) => {
          try {
            await completePayment(Number(orderId), { amount: selectedRemainingAmount, method: "cash" });
            setIsDetailOpen(false);
            setPaymentSuccess(true);
            fetchOrders(currentPage);
          } catch (err) {
            alert(getApiErrorMessage(err, "결제 처리 중 오류가 발생했습니다."));
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
    </AdminLayout>
  );
};
