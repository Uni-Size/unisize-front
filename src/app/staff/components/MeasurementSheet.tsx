"use client";

import { useState, useMemo, useCallback } from "react";

// ✅ 상수는 컴포넌트 밖으로 이동
const UNIFORM_ITEMS = {
  동복: [
    {
      id: "자켓",
      name: "자켓",
      price: 55000,
      size: 100,
      customization: "소매 : 2cm 줄임",
      provided: 1,
    },
    {
      id: "니트조끼",
      name: "니트조끼",
      price: 55000,
      size: 100,
      customization: "",
      provided: 1,
    },
    {
      id: "블라우스",
      name: "블라우스",
      price: 55000,
      size: 100,
      customization: "",
      provided: 1,
    },
    {
      id: "치마",
      name: "치마",
      price: 55000,
      size: 74,
      customization: "",
      provided: 1,
    },
    {
      id: "바지",
      name: "바지",
      price: 55000,
      size: 80,
      customization: "기장 : 34 3/4",
      provided: 0,
    },
    {
      id: "체육복상의",
      name: "체육복 상의",
      price: 55000,
      size: 100,
      customization: "지원제외품목",
      provided: 0,
    },
    {
      id: "체육복하의",
      name: "체육복 하의",
      price: 55000,
      size: 100,
      customization: "지원제외품목",
      provided: 0,
    },
  ],
  하복: [
    {
      id: "하복셔츠",
      name: "하복 셔츠",
      price: 35000,
      size: 100,
      customization: "",
      provided: 2,
    },
    {
      id: "하복블라우스",
      name: "하복 블라우스",
      price: 35000,
      size: 100,
      customization: "",
      provided: 2,
    },
    {
      id: "하복치마",
      name: "하복 치마",
      price: 45000,
      size: 74,
      customization: "",
      provided: 1,
    },
    {
      id: "하복바지",
      name: "하복 바지",
      price: 45000,
      size: 80,
      customization: "기장 : 34 3/4",
      provided: 1,
    },
    {
      id: "하복체육복상의",
      name: "하복 체육복 상의",
      price: 40000,
      size: 100,
      customization: "지원제외품목",
      provided: 0,
    },
    {
      id: "하복체육복하의",
      name: "하복 체육복 하의",
      price: 40000,
      size: 100,
      customization: "지원제외품목",
      provided: 0,
    },
  ],
};

export default function MeasurementSheet() {
  const [season, setSeason] = useState<"동복" | "하복">("동복");
  const [counts, setCounts] = useState<Record<string, number>>({});

  const updateCount = useCallback((itemId: string, delta: number) => {
    setCounts((prev) => ({
      ...prev,
      [itemId]: Math.max(0, (prev[itemId] || 0) + delta),
    }));
  }, []);

  const currentItems = useMemo(() => UNIFORM_ITEMS[season], [season]);

  return (
    <div className="fixed bottom-0 left-0 bg-white w-full rounded-t-md h-5/6 overflow-y-auto">
      {/* 학생 정보 */}
      <StudentInfo />

      {/* 채촌 정보 */}
      <MeasurementInfo />

      {/* 사이즈 섹션 */}
      <SizeSection
        season={season}
        setSeason={setSeason}
        items={currentItems}
        counts={counts}
        updateCount={updateCount}
      />
    </div>
  );
}

/* ------------------ 분리된 UI 섹션 ------------------ */

const StudentInfo = () => (
  <div className="border-b-8 border-black/5 p-6">
    <p className="text-xs text-gray-600 pb-3.5">
      청주고등학교 측정 마감일 : 26/01/26
    </p>
    <div className="flex justify-between gap-8">
      <div className="space-y-1 text-sm">
        <p>
          <span className="text-gray-600">출신학교</span> 솔밭중학교 →
          <span className="text-gray-600 ml-2">입학학교</span> 청주고등학교
          (26년 신입)
        </p>
        <p>
          <span className="text-gray-600">학생이름</span> 김인철 (남)
          <span className="text-gray-600 ml-4">연락처</span> 010-5571-8239 |
          010-5571-8233
        </p>
      </div>
      <ul className="text-xs text-gray-600 space-y-0.5">
        {[
          "예약 시간 : 25/01/12 15:00",
          "접수 시간 : 25/01/12 15:00",
          "측정 시작 : 25/01/12 15:00",
          "측정 완료 : -",
        ].map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ul>
    </div>
  </div>
);

const MeasurementInfo = () => (
  <div className="border-b-8 border-black/5 p-6">
    <p className="text-xs text-gray-600 pb-2">채촌정보</p>
    <div className="grid grid-cols-4 gap-2">
      {["172cm", "90kg", "44cm", "32inch"].map((info, i) => (
        <div
          key={i}
          className="bg-gray-50 py-2 px-3 rounded-full border border-gray-300 text-center text-sm"
        >
          {info}
        </div>
      ))}
    </div>
  </div>
);

interface SizeSectionProps {
  season: "동복" | "하복";
  setSeason: (s: "동복" | "하복") => void;
  items: (typeof UNIFORM_ITEMS)["동복"];
  counts: Record<string, number>;
  updateCount: (id: string, delta: number) => void;
}

const SizeSection = ({
  season,
  setSeason,
  items,
  counts,
  updateCount,
}: SizeSectionProps) => (
  <div className="border-b-8 border-black/5 p-6">
    <p className="text-xs text-gray-600 pb-3.5">사이즈</p>

    {/* 탭 */}
    <div className="flex border-b mb-4">
      {(["동복", "하복"] as const).map((tab) => (
        <button
          key={tab}
          className={`flex-1 pb-2 text-center font-medium transition-colors ${
            season === tab
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-400 hover:text-gray-600"
          }`}
          onClick={() => setSeason(tab)}
        >
          {tab}
        </button>
      ))}
    </div>

    {/* 헤더 (8열로 변경) */}
    <div className="grid grid-cols-8 gap-2 text-xs text-center font-semibold bg-gray-50 py-2 rounded">
      {[
        "품목",
        "가격",
        "확정 사이즈",
        "맞춤",
        "지원개수",
        "구입개수",
        "총 개수",
        "비고",
      ].map((h) => (
        <div key={h}>{h}</div>
      ))}
    </div>

    {/* 품목 리스트 */}
    {items.map((item) => {
      const purchaseCount = counts[item.id] || 0;
      const totalCount = item.provided + purchaseCount;

      return (
        <div
          key={item.id}
          className="grid grid-cols-8 gap-2 py-3 text-sm border-b items-center hover:bg-gray-50"
        >
          <div className="text-left font-medium">{item.name}</div>
          <div className="text-xs text-gray-500">
            {item.price.toLocaleString()}원
          </div>
          <div className="text-center">{item.size}</div>
          <div className="text-center text-xs text-gray-500">
            {item.customization || "-"}
          </div>
          <div className="text-center font-medium">{item.provided}</div>
          <div className="flex items-center justify-center gap-1">
            <CountButton onClick={() => updateCount(item.id, -1)}>
              -
            </CountButton>
            <span className="w-6 text-center font-medium">{purchaseCount}</span>
            <CountButton onClick={() => updateCount(item.id, 1)}>+</CountButton>
          </div>
          <div className="text-center font-semibold">{totalCount}</div>
          <div className="text-center text-gray-400">-</div>
        </div>
      );
    })}
  </div>
);

const CountButton = ({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 active:bg-gray-300"
    onClick={onClick}
  >
    {children}
  </button>
);
