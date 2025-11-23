"use client";

import { useState, useEffect } from "react";
import MeasurementSheet from "../../components/MeasurementSheet";

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
export default function ProgressList() {
  const [isMeasurementSheetOpen, setIsMeasurementSheetOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const handleDetailClick = (student: Student) => {
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

  return (
    <div className="relative">
      {isMeasurementSheetOpen && (
        <section className="fixed inset-0 z-50">
          <div
            className="absolute top-0 left-0 w-full h-full bg-black/40 backdrop-blur-sm"
            onClick={() => {
              setIsMeasurementSheetOpen(false);
            }}
          ></div>
          <MeasurementSheet
            setIsMeasurementSheetOpen={setIsMeasurementSheetOpen}
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
          {data.map((row) => (
            <tr key={row.no} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 text-sm text-gray-900">{row.no}</td>
              <td className="px-4 py-3 text-sm text-gray-900">
                {row.timestamp}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">{row.name}</td>
              <td className="px-4 py-3 text-sm text-gray-900">{row.gender}</td>
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
  );
}
