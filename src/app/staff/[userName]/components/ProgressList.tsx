"use client";

import { useState, useEffect } from "react";
import MeasurementSheet from "../../components/MeasurementSheet";
import { useMeasuringStudents } from "../../hooks/useMeasuringStudents";
import { RegisterStudent } from "@/api/studentApi";

export default function ProgressList() {
  const { students, isLoading, error } = useMeasuringStudents();
  const [isMeasurementSheetOpen, setIsMeasurementSheetOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] =
    useState<RegisterStudent | null>(null);

  const handleDetailClick = (student: RegisterStudent) => {
    setSelectedStudent(student);
    setIsMeasurementSheetOpen(true);
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

  // 로딩 중일 때
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  // 에러가 있을 때
  if (error) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="relative">
      {isMeasurementSheetOpen && selectedStudent && (
        <section className="fixed inset-0 z-50">
          <div
            className="absolute top-0 left-0 w-full h-full bg-black/40 backdrop-blur-sm"
            onClick={() => {
              setIsMeasurementSheetOpen(false);
            }}
          ></div>
          <MeasurementSheet
            setIsMeasurementSheetOpen={setIsMeasurementSheetOpen}
            studentId={selectedStudent.id}
            mode="edit"
          />
        </section>
      )}

      <table className="w-full">
        <thead className="bg-gray-50 border-b-2 border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
              No.
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100">
              <div className="flex items-center gap-1">접수시간</div>
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100">
              <div className="flex items-center gap-1">학생이름</div>
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
              성별
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 min-w-[280px]">
              출신학교 → 입학학교
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
              분류
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
              상세
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {students.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                확정 진행중인 학생이 없습니다.
              </td>
            </tr>
          ) : (
            students.map((student, index) => (
              <tr
                key={student.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {student.checked_in_at}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {student.name}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {student.gender === "male" ? "남" : "여"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {student.previous_school} → {student.school_name}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {student.admission_grade === 1 ? "신입" : "재학"}
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
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
