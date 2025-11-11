import { apiClient } from "@/lib/apiClient";

// 로그인 요청 타입
export interface LoginRequest {
  username: string;
  password: string;
}

// 로그인 응답 타입
export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  // 필요한 다른 필드들 추가
}

// 로그인
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>("/api/v1/auth/login", credentials);

  // 토큰을 localStorage에 저장
  if (response.data.accessToken) {
    localStorage.setItem("accessToken", response.data.accessToken);
    if (response.data.refreshToken) {
      localStorage.setItem("refreshToken", response.data.refreshToken);
    }
  }

  return response.data;
}
