import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// API 베이스 URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://121.130.231.146:8080";

// axios 인스턴스 생성
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10초
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 인증 토큰이 있으면 헤더에 추가
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // 요청 로깅
    console.log("🚀 API 요청:", {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      data: config.data,
    });

    return config;
  },
  (error: AxiosError) => {
    console.error("❌ 요청 인터셉터 에러:", error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response) => {
    // 응답 로깅
    console.log("✅ API 응답:", {
      status: response.status,
      url: response.config.url,
      data: response.data,
    });

    return response;
  },
  (error: AxiosError) => {
    // 에러 응답 로깅
    console.error("❌ API 에러:", {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data,
    });

    // 401 에러 처리 (인증 실패)
    if (error.response?.status === 401) {
      console.error("인증 실패: 로그인이 필요합니다.");
      // 여기서 로그인 페이지로 리다이렉트하거나 토큰 갱신 로직 추가
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        // window.location.href = "/login"; // 필요시 주석 해제
      }
    }

    // 403 에러 처리 (권한 없음)
    if (error.response?.status === 403) {
      console.error("접근 권한이 없습니다.");
    }

    // 500 에러 처리 (서버 에러)
    if (error.response?.status === 500) {
      console.error("서버 에러가 발생했습니다.");
    }

    return Promise.reject(error);
  }
);
