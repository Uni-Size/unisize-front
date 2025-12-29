import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProducts, GetProductsParams, addSingleProduct, AddProductRequest } from "@/api/product";

// 상품 목록 조회
export function useProducts(params?: GetProductsParams) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => getProducts(params),
  });
}

// 제품 단일 추가
export function useAddProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddProductRequest) => addSingleProduct(data),
    onSuccess: () => {
      // 제품 목록 쿼리 무효화하여 다시 가져오기
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
