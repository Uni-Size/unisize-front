"use client";

import { useEffect, useState } from "react";
import MeasurementSheet from "./components/MeasurementSheet";
import { SecurityMaintenanceInfoCompact } from "./components/SecurityMaintenanceInfo";

type Student = {
  no: number;
  timestamp: string;
  name: string;
  gender: string;
  fromSchool: string;
  toSchool: string;
  category: string;
  status: string;
};

const data = Array.from({ length: 17 }, (_, i) => ({
  no: i + 1,
  timestamp: "25/01/12 12:34",
  name: "김인철",
  gender: "남",
  fromSchool: "솔밭중학교",
  toSchool: "청주고등학교",
  category: "신입",
  status: "pending",
}));

export default function Page() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMeasurementSheetOpen, setIsMeasurementSheetOpen] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>({
    no: 1,
    timestamp: "25/01/12 12:34",
    name: "김인철",
    gender: "남",
    fromSchool: "솔밭중학교",
    toSchool: "청주고등학교",
    category: "신입",
    status: "pending",
  });
  const handleDetailClick = (student: Student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };
  const handleStartMeasurement = () => {
    // 실제 구현시 여기서 API 호출 등을 수행
    const hasError = false;

    if (hasError) {
      setTimeout(() => {
        setSelectedStudent(null);
        setIsModalOpen(false);
      }, 2000);
    } else {
      setIsModalOpen(false);
      setIsMeasurementSheetOpen(true);
    }
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
    <main className="py-6 px-5 relative">
      <div className="relative">
        <SecurityMaintenanceInfoCompact />
      </div>
      {isModalOpen && selectedStudent && (
        <div className="absolute top-0 left-0 w-full h-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white w-full p-6 rounded-xl m-6 text-center text-2xl font-semibold">
            <p>
              {selectedStudent.toSchool} {selectedStudent.name} 학생의 <br />
              교복 사이즈 확정을 시작 하시겠습니까?
            </p>
            <div className="flex gap-4">
              <button
                type="button"
                className=" border-1 border-[#2563EB] text-base text-[#2563EB]/80 p-3 rounded-md w-1/2 mt-4"
                onClick={() => {
                  setSelectedStudent(null);
                  setIsModalOpen(false);
                }}
              >
                취소
              </button>
              <button
                type="button"
                className="bg-[#2563EB] text-base text-white p-3 rounded-md w-1/2 mt-4"
                onClick={() => handleStartMeasurement()}
              >
                측정 시작하기
              </button>
            </div>
          </div>
        </div>
      )}
      {isMeasurementSheetOpen && (
        <section className="">
          <div
            className="absolute  top-0 left-0 w-full h-full bg-black/40 backdrop-blur-sm"
            onClick={() => {
              setIsMeasurementSheetOpen(false);
            }}
          ></div>
          <MeasurementSheet
            setIsMeasurementSheetOpen={setIsMeasurementSheetOpen}
          />
        </section>
      )}
      <section>
        <div className="overflow-x-auto">
          <div className="text-sm text-gray-600 pt-4 pb-2">
            총 {data.length}명 대기중
          </div>
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
              {data.map((row) => (
                <tr key={row.no} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-900">{row.no}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {row.timestamp}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {row.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {row.gender}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {row.fromSchool} → {row.toSchool}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {row.category}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <button
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                      onClick={() => handleDetailClick(row)}
                    >
                      ↗
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
