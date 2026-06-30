import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

// API 베이스 URL
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://api.unisize.org";

const isDev = import.meta.env.DEV;

// axios 인스턴스 생성
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10초
  headers: {
    "Content-Type": "application/json",
  },
  // CSRF 방지: cross-site 요청 시 쿠키 전송 제한
  withCredentials: false,
});

// 허용된 baseURL인지 검증 (SSRF 방지)
function isAllowedBaseURL(url: string | undefined): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url, API_BASE_URL);
    const allowed = new URL(API_BASE_URL);
    return parsed.hostname === allowed.hostname;
  } catch {
    return false;
  }
}

// 요청 인터셉터
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // baseURL 검증 (SSRF 방지)
    if (config.baseURL && !isAllowedBaseURL(config.baseURL)) {
      return Promise.reject(new Error("허용되지 않은 요청 URL입니다."));
    }

    // 인증 토큰이 있으면 헤더에 추가
    const token = localStorage.getItem("accessToken");
    if (token && config.headers) {
      // 토큰 형식 기본 검증 (JWT 구조: xxx.yyy.zzz)
      if (/^[\w-]+\.[\w-]+\.[\w-]+$/.test(token)) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        // 잘못된 형식의 토큰이면 제거
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("auth-storage");
      }
    }

    // 개발 환경에서만 로깅 (민감한 data는 제외)
    if (isDev) {
      console.log("API 요청:", {
        method: config.method?.toUpperCase(),
        url: config.url,
      });
    }

    return config;
  },
  (error: AxiosError) => {
    if (isDev) {
      console.error("요청 인터셉터 에러:", error.message);
    }
    return Promise.reject(error);
  },
);

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response) => {
    // 개발 환경에서만 로깅 (응답 data는 제외)
    if (isDev) {
      console.log("API 응답:", {
        status: response.status,
        url: response.config.url,
      });
    }

    return response;
  },
  (error: AxiosError) => {
    // 개발 환경에서만 상세 로깅
    if (isDev) {
      console.error("API 에러:", {
        status: error.response?.status,
        url: error.config?.url,
        message: error.message,
      });
    }

    // 401 에러 처리 (인증 실패)
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      const loginPaths = ["/staff/login", "/admin/login"];
      const isLoginPage = loginPaths.some((p) => currentPath === p);

      if (!isLoginPage) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("auth-storage");

        // 쿠키 삭제 (Secure 플래그 포함)
        const cookiesToClear = ["accessToken", "refreshToken", "userRole"];
        cookiesToClear.forEach((name) => {
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax`;
        });

        // admin 경로면 admin 로그인으로, 아니면 staff 로그인으로
        const redirectPath = currentPath.startsWith("/admin")
          ? "/admin/login"
          : "/staff/login";
        window.location.href = redirectPath;
      }
    }

    return Promise.reject(error);
  },
);
