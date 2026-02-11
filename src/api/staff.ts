import { apiClient } from "@/lib/apiClient";
import type { ApiResponse } from "./auth";

export interface StaffItem {
  id: number;
  employee_id: string;
  employee_name: string;
  gender: "M" | "F";
  phone: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * 승인 완료된 스태프 리스트
 * GET /admin/staff
 */
export async function getStaffList(): Promise<StaffItem[]> {
  const response = await apiClient.get<ApiResponse<StaffItem[] | Record<string, unknown>>>(
    "/api/v1/admin/staff"
  );
  const data = response.data.data;
  if (Array.isArray(data)) return data;
  // data가 객체인 경우 배열 필드를 찾아서 반환
  const arr = Object.values(data).find(Array.isArray);
  return (arr as StaffItem[]) ?? [];
}

/**
 * 승인 대기 스태프 리스트
 * GET /api/v1/admin/staff/pending
 */
export async function getPendingStaffList(): Promise<StaffItem[]> {
  const response = await apiClient.get<ApiResponse<StaffItem[] | Record<string, unknown>>>(
    "/api/v1/admin/staff/pending"
  );
  const data = response.data.data;
  if (Array.isArray(data)) return data;
  const arr = Object.values(data).find(Array.isArray);
  return (arr as StaffItem[]) ?? [];
}

/**
 * 스태프 승인
 * POST /api/v1/admin/staff/approve
 */
export async function approveStaff(staffId: number): Promise<void> {
  await apiClient.post<ApiResponse<void>>("/api/v1/admin/staff/approve", {
    staff_id: staffId,
  });
}

/**
 * 스태프 비밀번호 초기화
 * POST /api/v1/admin/auth/reset-password
 */
export async function resetStaffPassword(targetEmployeeId: string): Promise<void> {
  await apiClient.post<ApiResponse<void>>("/api/v1/admin/auth/reset-password", {
    target_employee_id: targetEmployeeId,
  });
}
