"use client";

import { useState } from "react";
import MeasurementWaitingTable, {
  MeasurementData,
} from "./components/MeasurementWaitingTable";
import StudentDetailModal, {
  StudentDetailData,
} from "./components/StudentDetailModal";

const measurementData: MeasurementData[] = Array.from(
  { length: 13 },
  (_, i) => ({
    id: i + 1,
    completedAt: "25/01/12 15:00",
    studentName: "김인철",
    gender: "남",
    school: "청주고등학교",
    category: "신입",
    expectedAmount: "112,335원",
  })
);

export default function AdminPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] =
    useState<StudentDetailData | null>(null);

  // Sample student detail data (admin용)
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
        items:
          "동복 (93,700원) : 초기 100+1 - 블라우스 100-1, 재킷 버튼 상의 100-1, 재킷 버튼 하의 100-1 하복 (93,700원) : 블라우스 100-1, 재킷 버튼 상의 100-1, 재킷 버튼 하의 100-1",
        memo: "파일",
      },
      {
        date: "2026/01/15 15:00",
        items: "자켓 사이즈 100→105 변경",
        memo: "파일",
      },
    ],
  };

  const handleDetailClick = (id: number) => {
    console.log("상세보기 클릭:", id);
    setSelectedStudent(studentDetailData);
    setIsModalOpen(true);
  };

  const handlePaymentComplete = () => {
    console.log("결제 완료 처리");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <MeasurementWaitingTable
        data={measurementData}
        onDetailClick={handleDetailClick}
      />

      {selectedStudent && (
        <StudentDetailModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          data={selectedStudent}
          mode="admin"
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </div>
  );
}
