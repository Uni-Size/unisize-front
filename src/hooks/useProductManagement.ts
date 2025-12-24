import { useQuery } from "@tanstack/react-query";
import { getProducts, GetProductsParams } from "@/api/productApi";

// 상품 목록 조회
export function useProducts(params?: GetProductsParams) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => getProducts(params),
  });
}
