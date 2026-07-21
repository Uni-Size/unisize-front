import { apiClient } from "@/lib/apiClient";
import { useAuthStore, type StaffInfo } from "@/stores/authStore";
import { setCookie } from "@/utils/cookieUtils";

// ============================================================================
// 타입 정의
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
    details: string;
  };
  meta?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface LoginRequest {
  employee_id: string;
  password: string;
}

export interface LoginResponseData {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: StaffInfo;
}

export interface RegisterStaffRequest {
  employee_id: string;
  employee_name: string;
  gender: "M" | "F";
  password: string;
}

// ============================================================================
// 인증 API
// ============================================================================

/**
 * 로그인
 * POST /api/v1/auth/login
 */
export async function login(credentials: LoginRequest): Promise<LoginResponseData> {
  const response = await apiClient.post<ApiResponse<LoginResponseData>>(
    "/api/v1/auth/login",
    credentials
  );

  const loginData = response.data.data;

  // role 정보를 쿠키에 저장 (라우터 가드용, 민감하지 않은 정보만)
  // 토큰 자체는 authStore.setAuth가 유일한 소스로 저장한다.
  if (loginData.user?.role) {
    setCookie("userRole", loginData.user.role, 7);
  }

  return loginData;
}

/**
 * 현재 로그인한 스태프 정보 가져오기
 * GET /api/v1/auth/profile
 */
export async function getCurrentStaff(): Promise<StaffInfo> {
  const response = await apiClient.get<ApiResponse<StaffInfo>>("/api/v1/auth/profile");
  return response.data.data;
}

/**
 * 스태프 회원가입
 * POST /api/v1/auth/register
 */
export async function registerStaff(data: RegisterStaffRequest): Promise<void> {
  await apiClient.post<ApiResponse<void>>("/api/v1/auth/register", data);
}

/**
 * 로그아웃
 * POST /api/v1/auth/logout
 */
export async function logout(): Promise<void> {
  try {
    await apiClient.post("/api/v1/auth/logout");
  } finally {
    // 에러가 발생해도 로컬 인증 상태(토큰/쿠키)는 반드시 정리한다.
    useAuthStore.getState().clearAuth();
  }
}
