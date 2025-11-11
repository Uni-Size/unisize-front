"use client";

import { useState } from "react";

interface AdditionalPurchaseSlideProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (items: AdditionalItem[]) => void;
  studentName: string;
}

interface AdditionalItem {
  category: string;
  name: string;
  color?: string;
  size?: string;
  quantity: number;
  memo?: string;
}

export default function AdditionalPurchaseSlide({
  isOpen,
  onClose,
  onSubmit,
  studentName,
}: AdditionalPurchaseSlideProps) {
  const [items, setItems] = useState<AdditionalItem[]>([
    { category: "", name: "", color: "", size: "", quantity: 1, memo: "" },
  ]);

  const addRow = () => {
    setItems([
      ...items,
      { category: "", name: "", color: "", size: "", quantity: 1, memo: "" },
    ]);
  };

  const removeRow = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof AdditionalItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = () => {
    onSubmit(items);
    setItems([{ category: "", name: "", color: "", size: "", quantity: 1, memo: "" }]);
  };

  return (
    <div
      className={`fixed inset-x-0 top-0 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-[60] ${
        isOpen ? "translate-y-0" : "-translate-y-full"
      }`}
      style={{ maxHeight: "80vh" }}
    >
      <div className="h-full flex flex-col">
        {/* 헤더 */}
        <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">추가 구매 - {studentName}</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* 컨텐츠 */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-4 flex justify-between items-center">
              <h3 className="font-bold text-gray-700">추가 구매 항목</h3>
              <button
                onClick={addRow}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
              >
                + 항목 추가
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-3 text-left font-medium border">품목</th>
                    <th className="py-3 px-3 text-left font-medium border">품명</th>
                    <th className="py-3 px-3 text-left font-medium border">색상</th>
                    <th className="py-3 px-3 text-left font-medium border">사이즈</th>
                    <th className="py-3 px-3 text-center font-medium border">수량</th>
                    <th className="py-3 px-3 text-left font-medium border">비고</th>
                    <th className="py-3 px-3 text-center font-medium border">삭제</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td className="py-2 px-2 border">
                        <input
                          type="text"
                          value={item.category}
                          onChange={(e) =>
                            updateItem(index, "category", e.target.value)
                          }
                          className="w-full px-2 py-1 border rounded"
                          placeholder="예: 양말"
                        />
                      </td>
                      <td className="py-2 px-2 border">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) =>
                            updateItem(index, "name", e.target.value)
                          }
                          className="w-full px-2 py-1 border rounded"
                          placeholder="상세 품명"
                        />
                      </td>
                      <td className="py-2 px-2 border">
                        <input
                          type="text"
                          value={item.color}
                          onChange={(e) =>
                            updateItem(index, "color", e.target.value)
                          }
                          className="w-full px-2 py-1 border rounded"
                          placeholder="색상"
                        />
                      </td>
                      <td className="py-2 px-2 border">
                        <input
                          type="text"
                          value={item.size}
                          onChange={(e) =>
                            updateItem(index, "size", e.target.value)
                          }
                          className="w-full px-2 py-1 border rounded"
                          placeholder="사이즈"
                        />
                      </td>
                      <td className="py-2 px-2 border">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(index, "quantity", parseInt(e.target.value) || 1)
                          }
                          className="w-full px-2 py-1 border rounded text-center"
                          min="1"
                        />
                      </td>
                      <td className="py-2 px-2 border">
                        <input
                          type="text"
                          value={item.memo}
                          onChange={(e) =>
                            updateItem(index, "memo", e.target.value)
                          }
                          className="w-full px-2 py-1 border rounded"
                          placeholder="메모"
                        />
                      </td>
                      <td className="py-2 px-2 border text-center">
                        <button
                          onClick={() => removeRow(index)}
                          className="text-red-600 hover:text-red-800 font-bold"
                          disabled={items.length === 1}
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={handleSubmit}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                추가하기
              </button>
              <button
                onClick={onClose}
                className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
