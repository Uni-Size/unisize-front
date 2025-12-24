"use client";

import { useState } from "react";
import MeasurementWaitingTable, {
  MeasurementData,
} from "./components/MeasurementWaitingTable";
import StudentDetailModal, {
  StudentDetailData,
} from "./components/StudentDetailModal";

export default function AdminPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] =
    useState<StudentDetailData | null>(null);

  const handlePaymentComplete = () => {
    console.log("결제 완료 처리");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
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
    </div>
  );
}
