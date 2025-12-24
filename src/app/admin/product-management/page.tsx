"use client";

import { useState } from "react";
import { useProducts } from "@/hooks/useProductManagement";
import type { GetProductsParams } from "@/api/productApi";

export default function ProductManagementPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [category, setCategory] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [activeOnly, setActiveOnly] = useState<boolean>(false);

  // 검색 임시 상태 (입력 중인 값)
  const [tempSearch, setTempSearch] = useState<string>("");

  // Query 파라미터 구성
  const queryParams: GetProductsParams = {
    page: currentPage,
    limit,
    ...(category && { category }),
    ...(gender && { gender }),
    ...(search && { search }),
    active_only: activeOnly,
  };

  // TanStack Query를 사용한 데이터 fetching
  const { data, isLoading, error } = useProducts(queryParams);

  // 응답 데이터 추출
  const products = data?.products || [];
  const total = data?.total || 0;
  const totalPages = data?.total_pages || 1;

  // 검색 실행
  const handleSearch = () => {
    setSearch(tempSearch);
    setCurrentPage(1); // 검색 시 첫 페이지로 이동
  };

  // 검색 초기화
  const handleReset = () => {
    setTempSearch("");
    setSearch("");
    setCategory("");
    setGender("");
    setActiveOnly(false);
    setCurrentPage(1);
  };

  // 페이지 변경
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // 페이지네이션 버튼 생성
  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex justify-center items-center gap-2 mt-6">
        <button
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
        >
          «
        </button>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
        >
          ‹
        </button>

        {pages.map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`px-3 py-1 border rounded ${
              currentPage === page
                ? "bg-blue-600 text-white"
                : "hover:bg-gray-100"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
        >
          ›
        </button>
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
        >
          »
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* 헤더 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">상품 관리</h2>
          <div className="text-sm text-gray-600">
            총 <span className="font-bold text-blue-600">{total}</span>개
          </div>
        </div>

        {/* 필터 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              카테고리
            </label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">전체</option>
              <option value="상의">상의</option>
              <option value="하의">하의</option>
              <option value="신발">신발</option>
              <option value="기타">기타</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              성별
            </label>
            <select
              value={gender}
              onChange={(e) => {
                setGender(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">전체</option>
              <option value="M">남성</option>
              <option value="F">여성</option>
              <option value="U">공용</option>
            </select>
          </div>

          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              검색
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tempSearch}
                onChange={(e) => setTempSearch(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                placeholder="상품명으로 검색"
                className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                검색
              </button>
            </div>
          </div>

          <div className="flex items-end gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={activeOnly}
                onChange={(e) => {
                  setActiveOnly(e.target.checked);
                  setCurrentPage(1);
                }}
                className="w-4 h-4 cursor-pointer"
              />
              <span className="text-sm font-medium text-gray-700">
                활성 상품만
              </span>
            </label>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              초기화
            </button>
          </div>
        </div>
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">로딩 중...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">
            데이터를 불러오는데 실패했습니다.
          </div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            상품이 없습니다.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border px-4 py-3 text-center font-medium text-gray-700">
                      번호
                    </th>
                    <th className="border px-4 py-3 text-center font-medium text-gray-700">
                      상품명
                    </th>
                    <th className="border px-4 py-3 text-center font-medium text-gray-700">
                      카테고리
                    </th>
                    <th className="border px-4 py-3 text-center font-medium text-gray-700">
                      성별
                    </th>
                    <th className="border px-4 py-3 text-center font-medium text-gray-700">
                      시즌
                    </th>
                    <th className="border px-4 py-3 text-center font-medium text-gray-700">
                      가격
                    </th>
                    <th className="border px-4 py-3 text-center font-medium text-gray-700">
                      상태
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, index) => {
                    // 성별 한글 변환
                    const getGenderText = (gender: string) => {
                      if (gender === "male" || gender === "M") return "남";
                      if (gender === "female" || gender === "F") return "여";
                      return "공용";
                    };

                    // 시즌 한글 변환
                    const getSeasonText = (season?: string) => {
                      if (!season) return "-";
                      if (season === "winter") return "동복";
                      if (season === "summer") return "하복";
                      return "사계절";
                    };

                    return (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="border px-4 py-3 text-center">
                          {(currentPage - 1) * limit + index + 1}
                        </td>
                        <td className="border px-4 py-3 font-medium">
                          {product.name}
                        </td>
                        <td className="border px-4 py-3 text-center">
                          {product.category}
                        </td>
                        <td className="border px-4 py-3 text-center">
                          {getGenderText(product.gender)}
                        </td>
                        <td className="border px-4 py-3 text-center">
                          {getSeasonText(product.season)}
                        </td>
                        <td className="border px-4 py-3 text-right">
                          {product.price.toLocaleString()}원
                        </td>
                        <td className="border px-4 py-3 text-center">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              product.is_active
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {product.is_active ? "활성" : "비활성"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && renderPagination()}
          </>
        )}
      </div>

      {/* 페이지 정보 */}
      {!isLoading && products.length > 0 && (
        <div className="mt-4 text-center text-sm text-gray-600">
          {currentPage} / {totalPages} 페이지 (전체 {total}개)
        </div>
      )}
    </div>
  );
}
