"use client";

import { useState, useEffect } from "react";
import MeasurementSheet from "../../components/MeasurementSheet";
import { usePaymentPending } from "@/hooks/usePaymentPending";
import type { PaymentPendingStudent } from "@/api/paymentApi";

export default function PaymentList() {
  const { students, isLoading, error, hasMore, loadMore, refresh } = usePaymentPending();
  const [isMeasurementSheetOpen, setIsMeasurementSheetOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<PaymentPendingStudent | null>(null);

  const handleDetailClick = (student: PaymentPendingStudent) => {
    setSelectedStudent(student);
    setIsMeasurementSheetOpen(true);
  };

  const handleSheetClose = () => {
    setIsMeasurementSheetOpen(false);
    // 시트 닫을 때 데이터 새로고침
    refresh();
  };

  useEffect(() => {
    if (isMeasurementSheetOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMeasurementSheetOpen]);

  return (
    <div className="relative">
      {isMeasurementSheetOpen && selectedStudent && (
        <section className="fixed inset-0 z-50">
          <div
            className="absolute top-0 left-0 w-full h-full bg-black/40 backdrop-blur-sm"
            onClick={handleSheetClose}
          ></div>
          <MeasurementSheet
            setIsMeasurementSheetOpen={handleSheetClose}
            studentId={selectedStudent.id}
            mode="readonly"
          />
        </section>
      )}

      {isLoading ? (
        <div className="py-8 text-center text-gray-500">
          로딩 중...
        </div>
      ) : error ? (
        <div className="py-8 text-center text-red-500">
          {error}
        </div>
      ) : students.length === 0 ? (
        <div className="py-8 text-center text-gray-500">
          결제 대기 중인 학생이 없습니다.
        </div>
      ) : (
        <>
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  No.
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  결제일
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  학생이름
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  성별
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  학교
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  학년
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  상세
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {students.map((student, index) => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {student.result_date}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{student.student_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{student.gender}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {student.school}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {student.grade}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <button
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                      onClick={() => handleDetailClick(student)}
                    >
                      ↗
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {hasMore && (
            <div className="mt-4 text-center">
              <button
                onClick={loadMore}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                더 보기
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
