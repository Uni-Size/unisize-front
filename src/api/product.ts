import { apiClient } from "@/lib/apiClient";
import type { ApiResponse } from "./auth";

// ============================================================================
// 상품 정보 타입
// ============================================================================

export interface ProductSize {
  size: string;
  total_in?: number;
  round_number?: number;
}

export interface ProductSizeResponse {
  size: string;
  quantity: number;
  rounds?: { round_number: number; total_in: number }[];
}

export interface SelectableProduct {
  product_id: string;
  display_name: string;
  free_support_count?: number;
}

export interface ProductSchool {
  school_name: string;
  display_name: string;
  price: number;
  quantity: number;
  is_selectable?: boolean;
  selectable_with?: SelectableProduct[];
}

export interface Product {
  id: string;
  name: string;
  category: string;
  gender: string;
  season?: string;
  price: number;
  is_repair: boolean;
  is_repair_required: boolean;
  size_type?: "numeric" | "alpha" | "free";
  sizes?: ProductSizeResponse[];
  schools?: ProductSchool[];
  inventory_status?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductsData {
  products: Product[];
  total: number;
}

export interface GetProductsParams {
  page?: number;
  limit?: number;
  category?: string;
  gender?: string;
  season?: string;
  search?: string;
  active_only?: boolean;
  school_name?: string;
}

export interface CreateProductRequest {
  name: string;
  category: string;
  gender: string;
  season?: string;
  price: number;
  is_repair?: boolean;
  is_repair_required?: boolean;
  size_type?: "numeric" | "alpha" | "free";
  sizes?: ProductSize[];
  schools?: { school_name: string; display_name?: string; price?: number; quantity?: number }[];
}

export interface UpdateProductRequest {
  name?: string;
  category?: string;
  gender?: string;
  season?: string;
  price?: number;
  is_repair?: boolean;
  is_repair_required?: boolean;
  size_type?: "numeric" | "alpha" | "free";
  sizes?: ProductSize[];
  schools?: {
    school_name: string;
    display_name?: string;
    price?: number;
    quantity?: number;
    is_selectable?: boolean | null;
    selectable_with?: number[] | null;
  }[];
}

// ============================================================================
// 상품 조회 API
// ============================================================================

/**
 * 상품 리스트 조회
 * GET /api/v1/products
 */
export async function getProducts(params?: GetProductsParams): Promise<ProductsData> {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.category) queryParams.append("category", params.category);
  if (params?.gender) queryParams.append("gender", params.gender);
  if (params?.season) queryParams.append("season", params.season);
  if (params?.search) queryParams.append("search", params.search);
  if (params?.active_only !== undefined) queryParams.append("active_only", params.active_only.toString());
  if (params?.school_name) queryParams.append("school_name", params.school_name);

  const queryString = queryParams.toString();
  const url = queryString ? `/api/v1/products?${queryString}` : "/api/v1/products";

  const response = await apiClient.get<ApiResponse<ProductsData>>(url);
  return response.data.data;
}

// getAllProducts는 getProducts와 동일 — 하나로 통합
export const getAllProducts = getProducts;

// ============================================================================
// 상품 관리 API
// ============================================================================

/**
 * 상품 단건 조회
 * GET /api/v1/products/:id
 */
export async function getProduct(id: string): Promise<Product> {
  const response = await apiClient.get<ApiResponse<Product>>(
    `/api/v1/products/${id}`
  );
  return response.data.data;
}

/**
 * 상품 추가
 * POST /api/v1/products
 */
export async function createProduct(data: CreateProductRequest): Promise<Product> {
  const response = await apiClient.post<ApiResponse<Product>>(
    "/api/v1/products",
    data
  );
  return response.data.data;
}

/**
 * 상품 수정
 * PUT /api/v1/products/:id
 */
export async function updateProduct(id: string, data: UpdateProductRequest): Promise<Product> {
  const response = await apiClient.put<ApiResponse<Product>>(
    `/api/v1/products/${id}`,
    data
  );
  return response.data.data;
}

/**
 * 학교별 교체 가능 상품 설정
 * PUT /api/v1/products/:id/schools/:school_name/selectable
 */
export async function updateProductSelectable(
  productId: string,
  schoolName: string,
  data: { is_selectable: boolean; selectable_with?: string[] },
): Promise<void> {
  await apiClient.put(
    `/api/v1/products/${productId}/schools/${encodeURIComponent(schoolName)}/selectable`,
    data,
  );
}

/**
 * 상품 삭제
 * DELETE /api/v1/products/:id
 */
export async function deleteProduct(id: string): Promise<void> {
  await apiClient.delete(`/api/v1/products/${id}`);
}

