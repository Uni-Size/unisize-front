import { useEffect, useState } from "react";
import {
  RegisterStudent,
  startMeasurement,
  StartMeasurementResponse,
} from "@/api/student";
import ConfirmModal from "./components/ConfirmModal";
import StudentTable from "./components/StudentTable";
import { useStudents } from "./hooks/useStudents";
import { useInfiniteScroll } from "./hooks/useInfiniteScroll";
import Toast from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";
import { AxiosError } from "axios";

export default function StaffMainPage() {
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
        <div className="fixed inset-0 bg-black/30 z-40 flex items-end">
          <div className="bg-white w-full rounded-t-md h-5/6 overflow-y-auto z-50 p-6">
            <p className="text-center text-gray-600">
              측정 시트 컴포넌트가 여기에 표시됩니다.
              <br />
              (MeasurementSheet 컴포넌트 마이그레이션 필요)
            </p>
            <button
              onClick={() => setIsMeasurementSheetOpen(false)}
              className="mt-4 w-full py-2 bg-gray-200 rounded-lg"
            >
              닫기
            </button>
          </div>
        </div>
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
