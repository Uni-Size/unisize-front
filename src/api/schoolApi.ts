import { apiClient } from "@/lib/apiClient";
import type { ApiResponse } from "./authApi";

// 학교 정보 타입
export interface School {
  id: number;
  name: string;
  code?: string;
}

// 학교 리스트 응답 타입
export interface SupportedSchoolsData {
  schools: School[];
}

// 지원 학교 목록 조회
export async function getSupportedSchools(): Promise<School[]> {
  const response = await apiClient.get<ApiResponse<SupportedSchoolsData>>(
    "/api/v1/schools/supported"
  );
  return response.data.data.schools;
}
