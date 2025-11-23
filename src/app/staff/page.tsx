"use client";

import { useEffect, useState } from "react";
import MeasurementSheet from "./components/MeasurementSheet";
import { getRegisterStudents, RegisterStudent } from "@/api/studentApi";

type Student = {
  id: number;
  no: number;
  timestamp: string;
  name: string;
  gender: string;
  fromSchool: string;
  toSchool: string;
  category: string;
  status: string;
};

export default function Page() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMeasurementSheetOpen, setIsMeasurementSheetOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  // API 데이터를 화면 표시용 데이터로 변환
  const transformApiDataToStudent = (
    apiStudent: RegisterStudent,
    index: number
  ): Student => {
    // 날짜 포맷 변경: "2025-01-12T12:34:56Z" -> "25/01/12 12:34"
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      const year = date.getFullYear().toString().slice(-2);
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${year}/${month}/${day} ${hours}:${minutes}`;
    };

    // 학년에 따른 분류 결정
    const getCategory = (admissionGrade: number) => {
      return admissionGrade === 1 ? "신입" : "재학";
    };

    return {
      id: apiStudent.id,
      no: index + 1,
      timestamp: formatDate(apiStudent.created_at),
      name: apiStudent.name,
      gender: apiStudent.gender === "male" ? "남" : "여",
      fromSchool: apiStudent.previous_school,
      toSchool: apiStudent.school_name,
      category: getCategory(apiStudent.admission_grade),
      status: "pending",
    };
  };

  // 대기 리스트 데이터 가져오기
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getRegisterStudents();

        if (response.success && response.data.students) {
          const transformedStudents = response.data.students.map(
            (student, index) => transformApiDataToStudent(student, index)
          );
          setStudents(transformedStudents);
          setTotal(response.data.total);
        } else {
          setError(response.error?.message || "데이터를 불러오는데 실패했습니다.");
        }
      } catch (err) {
        setError("서버 연결에 실패했습니다.");
        console.error("Failed to fetch students:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const handleDetailClick = (student: Student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleStartMeasurement = () => {
    setIsModalOpen(false);
    setIsMeasurementSheetOpen(true);
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
            총 {total}명 대기중
          </div>

          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="text-gray-500">로딩 중...</div>
            </div>
          )}

          {error && (
            <div className="flex justify-center items-center py-12">
              <div className="text-red-500">{error}</div>
            </div>
          )}

          {!isLoading && !error && students.length === 0 && (
            <div className="flex justify-center items-center py-12">
              <div className="text-gray-500">대기 중인 학생이 없습니다.</div>
            </div>
          )}

          {!isLoading && !error && students.length > 0 && (
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
                {students.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {row.no}
                    </td>
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
          )}
        </div>
      </section>
    </main>
  );
}
