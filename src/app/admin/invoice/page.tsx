"use client";

import { useState } from "react";
import StudentDetailModal, {
  StudentDetailData,
} from "../components/StudentDetailModal";
import AdditionalPurchaseSlide from "../components/AdditionalPurchaseSlide";

interface Student {
  no: number;
  grade: string;
  school: string;
  studentName: string;
  gender: string;
  schoolPhone: string;
  parentPhone: string;
  estimatedAmount: string;
  reservationStatus: string;
  reservationDate: string;
  resultStatus: string;
  resultDate: string;
}

export default function SmartUniformSearch() {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedGrades, setSelectedGrades] = useState({
    신입: false,
    "1학년": false,
    "2학년": false,
    "3학년": false,
  });
  const [selectedStatuses, setSelectedStatuses] = useState({
    방문전: false,
    측정전: false,
    측정중: false,
    사이즈확정완료: false,
  });
  const [selectedResults, setSelectedResults] = useState({
    결제전: false,
    결제완료: false,
  });
  const [selectedPeriods, setSelectedPeriods] = useState({
    "측정기간 전": false,
    "측정기간 중": false,
    "측정기기 종료": false,
  });

  // Modal and Slide states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSlideOpen, setIsSlideOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentDetailData | null>(null);

  // Sample student detail data
  const studentDetailData: StudentDetailData = {
    studentName: "김인철",
    gender: "남",
    school: "청주고등학교",
    enrollmentSchool: "2026년 신입 청주고등학교",
    studentPhone: "010-4810-2606",
    parentPhone: "010-5190-2606",
    measurements: {
      date: "25/01/12",
      height: 172,
      weight: 90,
      shoulderWidth: 44,
      waist: 32,
    },
    winterUniform: {
      jacket: "100 | 소매 2 inch 줄임",
      knitVest: "100",
      blouse: "100",
      pants: "77",
      waistSize: "80 | 34 3/4inch",
      inseam: "80 | 34 3/4inch",
    },
    summerUniform: {
      shirt: "100",
    },
    accessories: {
      dressShirt: "100",
      shortSleeveTop: "100",
      longSleeveTop: "100",
      uniformJumper: "100",
      schoolJacket: "L",
      summerJacket: "L",
      gymShorts: "L",
    },
    products: [
      {
        category: "양말",
        name: "교복 티셔츠 반팔",
        color: "흰색",
        size: "100",
        quantity: 0,
        memo: "-",
      },
      {
        category: "교복 티 긴팔",
        name: "교복 티 긴팔",
        color: "감성",
        size: "100",
        quantity: 0,
        memo: "6개 1세트",
      },
    ],
    purchaseLogs: [
      {
        date: "2026/01/15 15:00",
        items: "동복 (93,700원) : 초기 100+1 - 블라우스 100-1, 재킷 버튼 상의 100-1, 재킷 버튼 하의 100-1 하복 (93,700원) : 블라우스 100-1, 재킷 버튼 상의 100-1, 재킷 버튼 하의 100-1",
        memo: "파일",
      },
      {
        date: "2026/01/15 15:00",
        items: "자켓 사이즈 100→105 변경",
        memo: "파일",
      },
    ],
  };

  // Sample data
  const students: Student[] = Array(13)
    .fill(null)
    .map((_, index) => ({
      no: 1,
      grade: "신입",
      school: "청주고등학교",
      studentName: "김인철",
      gender: "남",
      schoolPhone: "010-5571-8239",
      parentPhone: "010-4810-2606",
      estimatedAmount: "112,335원",
      reservationStatus: "사이즈확정완료",
      reservationDate: "25/01/12 15:00",
      resultStatus: "결제완료",
      resultDate: "25/01/12 15:00",
    }));

  const handleStudentClick = () => {
    setSelectedStudent(studentDetailData);
    setIsModalOpen(true);
  };

  const handleAddModify = () => {
    setIsSlideOpen(true);
  };

  const handleAdditionalPurchase = (
    items: Array<{
      category: string;
      name: string;
      color?: string;
      size?: string;
      quantity: number;
      memo?: string;
    }>
  ) => {
    console.log("추가 구매 항목:", items);
    setIsSlideOpen(false);
    // TODO: 실제로 데이터를 저장하는 로직 추가
  };

  const handleGradeToggle = (grade: string) => {
    setSelectedGrades((prev) => ({
      ...prev,
      [grade]: !prev[grade as keyof typeof prev],
    }));
  };

  const handleStatusToggle = (status: string) => {
    setSelectedStatuses((prev) => ({
      ...prev,
      [status]: !prev[status as keyof typeof prev],
    }));
  };

  const handleResultToggle = (result: string) => {
    setSelectedResults((prev) => ({
      ...prev,
      [result]: !prev[result as keyof typeof prev],
    }));
  };

  const handlePeriodToggle = (period: string) => {
    setSelectedPeriods((prev) => ({
      ...prev,
      [period]: !prev[period as keyof typeof prev],
    }));
  };

  const handleReset = () => {
    setSearchKeyword("");
    setSelectedGrades({
      신입: false,
      "1학년": false,
      "2학년": false,
      "3학년": false,
    });
    setSelectedStatuses({
      방문전: false,
      측정전: false,
      측정중: false,
      사이즈확정완료: false,
    });
    setSelectedResults({
      결제전: false,
      결제완료: false,
    });
    setSelectedPeriods({
      "측정기간 전": false,
      "측정기간 중": false,
      "측정기기 종료": false,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search Filter Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          {/* Search Input */}
          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-2 flex items-center justify-center bg-gray-100 rounded font-medium text-gray-700">
              검색어
            </div>
            <div className="col-span-10 flex gap-2">
              <select className="px-3 py-2 border border-gray-300 rounded bg-white">
                <option>통합검색</option>
              </select>
              <input
                type="text"
                placeholder="검색어를 입력하세요."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded"
              />
            </div>
          </div>

          {/* Grade Filter */}
          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-2 flex items-center justify-center bg-gray-100 rounded font-medium text-gray-700">
              학년
            </div>
            <div className="col-span-10 flex gap-2 flex-wrap">
              {Object.keys(selectedGrades).map((grade) => (
                <label key={grade} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={
                      selectedGrades[grade as keyof typeof selectedGrades]
                    }
                    onChange={() => handleGradeToggle(grade)}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-700">{grade}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-2 flex items-center justify-center bg-gray-100 rounded font-medium text-gray-700">
              방문 상태
            </div>
            <div className="col-span-10 flex gap-2 flex-wrap">
              {Object.entries(selectedStatuses).map(([status, checked]) => (
                <label key={status} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleStatusToggle(status)}
                    className="w-4 h-4"
                  />
                  <span
                    className={`px-3 py-1 rounded text-sm ${
                      status === "방문전"
                        ? "bg-gray-200 text-gray-700"
                        : status === "측정전"
                        ? "bg-blue-100 text-blue-700"
                        : status === "측정중"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {status}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Result Filter */}
          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-2 flex items-center justify-center bg-gray-100 rounded font-medium text-gray-700">
              결제 상태
            </div>
            <div className="col-span-10 flex gap-2 flex-wrap">
              {Object.entries(selectedResults).map(([result, checked]) => (
                <label key={result} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleResultToggle(result)}
                    className="w-4 h-4"
                  />
                  <span
                    className={`px-3 py-1 rounded text-sm ${
                      result === "결제전"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {result}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Period Filter */}
          <div className="grid grid-cols-12 gap-4 mb-6">
            <div className="col-span-2 flex items-center justify-center bg-gray-100 rounded font-medium text-gray-700">
              측정기간
            </div>
            <div className="col-span-10 flex gap-2 flex-wrap">
              {Object.keys(selectedPeriods).map((period) => (
                <label key={period} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={
                      selectedPeriods[period as keyof typeof selectedPeriods]
                    }
                    onChange={() => handlePeriodToggle(period)}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-700">{period}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-3">
            <button className="px-8 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              검색
            </button>
            <button
              onClick={handleReset}
              className="px-8 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
            >
              초기화
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    No.
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    학년
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    입학학교
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    학생이름
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    성별
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    학생 연락처
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    학부모 연락처
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    견적결제금액
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    방문상태
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    결제상태
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.map((student, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{student.no}</td>
                    <td className="px-4 py-3 text-sm">{student.grade}</td>
                    <td className="px-4 py-3 text-sm">{student.school}</td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={handleStudentClick}
                        className="text-blue-600 hover:underline"
                      >
                        {student.studentName}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm">{student.gender}</td>
                    <td className="px-4 py-3 text-sm">{student.schoolPhone}</td>
                    <td className="px-4 py-3 text-sm">{student.parentPhone}</td>
                    <td className="px-4 py-3 text-sm">
                      {student.estimatedAmount}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                        {student.reservationStatus}
                      </span>
                      <div className="text-xs text-gray-600 mt-1">
                        {student.reservationDate}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block bg-red-100 text-red-700 px-2 py-1 rounded text-xs">
                        {student.resultStatus}
                      </span>
                      <div className="text-xs text-gray-600 mt-1">
                        {student.resultDate}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Student Detail Modal */}
        {selectedStudent && (
          <StudentDetailModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            data={selectedStudent}
            mode="invoice"
            onAddModify={handleAddModify}
          />
        )}

        {/* Additional Purchase Slide Panel */}
        <AdditionalPurchaseSlide
          isOpen={isSlideOpen}
          onClose={() => setIsSlideOpen(false)}
          onSubmit={handleAdditionalPurchase}
          studentName={selectedStudent?.studentName || ""}
        />
    </div>
  );
}
