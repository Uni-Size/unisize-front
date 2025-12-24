import { apiClient } from "@/lib/apiClient";
import type { ApiResponse } from "./authApi";

// 상품 정보 타입
export interface Product {
  id: number;
  name: string;
  category: string;
  gender: string;
  season?: string;
  price: number;
  description?: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// 상품 리스트 응답 타입
export interface ProductsData {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// 상품 조회 파라미터 타입
export interface GetProductsParams {
  page?: number;
  limit?: number;
  category?: string;
  gender?: string;
  search?: string;
  active_only?: boolean;
}

// 상품 리스트 조회
export async function getProducts(params?: GetProductsParams): Promise<ProductsData> {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.category) queryParams.append("category", params.category);
  if (params?.gender) queryParams.append("gender", params.gender);
  if (params?.search) queryParams.append("search", params.search);
  if (params?.active_only !== undefined) queryParams.append("active_only", params.active_only.toString());

  const queryString = queryParams.toString();
  const url = queryString ? `/api/v1/products?${queryString}` : "/api/v1/products";

  const response = await apiClient.get<ApiResponse<ProductsData>>(url);
  return response.data.data;
}

// 제품 단일 추가 요청 타입
export interface AddProductRequest {
  school_name: string;
  year: number;
  name: string;
  category: string;
  gender: string;
  season: string;
  price: number;
  display_name: string;
  quantity: number;
  is_selectable: boolean;
  selectable_with?: string[];
  description?: string;
}

// 제품 단일 추가 응답 타입
export interface AddProductResponse {
  school_name: string;
  year: number;
  product_id: number;
  product_name: string;
  display_name: string;
  is_new_product: boolean;
  message: string;
}

// 제품 단일 추가
export async function addSingleProduct(data: AddProductRequest): Promise<AddProductResponse> {
  const response = await apiClient.post<ApiResponse<AddProductResponse>>(
    "/api/v1/schools/supported/uniforms/single",
    data
  );
  return response.data.data;
}
