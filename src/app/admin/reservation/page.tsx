"use client";

import { useState } from "react";

interface SizeQuantity {
  [size: string]: string[]; // 학생 이름들
}

interface SchoolData {
  schoolName: string;
  items: {
    [itemName: string]: SizeQuantity;
  };
}

export default function ReservationPage() {
  const [schoolSearch, setSchoolSearch] = useState("");
  const [selectedItems, setSelectedItems] = useState({
    전체: true,
    자켓: false,
    조끼: false,
    블라우스: false,
  });

  // 사이즈 목록
  const sizes = [
    "85 (5)",
    "90 (4)",
    "95 (4)",
    "100 (4)",
    "105 (4)",
    "110 (4)",
    "115 (4)",
    "120 (4)",
    "125 (4)",
    "130 (4)",
    "135 (4)",
  ];

  // 샘플 데이터
  const schoolData: SchoolData = {
    schoolName: "용성중학교",
    items: {
      자켓: {
        "85 (5)": ["가나다"],
        "90 (4)": ["가나다"],
        "95 (4)": ["가나다"],
        "100 (4)": ["가나다"],
        "105 (4)": ["1"],
        "110 (4)": ["1"],
        "115 (4)": ["1"],
        "120 (4)": ["1"],
        "125 (4)": ["1"],
        "130 (4)": ["1"],
        "135 (4)": ["-"],
      },
      조끼: {
        "85 (5)": ["가나다"],
        "90 (4)": ["가나다"],
        "95 (4)": ["가나다"],
        "100 (4)": ["가나다"],
        "105 (4)": ["1"],
        "110 (4)": ["1"],
        "115 (4)": ["1"],
        "120 (4)": ["1"],
        "125 (4)": [""],
        "130 (4)": ["1"],
        "135 (4)": [],
      },
      블라우스: {
        "85 (5)": ["-"],
        "90 (4)": ["가나다"],
        "95 (4)": [],
        "100 (4)": ["가나다"],
        "105 (4)": ["1"],
        "110 (4)": ["1"],
        "115 (4)": ["1"],
        "120 (4)": ["1"],
        "125 (4)": [],
        "130 (4)": ["1"],
        "135 (4)": [],
      },
      치마: {
        "85 (5)": ["-"],
        "90 (4)": ["가나다"],
        "95 (4)": [],
        "100 (4)": ["가나다"],
        "105 (4)": ["1"],
        "110 (4)": ["1"],
        "115 (4)": ["1"],
        "120 (4)": ["1"],
        "125 (4)": [],
        "130 (4)": [],
        "135 (4)": [],
      },
      바지: {
        "85 (5)": [],
        "90 (4)": [],
        "95 (4)": [],
        "100 (4)": ["김인철"],
        "105 (4)": ["1"],
        "110 (4)": [],
        "115 (4)": [],
        "120 (4)": [],
        "125 (4)": [],
        "130 (4)": [],
        "135 (4)": [],
      },
      와이셔츠: {
        "85 (5)": [],
        "90 (4)": [],
        "95 (4)": [],
        "100 (4)": ["김인철"],
        "105 (4)": ["1"],
        "110 (4)": [],
        "115 (4)": [],
        "120 (4)": [],
        "125 (4)": [],
        "130 (4)": [],
        "135 (4)": [],
      },
      넥타이: {
        "85 (5)": [],
        "90 (4)": [],
        "95 (4)": [],
        "100 (4)": [],
        "105 (4)": ["1"],
        "110 (4)": [],
        "115 (4)": [],
        "120 (4)": [],
        "125 (4)": [],
        "130 (4)": [],
        "135 (4)": [],
      },
      리본: {
        "85 (5)": [],
        "90 (4)": [],
        "95 (4)": [],
        "100 (4)": [],
        "105 (4)": ["1"],
        "110 (4)": [],
        "115 (4)": [],
        "120 (4)": [],
        "125 (4)": [],
        "130 (4)": [],
        "135 (4)": [],
      },
    },
  };

  const handleItemToggle = (item: string) => {
    if (item === "전체") {
      setSelectedItems({
        전체: true,
        자켓: false,
        조끼: false,
        블라우스: false,
      });
    } else {
      setSelectedItems({
        ...selectedItems,
        전체: false,
        [item]: !selectedItems[item as keyof typeof selectedItems],
      });
    }
  };

  const handleReset = () => {
    setSchoolSearch("");
    setSelectedItems({
      전체: true,
      자켓: false,
      조끼: false,
      블라우스: false,
    });
  };

  // 집계 계산
  const calculateSummary = () => {
    const summary: { [size: string]: { reserved: number; total: number } } = {};

    sizes.forEach((size) => {
      const match = size.match(/\((\d+)\)/);
      const total = match ? parseInt(match[1]) : 0;
      let reserved = 0;

      Object.values(schoolData.items).forEach((sizeData) => {
        const students = sizeData[size] || [];
        reserved += students.filter((s) => s && s !== "-").length;
      });

      summary[size] = { reserved, total };
    });

    return summary;
  };

  const summary = calculateSummary();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* 검색 필터 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-12 gap-4 mb-4">
          <div className="col-span-2 flex items-center justify-center bg-gray-100 rounded font-medium text-gray-700">
            학교
          </div>
          <div className="col-span-10">
            <input
              type="text"
              placeholder="검색어를 입력하세요."
              value={schoolSearch}
              onChange={(e) => setSchoolSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded"
            />
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4 mb-6">
          <div className="col-span-2 flex items-center justify-center bg-gray-100 rounded font-medium text-gray-700">
            품목
          </div>
          <div className="col-span-10 flex gap-4">
            {Object.keys(selectedItems).map((item) => (
              <label key={item} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedItems[item as keyof typeof selectedItems]}
                  onChange={() => handleItemToggle(item)}
                  className="w-4 h-4"
                />
                <span className="text-gray-700">{item}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-center gap-3">
          <button className="px-8 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            검색
          </button>
          <button
            onClick={handleReset}
            className="px-8 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
          >
            조기화
          </button>
        </div>
      </div>

      {/* 예약 수량 테이블 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">{schoolData.schoolName}</h2>
          <p className="text-sm text-gray-600 mt-1">자켓</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-gray-100">
              <tr>
                {sizes.map((size) => (
                  <th
                    key={size}
                    className="border px-3 py-2 text-center font-medium text-gray-700"
                  >
                    {size}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(schoolData.items).map(([itemName, sizeData]) => (
                <tr key={itemName} className="hover:bg-gray-50">
                  {sizes.map((size) => {
                    const students = sizeData[size] || [];
                    const hasKimInChul = students.includes("김인철");

                    return (
                      <td
                        key={size}
                        className={`border px-3 py-2 text-center ${
                          hasKimInChul ? "border-red-500 border-2" : ""
                        }`}
                      >
                        {students.map((student, idx) => (
                          <div
                            key={idx}
                            className={hasKimInChul && student === "김인철" ? "text-red-600 font-medium" : ""}
                          >
                            {student || "-"}
                          </div>
                        ))}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* 집계 행 */}
              <tr className="bg-gray-50 font-medium">
                {sizes.map((size) => {
                  const data = summary[size];
                  const diff = data.reserved - data.total;
                  const sizeNumber = size.split(" ")[0];

                  return (
                    <td
                      key={size}
                      className="border px-3 py-2 text-center"
                    >
                      <div>
                        {sizeNumber} ({data.reserved}/{data.total})
                      </div>
                      {diff !== 0 && (
                        <div className={diff > 0 ? "text-red-600" : "text-blue-600"}>
                          진입 {diff}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
