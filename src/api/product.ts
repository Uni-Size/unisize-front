import { apiClient } from "@/lib/apiClient";
import type { ApiResponse } from "./auth";

// ============================================================================
// 상품 정보 타입
// ============================================================================

export interface Product {
  id: number;
  name: string;
  category: string;
  gender: string;
  season?: string;
  price: number;
  is_repair: boolean;
  is_repair_required: boolean;
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
}

export interface CreateProductRequest {
  category: string;
  gender: string;
  is_repair: boolean;
  is_repair_required: boolean;
  name: string;
  price: number;
  season: string;
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

  const queryString = queryParams.toString();
  const url = queryString ? `/api/v1/products?${queryString}` : "/api/v1/products";

  const response = await apiClient.get<ApiResponse<ProductsData>>(url);
  return response.data.data;
}

// ============================================================================
// 상품 관리 API
// ============================================================================

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
export async function updateProduct(id: number, data: CreateProductRequest): Promise<Product> {
  const response = await apiClient.put<ApiResponse<Product>>(
    `/api/v1/products/${id}`,
    data
  );
  return response.data.data;
}

/**
 * 상품 삭제
 * DELETE /api/v1/products/:id
 */
export async function deleteProduct(id: number): Promise<void> {
  await apiClient.delete(`/api/v1/products/${id}`);
}
