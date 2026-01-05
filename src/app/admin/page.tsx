"use client";

import { useState } from "react";
import MeasurementWaitingTable, {
  MeasurementData,
} from "./components/MeasurementWaitingTable";
import StudentDetailModal, {
  StudentDetailData,
} from "./components/StudentDetailModal";
import ConfirmedOrdersTable from "./components/ConfirmedOrdersTable";
import OrderDetailModal from "./components/OrderDetailModal";

export default function AdminPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] =
    useState<StudentDetailData | null>(null);
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const handlePaymentComplete = () => {
    console.log("결제 완료 처리");
  };

  const handleOrderDetailClick = (orderId: number) => {
    setSelectedOrderId(orderId);
    setIsOrderDetailOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 확정된 주문 목록 */}
      <ConfirmedOrdersTable onDetailClick={handleOrderDetailClick} />

      {/* <MeasurementWaitingTable
        data={measurementData}
        onDetailClick={handleDetailClick}
      /> */}

      {selectedStudent && (
        <StudentDetailModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          data={selectedStudent}
          mode="admin"
          onPaymentComplete={handlePaymentComplete}
        />
      )}

      {selectedOrderId && (
        <OrderDetailModal
          isOpen={isOrderDetailOpen}
          onClose={() => {
            setIsOrderDetailOpen(false);
            setSelectedOrderId(null);
          }}
          orderId={selectedOrderId}
        />
      )}
    </div>
  );
}
