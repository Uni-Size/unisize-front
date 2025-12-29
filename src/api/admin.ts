import { apiClient } from "@/lib/apiClient";
import type { ApiResponse } from "./auth";

// ============================================================================
// 스태프 관리 관련 타입
// ============================================================================

export interface StaffStats {
  currently_measuring: number;
  today_students_handled: number;
  total_students_handled: number;
}

export interface StaffUser {
  id: number;
  employee_id: string;
  employee_name: string;
  gender: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login: string;
  staff_stats: StaffStats;
}

export interface PendingStaffResponse {
  total: number;
  users: StaffUser[];
}

// ============================================================================
// 스태프 관리 API
// ============================================================================

/**
 * 대기 중인 스태프 목록 조회
 * GET /api/v1/admin/staff/pending
 */
export async function getPendingStaff(page: number = 1, limit: number = 10) {
  const response = await apiClient.get<ApiResponse<PendingStaffResponse>>(
    "/api/v1/admin/staff/pending",
    {
      params: { page, limit },
    }
  );
  return response.data;
}

/**
 * 스태프 승인 (단일)
 * POST /api/v1/admin/staff/approve
 */
export async function approveStaff(staffId: number) {
  const response = await apiClient.post<ApiResponse<void>>(
    "/api/v1/admin/staff/approve",
    {
      user_ids: [staffId],
    }
  );
  return response.data;
}

/**
 * 스태프 일괄 승인
 * POST /api/v1/admin/staff/approve
 */
export async function bulkApproveStaff(userIds: number[]) {
  const response = await apiClient.post<ApiResponse<void>>(
    "/api/v1/admin/staff/approve",
    {
      user_ids: userIds,
    }
  );
  return response.data;
}

/**
 * 스태프 거부
 * POST /api/v1/admin/staff/:staffId/reject
 */
export async function rejectStaff(staffId: number) {
  const response = await apiClient.post<ApiResponse<void>>(
    `/api/v1/admin/staff/${staffId}/reject`
  );
  return response.data;
}

/**
 * 스태프 목록 조회 (승인된 스태프)
 * GET /api/v1/admin/staff
 */
export async function getStaffList(page: number = 1, limit: number = 10) {
  const response = await apiClient.get<ApiResponse<PendingStaffResponse>>(
    "/api/v1/admin/staff",
    {
      params: { page, limit },
    }
  );
  return response.data;
}

/**
 * 스태프 비밀번호 초기화
 * POST /api/v1/admin/auth/reset-password
 */
export async function resetStaffPassword(targetEmployeeId: string) {
  const response = await apiClient.post<ApiResponse<void>>(
    "/api/v1/admin/auth/reset-password",
    {
      target_employee_id: targetEmployeeId,
    }
  );
  return response.data;
}
