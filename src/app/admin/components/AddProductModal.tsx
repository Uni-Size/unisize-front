"use client";

import { useState } from "react";

export interface AddProductFormData {
  school_name: string;
  year: number;
  name: string;
  category: string;
  gender: string;
  season: string;
  price: number;
  display_name: string;
  quantity: number;
  is_selectable: boolean;
  selectable_with?: string[];
  description?: string;
}

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddProductFormData) => void;
  isLoading?: boolean;
}

export default function AddProductModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: AddProductModalProps) {
  const currentYear = new Date().getFullYear();

  const [formData, setFormData] = useState<AddProductFormData>({
    school_name: "",
    year: currentYear,
    name: "",
    category: "상의",
    gender: "U",
    season: "all",
    price: 0,
    display_name: "",
    quantity: 1,
    is_selectable: true,
    selectable_with: [],
    description: "",
  });

  const [selectableWithInput, setSelectableWithInput] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleReset = () => {
    setFormData({
      school_name: "",
      year: currentYear,
      name: "",
      category: "상의",
      gender: "U",
      season: "all",
      price: 0,
      display_name: "",
      quantity: 1,
      is_selectable: true,
      selectable_with: [],
      description: "",
    });
    setSelectableWithInput("");
  };

  const handleAddSelectableWith = () => {
    if (selectableWithInput.trim()) {
      setFormData({
        ...formData,
        selectable_with: [
          ...(formData.selectable_with || []),
          selectableWithInput.trim(),
        ],
      });
      setSelectableWithInput("");
    }
  };

  const handleRemoveSelectableWith = (index: number) => {
    setFormData({
      ...formData,
      selectable_with: formData.selectable_with?.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="sticky top-0 bg-gray-50 border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">제품 단일 추가</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={isLoading}
            >
              ✕
            </button>
          </div>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 학교 정보 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                학교명 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.school_name}
                onChange={(e) =>
                  setFormData({ ...formData, school_name: e.target.value })
                }
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="예: 서울고등학교"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                년도 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                value={formData.year}
                onChange={(e) =>
                  setFormData({ ...formData, year: parseInt(e.target.value) })
                }
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 제품 정보 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                제품명 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="예: 블레이저"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                표시명 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.display_name}
                onChange={(e) =>
                  setFormData({ ...formData, display_name: e.target.value })
                }
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="예: 교복 상의"
              />
            </div>
          </div>

          {/* 카테고리, 성별, 계절 */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                카테고리 <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="상의">상의</option>
                <option value="하의">하의</option>
                <option value="신발">신발</option>
                <option value="기타">기타</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                성별 <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.gender}
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value })
                }
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="U">공용</option>
                <option value="M">남성</option>
                <option value="F">여성</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                계절 <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.season}
                onChange={(e) =>
                  setFormData({ ...formData, season: e.target.value })
                }
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">사계절</option>
                <option value="winter">동복</option>
                <option value="summer">하복</option>
              </select>
            </div>
          </div>

          {/* 가격, 수량 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                가격 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: parseInt(e.target.value) })
                }
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                수량 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    quantity: parseInt(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 선택 가능 여부 */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_selectable}
                onChange={(e) =>
                  setFormData({ ...formData, is_selectable: e.target.checked })
                }
                className="w-4 h-4 cursor-pointer"
              />
              <span className="text-sm font-medium text-gray-700">
                선택 가능한 제품
              </span>
            </label>
          </div>

          {/* 선택 가능한 다른 제품 */}
          {formData.is_selectable && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                선택 가능한 다른 제품명
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={selectableWithInput}
                  onChange={(e) => setSelectableWithInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSelectableWith();
                    }
                  }}
                  className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="제품명 입력 후 추가"
                />
                <button
                  type="button"
                  onClick={handleAddSelectableWith}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  추가
                </button>
              </div>
              {formData.selectable_with && formData.selectable_with.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.selectable_with.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded"
                    >
                      <span className="text-sm">{item}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSelectableWith(index)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 설명 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              설명
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="제품에 대한 추가 설명 (선택사항)"
            />
          </div>
        </form>

        {/* 푸터 버튼 */}
        <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            disabled={isLoading}
            className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            초기화
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "등록 중..." : "등록"}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
