"use client";

import { useStudentResponseStore } from "@/stores/useStudentResponseStore";
import Image from "next/image";
import { useState } from "react";

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

  const tabs: ("동복" | "하복")[] = ["동복", "하복"];

  // 디버깅 로그
  console.log("=== Waiting 페이지 렌더링 ===");
  console.log("studentData:", studentData);
  console.log("전체 store 상태:", useStudentResponseStore.getState());

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
    <div className="w-full bg-primary-50 p-4 rounded-lg subhead-line  ">
      <h3 className="callout mb-6">{season}</h3>

      <div className="">
        {/* 테이블 헤더 */}
        <div className="grid grid-cols-3 pb-2 text-gray-600 border-b text-center border-gray-300">
          <div>품목</div>
          <div>추천사이즈</div>
          <div>지원개수</div>
        </div>

        {/* 테이블 바디 */}
        {tableData.map((row, idx) => (
          <div key={idx} className="grid grid-cols-3 py-2 text-center">
            <div>
              <div>{row.item}</div>
              {row.selectableWith && row.selectableWith.length > 0 && (
                <div className="text-xs text-primary-600 mt-1">
                  {row.selectableWith.join(", ")}로 변경 가능
                </div>
              )}
            </div>
            <div>{row.size}</div>
            <div>
              {row.count === 0 ? (
                <p className="text-xs text-primary-600 ">지원제외품목</p>
              ) : (
                row.count
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <section>
      {/* 헤더 */}
      <div className="text-center m-6">
        <p className="headline ">잠시만 기다려주세요.</p>
        <h2 className="title2 my-2">
          {studentData.school_name} {studentData.name}
        </h2>
        <p className="title3 text-gray-700">교복 시착을 준비해드리겠습니다.</p>
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
      <div className="relative overflow-hidden w-full">
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{
            transform: `translateX(-${tabs.indexOf(activeTab) * 100}%)`,
          }}
        >
          {tabs.map((season) => (
            <div key={season} className="w-full flex-shrink-0">
              <TableView season={season} data={data[season]} />
            </div>
          ))}
        </div>
      </div>

      <article className="mt-8">
        <h3 className="headline text-gray-800 mb-4">
          {activeTab}과 함께 입을만한 상품
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {itemData[activeTab].map((product, idx) => (
            <a
              key={idx}
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-gradient-to-r rounded-lg hover:shadow-md transition-shadow duration-200"
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
