"use client";

import { useState } from "react";
import StatisticsCards, { StatisticsData } from "./components/StatisticsCards";
import Calendar, { CalendarEvent } from "./components/Calendar";
import MeasurementWaitingTable, {
  MeasurementData,
} from "./components/MeasurementWaitingTable";
import SchoolStatistics, { SchoolStat } from "./components/SchoolStatistics";
import StudentDetailModal, {
  StudentDetailData,
} from "./components/StudentDetailModal";

// Dummy data for statistics
const statisticsData: StatisticsData = {
  measuring: 0,
  todayCompleted: 0,
  todayScheduled: 0,
};

// Dummy data for calendar events (학교별 측정 기간)
const calendarEvents: CalendarEvent[] = [
  // 중학교 측정 일정
  {
    id: "1",
    title: "송림중학교",
    startDate: new Date(2026, 0, 5),
    endDate: new Date(2026, 0, 15),
    color: "#10B981",
    type: "middle",
  },
  {
    id: "2",
    title: "출발중학교",
    startDate: new Date(2026, 0, 8),
    endDate: new Date(2026, 0, 12),
    color: "#059669",
    type: "middle",
  },
  {
    id: "3",
    title: "대전중학교",
    startDate: new Date(2026, 0, 13),
    endDate: new Date(2026, 0, 18),
    color: "#14B8A6",
    type: "middle",
  },
  {
    id: "4",
    title: "세종중학교",
    startDate: new Date(2026, 0, 19),
    endDate: new Date(2026, 0, 23),
    color: "#22C55E",
    type: "middle",
  },

  // 고등학교 측정 일정
  {
    id: "5",
    title: "청주고등학교",
    startDate: new Date(2026, 0, 6),
    endDate: new Date(2026, 0, 15),
    color: "#DC2626",
    type: "high",
  },
  {
    id: "6",
    title: "대전고등학교",
    startDate: new Date(2026, 0, 16),
    endDate: new Date(2026, 0, 22),
    color: "#EF4444",
    type: "high",
  },
  {
    id: "7",
    title: "세종고등학교",
    startDate: new Date(2026, 0, 20),
    endDate: new Date(2026, 0, 26),
    color: "#F87171",
    type: "high",
  },

  // 교복 판매 일정
  {
    id: "8",
    title: "교복판매 1차",
    startDate: new Date(2026, 0, 14),
    endDate: new Date(2026, 0, 14),
    color: "#FBBF24",
    type: "sale",
  },
  {
    id: "9",
    title: "교복판매 2차",
    startDate: new Date(2026, 0, 27),
    endDate: new Date(2026, 0, 27),
    color: "#F59E0B",
    type: "sale",
  },
];

// Dummy data for measurement waiting table
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

// Dummy data for school statistics (캘린더 일정과 연동)
const middleSchools: SchoolStat[] = [
  {
    name: "송림중학교",
    period: "-1/15",
    count: "[255/280]",
    color: "#10B981",
  },
  {
    name: "출발중학교",
    period: "-1/12",
    count: "[180/200]",
    color: "#059669",
  },
  {
    name: "대전중학교",
    period: "-1/18",
    count: "[95/320]",
    color: "#14B8A6",
  },
  {
    name: "세종중학교",
    period: "-1/23",
    count: "[12/250]",
    color: "#22C55E",
  },
];

const highSchools: SchoolStat[] = [
  {
    name: "청주고등학교",
    period: "-1/15",
    count: "[224/350]",
    color: "#DC2626",
  },
  {
    name: "대전고등학교",
    period: "-1/22",
    count: "[87/300]",
    color: "#EF4444",
  },
  {
    name: "세종고등학교",
    period: "-1/26",
    count: "[0/280]",
    color: "#F87171",
  },
];

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
      {/* <div className="grid grid-cols-[300px_1fr] gap-6">
        <StatisticsCards data={statisticsData} />
        <Calendar events={calendarEvents} year={2026} month={1} />
      </div> */}

      <MeasurementWaitingTable
        data={measurementData}
        onDetailClick={handleDetailClick}
      />
      {/* 
      <SchoolStatistics
        middleSchools={middleSchools}
        highSchools={highSchools}
      /> */}

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
