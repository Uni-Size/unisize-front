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
/** 목록 조회 파라미터 및 목록 응답에서 사용하는 코드 */
export type SchoolTypeCode = '초' | '중' | '고';
/** 상세 응답의 school_type 전체 문자열 */
export type SchoolTypeFull = '초등학교' | '중학교' | '고등학교';
/** 하위 호환 별칭 */
export type SchoolType = SchoolTypeCode;

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

/** POST /uniforms (일괄 등록) 용 */
export interface UniformItem {
  product_id: string;
  contract_price: number;
  quantity: number;
  has_name_tag?: boolean;
  name_tag_price?: number;
  name_tag_attach_price?: number;
  name_tag_min_unit?: number;
}

/** PUT /schools/supported/by-name/:school_name 의 uniforms 배열 항목 */
export interface UpdateUniformItem {
  product_id: string;
  display_name: string;
  contract_price: number;
  free_support_count: number;
  is_selectable: boolean;
  selectable_with: string[];
}

// GET /schools/supported/detail 응답 타입
export interface SchoolDetailYear {
  id: string;
  year: number;
  is_active: boolean;
  expected_student_count: number;
  measurement_start_date: string | null;
  measurement_end_date: string | null;
}

export interface SchoolDetailUniformSizeStock {
  size: string;
  quantity: number;
}

export interface SchoolDetailUniform {
  id: string;
  product_id: string;
  category: string;
  gender: string;
  display_name: string;
  contract_price: number;
  free_support_count: number;
  has_name_tag: boolean;
  name_tag_price: number | null;
  name_tag_attach_price: number | null;
  name_tag_min_unit: number | null;
  is_selectable: boolean;
  selectable_with: { product_id: string; display_name: string; free_support_count?: number }[];
  total_stock: number;
  stock_by_sizes: SchoolDetailUniformSizeStock[];
}

export interface SchoolDetailResponse {
  school_name: string;
  school_type: SchoolTypeFull;
  is_active: boolean;
  has_name_tag: boolean;
  name_tag_price: number | null;
  name_tag_attach_price: number | null;
  name_tag_min_unit: number | null;
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
  has_name_tag?: boolean;
  name_tag_price?: number | null;
  name_tag_attach_price?: number | null;
  name_tag_min_unit?: number | null;
  years?: UpdateSchoolYearInfo[];
  uniforms?: {
    winter?: UpdateUniformItem[];
    summer?: UpdateUniformItem[];
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

export interface UpdateSchoolUniformRequest {
  contract_price?: number;
  free_support_count?: number;
  has_name_tag?: boolean;
  name_tag_price?: number | null;
  name_tag_attach_price?: number | null;
  name_tag_min_unit?: number | null;
}

export interface AddSchoolUniformRequest {
  product_id: number;
  contract_price: number;
  free_support_count: number;
  has_name_tag?: boolean;
  name_tag_price?: number | null;
  name_tag_attach_price?: number | null;
  name_tag_min_unit?: number | null;
}

/**
 * 학교 품목 수정
 * PUT /api/v1/schools/supported/uniforms/single/:id
 */
export async function updateSchoolUniform(
  uniformId: number,
  data: UpdateSchoolUniformRequest,
): Promise<void> {
  await apiClient.put<ApiResponse<void>>(
    `/api/v1/schools/supported/uniforms/single/${uniformId}`,
    data,
  );
}

/**
 * 학교 품목 추가
 * POST /api/v1/schools/supported/uniforms/single
 */
export async function addSchoolUniform(
  schoolName: string,
  season: 'W' | 'S',
  data: AddSchoolUniformRequest,
): Promise<void> {
  await apiClient.post<ApiResponse<void>>(
    `/api/v1/schools/supported/uniforms/single`,
    { school_name: schoolName, season, ...data },
  );
}

