"use client";

import { useStudentResponseStore } from "@/stores/useStudentResponseStore";
import Image from "next/image";
import { useState, useRef } from "react";

const itemData = {
  동복: [
    {
      item: "교복 탄성 반팔",
      url: "https://www.smartzzang.com/look/style?cate=2",
      thumbnail: "/item/2.png",
    },
    {
      item: "냄새제거 스타킹",
      url: "https://www.smartzzang.com/look/style?cate=1",
      thumbnail: "/item/1.png",
    },
    {
      item: "속바지",
      url: "https://www.smartzzang.com/look/style?cate=3",
      thumbnail: "/item/3.png",
    },
  ],
  하복: [
    {
      item: "교복 탄성 반팔",
      url: "https://www.smartzzang.com/look/style?cate=2",
      thumbnail: "/item/2.png",
    },
  ],
};

export default function WaitingPage() {
  const { studentData } = useStudentResponseStore();

  const [activeTab, setActiveTab] = useState<"동복" | "하복">("동복");
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const tabs: ("동복" | "하복")[] = ["동복", "하복"];

  // 디버깅 로그
  console.log("=== Waiting 페이지 렌더링 ===");
  console.log("studentData:", studentData);
  console.log(
    "전체 store 상태:",
    useStudentResponseStore.getState()
  );

  // API 응답 데이터가 없으면 로딩 표시
  if (!studentData) {
    console.log("=== studentData가 없음 - 로딩 표시 ===");
    return (
      <section className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6">
        <div className="text-center">
          <p className="text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </section>
    );
  }

  // API 응답 데이터를 테이블 형식으로 변환
  console.log("=== 데이터 매핑 전 ===");
  console.log("recommended_uniforms:", studentData.recommended_uniforms);
  console.log("winter:", studentData.recommended_uniforms?.winter);
  console.log("summer:", studentData.recommended_uniforms?.summer);

  const data = {
    동복:
      studentData.recommended_uniforms?.winter?.map((item) => ({
        item: item.product,
        size: item.recommended_size,
        count: item.quantity,
        selectableWith: item.selectable_with,
        gender: item.gender,
      })) || [],
    하복:
      studentData.recommended_uniforms?.summer?.map((item) => ({
        item: item.product,
        size: item.recommended_size,
        count: item.quantity,
        selectableWith: item.selectable_with,
        gender: item.gender,
      })) || [],
  };

  console.log("=== 데이터 매핑 후 ===");
  console.log("동복 data:", data.동복);
  console.log("하복 data:", data.하복);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && activeTab === "동복") setActiveTab("하복");
    if (isRightSwipe && activeTab === "하복") setActiveTab("동복");

    setTouchStart(0);
    setTouchEnd(0);
  };

  type UniformData = {
    item: string;
    size: string;
    count: number;
    selectableWith?: string[];
    gender: "male" | "female" | "unisex";
  }[];

  const TableView = ({
    season,
    data: tableData,
  }: {
    season: string;
    data: UniformData;
  }) => (
    <div className="w-full">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg mb-4">
        <h3 className="text-lg font-bold text-gray-800 text-center">
          {season}
        </h3>
      </div>

      <div className="space-y-2">
        {tableData.map((row, idx) => (
          <div
            key={idx}
            className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-gray-800 text-sm">
                  {row.item}
                </h4>
                {row.selectableWith && row.selectableWith.length > 0 && (
                  <p className="text-xs text-blue-600 mt-1">
                    {row.selectableWith.join(", ")}와 교환 가능
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-center">
                  <div className="text-xs text-gray-500 mb-1">사이즈</div>
                  <div className="font-bold text-blue-600 text-sm">
                    {row.size}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 mb-1">개수</div>
                  <div className="font-medium text-sm">
                    {row.count === 0 ? (
                      <span className="text-red-500 text-xs bg-red-50 px-2 py-1 rounded-full">
                        제외
                      </span>
                    ) : (
                      <span className="text-green-600 font-bold">
                        {row.count}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <section className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6">
      {/* 헤더 */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {studentData.school_name} {studentData.name}
        </h2>
        <p className="text-gray-600">
          교복을 입어보실 수 있도록 준비해드리겠습니다.
        </p>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === tab
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 컨텐츠 영역 */}
      <div
        ref={containerRef}
        className="relative overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{
            transform: `translateX(-${tabs.indexOf(activeTab) * 100}%)`,
          }}
        >
          {tabs.map((season) => (
            <div key={season} className="w-full flex-shrink-0 px-1">
              <TableView season={season} data={data[season]} />
            </div>
          ))}
        </div>
      </div>

      {/* 인디케이터 */}
      <div className="flex justify-center mt-4 space-x-2">
        {tabs.map((tab) => (
          <div
            key={tab}
            className={`w-2 h-2 rounded-full transition-colors duration-200 ${
              activeTab === tab ? "bg-blue-600" : "bg-gray-300"
            }`}
          />
        ))}
      </div>

      <article className="mt-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          {activeTab}과 함께 입을만한 상품
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {itemData[activeTab].map((product, idx) => (
            <a
              key={idx}
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-gradient-to-r rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
            >
              <Image
                src={product.thumbnail}
                alt={product.item}
                width={100}
                height={100}
                className="rounded-md"
              />
              <p className="flex items-center text-sm justify-between mt-2">
                {product.item}
              </p>
            </a>
          ))}
        </div>
      </article>
    </section>
  );
}
