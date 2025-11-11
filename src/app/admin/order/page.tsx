"use client";

import { useState } from "react";

interface InventoryItem {
  itemName: string;
  sizes: {
    [size: string]: number;
  };
}

export default function OrderPage() {
  const [schoolName, setSchoolName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("동복");

  // 사이즈 목록
  const clothingSizes = ["85", "90", "95", "100", "105", "110", "115", "120", "125", "130", "135"];
  const accessorySizes = ["S", "M", "L", "XL", "FREE"];

  // 품목별 초기 데이터
  const [inventory, setInventory] = useState<InventoryItem[]>([
    {
      itemName: "자켓",
      sizes: clothingSizes.reduce((acc, size) => ({ ...acc, [size]: 0 }), {}),
    },
    {
      itemName: "조끼",
      sizes: clothingSizes.reduce((acc, size) => ({ ...acc, [size]: 0 }), {}),
    },
    {
      itemName: "블라우스",
      sizes: clothingSizes.reduce((acc, size) => ({ ...acc, [size]: 0 }), {}),
    },
    {
      itemName: "치마",
      sizes: clothingSizes.reduce((acc, size) => ({ ...acc, [size]: 0 }), {}),
    },
    {
      itemName: "바지",
      sizes: clothingSizes.reduce((acc, size) => ({ ...acc, [size]: 0 }), {}),
    },
    {
      itemName: "와이셔츠",
      sizes: clothingSizes.reduce((acc, size) => ({ ...acc, [size]: 0 }), {}),
    },
    {
      itemName: "넥타이",
      sizes: { FREE: 0 },
    },
    {
      itemName: "리본",
      sizes: { FREE: 0 },
    },
    {
      itemName: "양말",
      sizes: { FREE: 0 },
    },
    {
      itemName: "체육복 상의",
      sizes: accessorySizes.reduce((acc, size) => ({ ...acc, [size]: 0 }), {}),
    },
    {
      itemName: "체육복 하의",
      sizes: accessorySizes.reduce((acc, size) => ({ ...acc, [size]: 0 }), {}),
    },
  ]);

  const updateQuantity = (itemIndex: number, size: string, value: number) => {
    const newInventory = [...inventory];
    newInventory[itemIndex].sizes[size] = value;
    setInventory(newInventory);
  };

  const addItem = () => {
    setInventory([
      ...inventory,
      {
        itemName: "새 품목",
        sizes: clothingSizes.reduce((acc, size) => ({ ...acc, [size]: 0 }), {}),
      },
    ]);
  };

  const removeItem = (index: number) => {
    setInventory(inventory.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    console.log("주문 등록:", { schoolName, selectedCategory, inventory });
    alert("주문이 등록되었습니다!");
  };

  const handleReset = () => {
    setSchoolName("");
    setSelectedCategory("동복");
    setInventory(
      inventory.map((item) => ({
        ...item,
        sizes: Object.keys(item.sizes).reduce(
          (acc, size) => ({ ...acc, [size]: 0 }),
          {}
        ),
      }))
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* 등록 정보 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">주문 등록</h2>

        <div className="grid grid-cols-12 gap-4 mb-4">
          <div className="col-span-2 flex items-center justify-center bg-gray-100 rounded font-medium text-gray-700">
            학교명
          </div>
          <div className="col-span-10">
            <input
              type="text"
              placeholder="학교명을 입력하세요"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded"
            />
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4 mb-4">
          <div className="col-span-2 flex items-center justify-center bg-gray-100 rounded font-medium text-gray-700">
            분류
          </div>
          <div className="col-span-10 flex gap-4">
            {["동복", "하복", "용품"].map((category) => (
              <label key={category} className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={selectedCategory === category}
                  onChange={() => setSelectedCategory(category)}
                  className="w-4 h-4"
                />
                <span className="text-gray-700">{category}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* 재고 입력 테이블 */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-bold">재고 입력</h3>
          <button
            onClick={addItem}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
          >
            + 품목 추가
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-3 py-2 text-center font-medium text-gray-700 sticky left-0 bg-gray-100 z-10">
                  품목
                </th>
                {clothingSizes.map((size) => (
                  <th
                    key={size}
                    className="border px-3 py-2 text-center font-medium text-gray-700"
                  >
                    {size}
                  </th>
                ))}
                <th className="border px-3 py-2 text-center font-medium text-gray-700">
                  FREE
                </th>
                <th className="border px-3 py-2 text-center font-medium text-gray-700 bg-gray-100">
                  삭제
                </th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item, itemIndex) => (
                <tr key={itemIndex} className="hover:bg-gray-50">
                  <td className="border px-3 py-2 sticky left-0 bg-white z-10">
                    <input
                      type="text"
                      value={item.itemName}
                      onChange={(e) => {
                        const newInventory = [...inventory];
                        newInventory[itemIndex].itemName = e.target.value;
                        setInventory(newInventory);
                      }}
                      className="w-full px-2 py-1 border rounded"
                    />
                  </td>
                  {clothingSizes.map((size) => (
                    <td key={size} className="border px-2 py-2">
                      <input
                        type="number"
                        min="0"
                        value={item.sizes[size] || 0}
                        onChange={(e) =>
                          updateQuantity(
                            itemIndex,
                            size,
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-full px-2 py-1 border rounded text-center"
                      />
                    </td>
                  ))}
                  <td className="border px-2 py-2">
                    <input
                      type="number"
                      min="0"
                      value={item.sizes["FREE"] || 0}
                      onChange={(e) =>
                        updateQuantity(
                          itemIndex,
                          "FREE",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-full px-2 py-1 border rounded text-center"
                    />
                  </td>
                  <td className="border px-3 py-2 text-center bg-white">
                    <button
                      onClick={() => removeItem(itemIndex)}
                      className="text-red-600 hover:text-red-800 font-bold"
                      disabled={inventory.length === 1}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex justify-center gap-3">
        <button
          onClick={handleSubmit}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          등록
        </button>
        <button
          onClick={handleReset}
          className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
        >
          초기화
        </button>
      </div>
    </div>
  );
}
