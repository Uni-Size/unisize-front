"use client";

import { useEffect, useState } from "react";
import { RegisterStudent, startMeasurement } from "@/api/studentApi";
import MeasurementSheet from "./components/MeasurementSheet";
import ConfirmModal from "./components/ConfirmModal";
import StudentTable from "./components/StudentTable";
import { useStudents } from "./hooks/useStudents";
import { useInfiniteScroll } from "./hooks/useInfiniteScroll";

export default function Page() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMeasurementSheetOpen, setIsMeasurementSheetOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] =
    useState<RegisterStudent | null>(null);

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
      await startMeasurement(selectedStudent.id);
      setIsModalOpen(false);
      setIsMeasurementSheetOpen(true);
      refresh();
    } catch (error) {
      console.error("Failed to start measurement:", error);
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

      {isMeasurementSheetOpen && selectedStudent && (
        <section className="">
          <div
            className="absolute  top-0 left-0 w-full h-full bg-black/40 backdrop-blur-sm"
            onClick={() => {
              setIsMeasurementSheetOpen(false);
            }}
          ></div>
          <MeasurementSheet
            studentId={selectedStudent.id}
            setIsMeasurementSheetOpen={setIsMeasurementSheetOpen}
          />
        </section>
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
    </main>
  );
}
