"use client";

import { useState, useEffect } from "react";
import { usePendingStaff, useApproveStaff, useBulkApproveStaff, useStaffList, useResetStaffPassword } from "@/hooks/useStaffManagement";

type TabType = "pending" | "staff";

export default function StaffManagementPage() {
  const [activeTab, setActiveTab] = useState<TabType>("pending");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // TanStack Query를 사용한 데이터 fetching
  const { data: pendingData, isLoading: isPendingLoading } = usePendingStaff(currentPage, limit);
  const { data: staffData, isLoading: isStaffLoading } = useStaffList(currentPage, limit);

  // 현재 탭에 따라 데이터 선택
  const data = activeTab === "pending" ? pendingData : staffData;
  const isLoading = activeTab === "pending" ? isPendingLoading : isStaffLoading;

  // Mutations
  const approveMutation = useApproveStaff();
  const bulkApproveMutation = useBulkApproveStaff();
  const resetPasswordMutation = useResetStaffPassword();

  // 응답 데이터 추출
  const staffList = data?.data?.users || [];
  const total = data?.data?.total || 0;
  const totalPages = data?.meta?.total_pages || 1;

  // 탭 변경 시 페이지와 선택 항목 초기화
  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds([]);
  }, [activeTab]);

  useEffect(() => {
    setSelectedIds([]);
  }, [currentPage]);

  // 개별 선택/해제
  const handleSelectOne = (staffId: number, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, staffId]);
    } else {
      setSelectedIds(selectedIds.filter((id) => id !== staffId));
    }
  };

  // 일괄 승인 처리
  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) {
      alert("승인할 스태프를 선택해주세요.");
      return;
    }

    if (!confirm(`선택한 ${selectedIds.length}명의 스태프를 승인하시겠습니까?`)) return;

    try {
      await bulkApproveMutation.mutateAsync(selectedIds);
      alert("승인되었습니다.");
      setSelectedIds([]);
    } catch (error) {
      console.error("Failed to bulk approve staff:", error);
      alert("승인에 실패했습니다.");
    }
  };

  // 승인 처리 (단일)
  const handleApprove = async (staffId: number) => {
    if (!confirm("이 스태프를 승인하시겠습니까?")) return;

    try {
      await approveMutation.mutateAsync(staffId);
      alert("승인되었습니다.");
    } catch (error) {
      console.error("Failed to approve staff:", error);
      alert("승인에 실패했습니다.");
    }
  };

  // 비밀번호 초기화 처리
  const handleResetPassword = async (employeeId: string) => {
    if (!confirm(`직원 ID: ${employeeId}\n비밀번호를 초기화하시겠습니까?\n(초기화된 비밀번호는 직원 ID와 동일합니다)`)) return;

    try {
      await resetPasswordMutation.mutateAsync(employeeId);
      alert("비밀번호가 초기화되었습니다.");
    } catch (error) {
      console.error("Failed to reset password:", error);
      alert("비밀번호 초기화에 실패했습니다.");
    }
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
        {/* 탭 */}
        <div className="flex gap-2 mb-4 border-b">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "pending"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            승인대기 리스트
          </button>
          <button
            onClick={() => setActiveTab("staff")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "staff"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            스태프 리스트
          </button>
        </div>

        {/* 헤더 정보 */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {activeTab === "pending" ? "스태프 대기 목록" : "스태프 목록"}
          </h2>
          <div className="flex items-center gap-4">
            {activeTab === "pending" && selectedIds.length > 0 && (
              <button
                onClick={handleBulkApprove}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium"
              >
                선택한 {selectedIds.length}명 승인
              </button>
            )}
            <div className="text-sm text-gray-600">
              총 <span className="font-bold text-blue-600">{total}</span>명
            </div>
          </div>
        </div>
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">로딩 중...</div>
        ) : staffList.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {activeTab === "pending" ? "대기 중인 스태프가 없습니다." : "등록된 스태프가 없습니다."}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    {activeTab === "pending" && (
                      <th className="border px-4 py-3 text-center font-medium text-gray-700">
                        선택
                      </th>
                    )}
                    <th className="border px-4 py-3 text-center font-medium text-gray-700">
                      번호
                    </th>
                    <th className="border px-4 py-3 text-center font-medium text-gray-700">
                      직원ID
                    </th>
                    <th className="border px-4 py-3 text-center font-medium text-gray-700">
                      이름
                    </th>
                    <th className="border px-4 py-3 text-center font-medium text-gray-700">
                      성별
                    </th>
                    <th className="border px-4 py-3 text-center font-medium text-gray-700">
                      역할
                    </th>
                    <th className="border px-4 py-3 text-center font-medium text-gray-700">
                      {activeTab === "pending" ? "신청일" : "등록일"}
                    </th>
                    <th className="border px-4 py-3 text-center font-medium text-gray-700">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {staffList.map((staff, index) => (
                    <tr key={staff.id} className="hover:bg-gray-50">
                      {activeTab === "pending" && (
                        <td className="border px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(staff.id)}
                            onChange={(e) => handleSelectOne(staff.id, e.target.checked)}
                            className="w-4 h-4 cursor-pointer"
                          />
                        </td>
                      )}
                      <td className="border px-4 py-3 text-center">
                        {(currentPage - 1) * limit + index + 1}
                      </td>
                      <td className="border px-4 py-3 text-center">
                        {staff.employee_id}
                      </td>
                      <td className="border px-4 py-3 text-center font-medium">
                        {staff.employee_name}
                      </td>
                      <td className="border px-4 py-3 text-center">
                        {staff.gender === "M" ? "남" : "여"}
                      </td>
                      <td className="border px-4 py-3 text-center">
                        <span className="px-2 py-1 bg-gray-200 rounded text-xs">
                          {staff.role}
                        </span>
                      </td>
                      <td className="border px-4 py-3 text-center text-gray-600">
                        {staff.created_at}
                      </td>
                      <td className="border px-4 py-3 text-center">
                        {activeTab === "pending" ? (
                          <button
                            onClick={() => handleApprove(staff.id)}
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                          >
                            승인
                          </button>
                        ) : (
                          <button
                            onClick={() => handleResetPassword(staff.employee_id)}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                          >
                            비밀번호 초기화
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && renderPagination()}
          </>
        )}
      </div>

      {/* 페이지 정보 */}
      {!isLoading && staffList.length > 0 && (
        <div className="mt-4 text-center text-sm text-gray-600">
          {currentPage} / {totalPages} 페이지 (전체 {total}명)
        </div>
      )}
    </div>
  );
}
