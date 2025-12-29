"use client";

import { useEffect, useState } from "react";
import {
  RegisterStudent,
  startMeasurement,
  StartMeasurementResponse,
} from "@/api/student";
import MeasurementSheet from "./components/MeasurementSheet";
import ConfirmModal from "./components/ConfirmModal";
import StudentTable from "./components/StudentTable";
import { useStudents } from "./hooks/useStudents";
import { useInfiniteScroll } from "./hooks/useInfiniteScroll";
import Toast from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";
import { AxiosError } from "axios";

export default function Page() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMeasurementSheetOpen, setIsMeasurementSheetOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] =
    useState<RegisterStudent | null>(null);
  const [measurementData, setMeasurementData] =
    useState<StartMeasurementResponse | null>(null);
  const { toast, showToast, hideToast } = useToast();

  const {
    students,
    isLoading,
    error,
    total,
    hasMore,
    isFetchingMore,
    loadMore,
    refresh,
  } = useStudents();

  const { lastElementRef } = useInfiniteScroll({
    isLoading,
    isFetchingMore,
    hasMore,
    onLoadMore: loadMore,
  });

  const handleDetailClick = (student: RegisterStudent) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleStartMeasurement = async () => {
    if (!selectedStudent) return;

    try {
      const data = await startMeasurement(selectedStudent.id);
      setMeasurementData(data);
      setIsModalOpen(false);
      setIsMeasurementSheetOpen(true);
      refresh();
    } catch (error) {
      console.error("Failed to start measurement:", error);

      // 409 에러 처리: 다른 사람이 이미 측정을 시작함
      if (error instanceof AxiosError && error.response?.status === 409) {
        setIsModalOpen(false);
        showToast("다른 직원이 이미 측정을 시작했습니다.");
        refresh();
      }
    }
  };

  const handleCancelModal = () => {
    setSelectedStudent(null);
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (isMeasurementSheetOpen || isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMeasurementSheetOpen, isModalOpen]);

  return (
    <main className="px-5 relative">
      {isModalOpen && selectedStudent && (
        <ConfirmModal
          student={selectedStudent}
          onCancel={handleCancelModal}
          onConfirm={handleStartMeasurement}
        />
      )}

      {isMeasurementSheetOpen && selectedStudent && measurementData && (
        <MeasurementSheet
          studentId={selectedStudent.id}
          measurementData={measurementData}
          selectedStudent={selectedStudent}
          setIsMeasurementSheetOpen={setIsMeasurementSheetOpen}
        />
      )}

      <section>
        <StudentTable
          students={students}
          total={total}
          isLoading={isLoading}
          error={error}
          isFetchingMore={isFetchingMore}
          lastElementRef={lastElementRef}
          onDetailClick={handleDetailClick}
        />
      </section>

      {toast && <Toast message={toast} onClose={hideToast} />}
    </main>
  );
}
