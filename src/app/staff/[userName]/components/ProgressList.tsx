"use client";

import { useState, useEffect } from "react";
import MeasurementSheet from "../../components/MeasurementSheet";
import { useMeasuringStudents } from "../../hooks/useMeasuringStudents";
import {
  RegisterStudent,
  getMeasurementPageInfo,
  StartMeasurementResponse,
} from "@/api/studentApi";

export default function ProgressList() {
  const { students, isLoading, error } = useMeasuringStudents();
  const [isMeasurementSheetOpen, setIsMeasurementSheetOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] =
    useState<RegisterStudent | null>(null);
  const [measurementData, setMeasurementData] =
    useState<StartMeasurementResponse | null>(null);

  const handleDetailClick = async (student: RegisterStudent) => {
    try {
      const data = await getMeasurementPageInfo(student.id);
      setMeasurementData(data);
      setSelectedStudent(student);
      setIsMeasurementSheetOpen(true);
    } catch (error) {
      console.error("Failed to fetch measurement page info:", error);
      alert("측정 정보를 불러오는데 실패했습니다.");
    }
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
      {isMeasurementSheetOpen && selectedStudent && measurementData && (
        <MeasurementSheet
          studentId={selectedStudent.id}
          measurementData={measurementData}
          selectedStudent={selectedStudent}
          setIsMeasurementSheetOpen={setIsMeasurementSheetOpen}
        />
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
