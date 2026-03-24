import { apiClient } from "@/lib/apiClient";
import type { ApiResponse } from "./auth";

// ============================================================================
// 학교 정보 타입
// ============================================================================

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

export interface SupportedSchoolsData {
  schools: School[];
}

// GET /schools/list 응답 타입
export type SchoolType = '초' | '중' | '고';

export interface SupportedYear {
  id?: number;
  year: number;
  measurement_start_date: string | null;
  measurement_end_date: string | null;
}

export interface SchoolListItem {
  id?: number;
  school_name: string;
  school_type: SchoolType;
  supported_years: SupportedYear[];
  is_active: boolean;
  is_permanent: boolean;
  created_at: string;
  updated_at: string;
}

export interface SchoolListResponse {
  schools: SchoolListItem[];
  total: number;
}

export interface SchoolListParams {
  school_type?: SchoolType;
  is_active?: boolean;
  year?: number;
}

export interface UniformItem {
  product_id: number;
  contract_price: number;
  free_support_count: number;
}

// GET /schools/supported/detail 응답 타입
export interface SchoolDetailYear {
  id: number;
  year: number;
  is_active: boolean;
  expected_student_count: number;
  measurement_start_date: string | null;
  measurement_end_date: string | null;
}

export interface SchoolDetailUniform {
  id: number;
  product_id: number;
  category: string;
  gender: string;
  display_name: string;
  contract_price: number;
  free_support_count: number;
}

export interface SchoolDetailResponse {
  school_name: string;
  school_type: SchoolType;
  is_permanent: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  years: SchoolDetailYear[];
  uniforms: {
    winter: SchoolDetailUniform[];
    summer: SchoolDetailUniform[];
  };
}

export interface AddSchoolRequest {
  school_name: string;
  year: number;
  expected_student_count?: number;
  measurement_start_date?: string; // YYYY-MM-DD
  measurement_end_date?: string;   // YYYY-MM-DD
  uniforms?: {
    winter?: UniformItem[];
    summer?: UniformItem[];
  };
}

export interface UpdateSchoolYearInfo {
  year: number;
  expected_student_count?: number;
  measurement_start_date?: string;
  measurement_end_date?: string;
}

export interface UpdateSchoolRequest {
  school_name: string;
  is_permanent?: boolean;
  years?: UpdateSchoolYearInfo[];
  uniforms?: {
    winter?: UniformItem[];
    summer?: UniformItem[];
  };
}


// ============================================================================
// 학교 조회 API
// ============================================================================

/**
 * 전체 학교 목록 조회 (Admin)
 * GET /api/v1/schools/list
 */
export async function getSchoolList(params?: SchoolListParams): Promise<SchoolListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.school_type) searchParams.set('school_type', params.school_type);
  if (params?.is_active !== undefined) searchParams.set('is_active', String(params.is_active));
  if (params?.year !== undefined) searchParams.set('year', String(params.year));

  const query = searchParams.toString();
  const response = await apiClient.get<ApiResponse<SchoolListResponse>>(
    `/api/v1/schools/list${query ? `?${query}` : ''}`
  );
  return response.data.data;
}


/**
 * 지원 학교 목록 조회 (전체)
 * GET /api/v1/schools/supported
 */
export async function getSupportedSchools(): Promise<School[]> {
  const response = await apiClient.get<ApiResponse<SupportedSchoolsData>>(
    "/api/v1/schools/supported"
  );
  return response.data.data.schools;
}

/**
 * 연도별 지원 학교 목록 조회
 * GET /api/v1/schools/supported/by-year
 */
export async function getSupportedSchoolsByYear(year: number): Promise<School[]> {
  const response = await apiClient.get<ApiResponse<SupportedSchoolsData>>(
    `/api/v1/schools/supported/by-year?year=${year}`
  );
  return response.data.data.schools;
}

// ============================================================================
// 학교 관리 API (Staff/Admin)
// ============================================================================

/**
 * 학교 상세 조회
 * GET /api/v1/schools/supported/detail?school_name=...
 */
export async function getSchoolDetail(schoolName: string): Promise<SchoolDetailResponse> {
  const response = await apiClient.get<ApiResponse<SchoolDetailResponse>>(
    `/api/v1/schools/supported/detail?school_name=${encodeURIComponent(schoolName)}`
  );
  return response.data.data;
}

/**
 * 지원 학교 추가
 * POST /api/v1/schools/supported
 */
export async function addSupportedSchool(data: AddSchoolRequest): Promise<void> {
  await apiClient.post<ApiResponse<void>>(
    "/api/v1/schools/supported",
    data
  );
}

/**
 * 지원 학교 수정
 * PUT /api/v1/schools/supported/by-name/:schoolName
 */
export async function updateSupportedSchool(schoolName: string, data: UpdateSchoolRequest): Promise<void> {
  await apiClient.put<ApiResponse<void>>(
    `/api/v1/schools/supported/by-name/${encodeURIComponent(schoolName)}`,
    data
  );
}

/**
 * 지원 학교 삭제
 * DELETE /api/v1/schools/supported/:id
 */
export async function deleteSupportedSchool(id: number): Promise<void> {
  await apiClient.delete<ApiResponse<void>>(
    `/api/v1/schools/supported/${id}`
  );
}

