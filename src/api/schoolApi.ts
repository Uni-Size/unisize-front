import { apiClient } from "@/lib/apiClient";
import type { ApiResponse } from "./authApi";

// 학교 정보 타입
export interface School {
  id: number;
  name: string;
  year: number;
  measurement_start_date?: string;
  measurement_end_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// 학교 리스트 응답 타입
export interface SupportedSchoolsData {
  schools: School[];
}

// 학교 추가 요청 타입
export interface AddSchoolRequest {
  school_name: string;
  year: number;
  measurement_start_date?: string; // YYYY-MM-DD
  measurement_end_date?: string;   // YYYY-MM-DD
  notes?: string;
}

// 지원 학교 목록 조회 (전체)
export async function getSupportedSchools(): Promise<School[]> {
  const response = await apiClient.get<ApiResponse<SupportedSchoolsData>>(
    "/api/v1/schools/supported"
  );
  return response.data.data.schools;
}

// 연도별 지원 학교 목록 조회
export async function getSupportedSchoolsByYear(year: number): Promise<School[]> {
  const response = await apiClient.get<ApiResponse<SupportedSchoolsData>>(
    `/api/v1/schools/supported/by-year?year=${year}`
  );
  return response.data.data.schools;
}

// 학교 수정 요청 타입
export interface UpdateSchoolRequest {
  school_name: string;
  year: number;
  measurement_start_date?: string; // YYYY-MM-DD
  measurement_end_date?: string;   // YYYY-MM-DD
  notes?: string;
}

// 지원 학교 추가
export async function addSupportedSchool(data: AddSchoolRequest): Promise<void> {
  await apiClient.post<ApiResponse<void>>(
    "/api/v1/schools/supported",
    data
  );
}

// 지원 학교 수정
export async function updateSupportedSchool(id: number, data: UpdateSchoolRequest): Promise<void> {
  await apiClient.put<ApiResponse<void>>(
    `/api/v1/schools/supported/${id}`,
    data
  );
}

// 학교 제품 타입
export interface SchoolProduct {
  product_id?: number;
  name: string;
  category: string;
  gender: string;
  season: string;
  price: number;
  description?: string;
  display_name: string;
  quantity: number;
  is_selectable: boolean;
  selectable_with?: number[];
}

// 학교 제품 추가 요청 타입
export interface AddSchoolProductsRequest {
  school_name: string;
  year: number;
  products: SchoolProduct[];
}

// 학교 제품 추가
export async function addSchoolProducts(data: AddSchoolProductsRequest): Promise<void> {
  await apiClient.post<ApiResponse<void>>(
    "/api/v1/schools/supported/uniforms",
    data
  );
}
