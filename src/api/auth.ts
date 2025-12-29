import { apiClient } from "@/lib/apiClient";
import type { StaffInfo } from "@/stores/authStore";

// ============================================================================
// 쿠키 관리 헬퍼 함수
// ============================================================================

function setCookie(name: string, value: string, days: number = 7) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}

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

  // 토큰을 localStorage와 쿠키에 저장
  if (loginData.access_token) {
    localStorage.setItem("accessToken", loginData.access_token);
    setCookie("accessToken", loginData.access_token, 7);

    if (loginData.refresh_token) {
      localStorage.setItem("refreshToken", loginData.refresh_token);
      setCookie("refreshToken", loginData.refresh_token, 30);
    }

    // role 정보를 쿠키에 저장 (middleware에서 권한 검증용)
    if (loginData.user?.role) {
      setCookie("userRole", loginData.user.role, 7);
    }
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
    // 에러가 발생해도 로컬 토큰과 쿠키는 삭제
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    deleteCookie("accessToken");
    deleteCookie("refreshToken");
    deleteCookie("userRole");
  }
}
