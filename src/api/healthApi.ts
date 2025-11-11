import { apiClient } from "@/lib/apiClient";

// 서버 헬스 체크 응답 타입
export interface HealthResponse {
  service: string;
  status: string;
  version: string;
  docs: string;
}

// 서버 상태 확인
export async function checkHealth(): Promise<HealthResponse> {
  const response = await apiClient.get<HealthResponse>("/");
  return response.data;
}

// 상세한 헬스 체크 (응답 시간 포함)
export async function checkHealthWithTiming(): Promise<HealthResponse & { responseTime: number }> {
  const startTime = performance.now();

  const response = await apiClient.get<HealthResponse>("/");

  const endTime = performance.now();
  const responseTime = Math.round(endTime - startTime);

  console.log("응답 시간:", `${responseTime}ms`);

  return { ...response.data, responseTime };
}
