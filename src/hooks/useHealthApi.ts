import { useQuery, UseQueryOptions } from "@tanstack/react-query";

// 서버 헬스 체크 응답 타입
export interface HealthResponse {
  service: string;
  status: string;
  version: string;
  docs: string;
}

// API 베이스 URL
const API_BASE_URL = "http://121.130.231.146:8080";

// Query Keys
export const healthKeys = {
  all: ["health"] as const,
  check: () => [...healthKeys.all, "check"] as const,
};

// API 함수
async function fetchHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  // 콘솔에 서버 상태 출력
  console.log("=== 서버 상태 확인 ===");
  console.log("서비스:", data.service);
  console.log("상태:", data.status);
  console.log("버전:", data.version);
  console.log("문서:", data.docs);
  console.log("전체 응답:", data);
  console.log("==================");

  return data;
}

// React Query Hook
export function useHealthCheck(
  options?: Omit<
    UseQueryOptions<HealthResponse, Error, HealthResponse, readonly string[]>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: healthKeys.check(),
    queryFn: fetchHealth,
    ...options,
  });
}
