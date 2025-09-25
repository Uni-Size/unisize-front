import { useState, useRef } from "react";

const data = {
  동복: [
    { item: "자켓", size: 95, count: 1 },
    { item: "니트조끼", size: 95, count: 1 },
    { item: "블라우스", size: 100, count: 2 },
    { item: "치마", size: 72, count: 1 },
    { item: "바지", size: 80, count: 0 },
    { item: "체육복 상의", size: 100, count: 0 },
    { item: "체육복 하의", size: 100, count: 0 },
  ],
  하복: [
    { item: "반팔셔츠", size: 95, count: 2 },
    { item: "반바지", size: 78, count: 1 },
    { item: "치마", size: 72, count: 1 },
    { item: "니트조끼", size: 95, count: 0 },
    { item: "체육복 반팔", size: 100, count: 0 },
    { item: "체육복 반바지", size: 100, count: 0 },
  ],
};

export default function StepWaiting({
  formData = {
    admissionSchool: "○○고등학교",
    name: "홍길동",
  },
}) {
  const [activeTab, setActiveTab] = useState("동복");
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const containerRef = useRef(null);

  const tabs = ["동복", "하복"];

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && activeTab === "동복") {
      setActiveTab("하복");
    }
    if (isRightSwipe && activeTab === "하복") {
      setActiveTab("동복");
    }
  };

  const TableView = ({ season, data }) => (
    <div className="w-full">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg mb-4">
        <h3 className="text-lg font-bold text-gray-800 text-center">
          {season}
        </h3>
      </div>

      <div className="space-y-2">
        {data.map((row, idx) => (
          <div
            key={idx}
            className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-gray-800 text-sm">
                  {row.item}
                </h4>
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
          {formData.admissionSchool} {formData.name}
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
        {tabs.map((tab, index) => (
          <div
            key={tab}
            className={`w-2 h-2 rounded-full transition-colors duration-200 ${
              activeTab === tab ? "bg-blue-600" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
