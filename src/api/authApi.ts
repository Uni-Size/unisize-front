import { apiClient } from "@/lib/apiClient";
import type { StaffInfo } from "@/stores/authStore";

// 쿠키에 토큰 저장하는 헬퍼 함수
function setCookie(name: string, value: string, days: number = 7) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

// 쿠키에서 토큰 삭제하는 헬퍼 함수
function deleteCookie(name: string) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}

// 로그인 요청 타입
export interface LoginRequest {
  employee_id: string;
  password: string;
}

// API 응답 래퍼 타입 (재사용 가능하도록 export)
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

// 로그인 응답 데이터 타입
export interface LoginResponseData {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: StaffInfo;
}

// 로그인
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
  }

  return loginData;
}

// 현재 로그인한 스태프 정보 가져오기
export async function getCurrentStaff(): Promise<StaffInfo> {
  const response = await apiClient.get<ApiResponse<StaffInfo>>("/api/v1/auth/profile");
  return response.data.data;
}

// 로그아웃
export async function logout(): Promise<void> {
  try {
    await apiClient.post("/api/v1/auth/logout");
  } finally {
    // 에러가 발생해도 로컬 토큰과 쿠키는 삭제
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    deleteCookie("accessToken");
    deleteCookie("refreshToken");
  }
}
