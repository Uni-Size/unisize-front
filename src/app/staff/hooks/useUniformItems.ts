import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { UniformSizeItem } from "../components/types";
import type { MeasurementSessionData } from "../utils/sessionStorage";

interface UniformProductItem {
  id: string;
  name: string;
  recommendedSize: string;
  availableSizes: number[];
  price: number;
  provided: number;
  quantity: number;
  selectableWith?: string[];
  gender: "male" | "female" | "unisex";
  isCustomizationRequired?: boolean;
  customization?: string;
}

interface InitialData {
  winter: UniformProductItem[];
  summer: UniformProductItem[];
  all: UniformProductItem[];
}

export const useUniformItems = (
  initialData: InitialData,
  sessionData?: MeasurementSessionData | null
) => {
  const [uniformSizeItems, setUniformSizeItems] = useState<UniformSizeItem[]>(
    []
  );
  const isInitialized = useRef(false);

  // 초기화: 각 교복 아이템에 대해 첫 번째 사이즈 항목을 추가
  useEffect(() => {
    if (!isInitialized.current && uniformSizeItems.length === 0) {
      let initialItems: UniformSizeItem[] = [];

      // 세션 데이터가 있으면 복원
      if (sessionData?.uniformItems && sessionData.uniformItems.length > 0) {
        initialItems = sessionData.uniformItems.map((item) => ({
          id: `${item.itemId}-${Date.now()}-${Math.random()}`,
          itemId: item.itemId,
          productId: item.productId,
          name: item.name,
          season: item.season,
          selectedSize: item.selectedSize,
          customization: item.customization || "",
          purchaseCount: item.purchaseCount,
          freeQuantity: item.freeQuantity,
          isCustomizationRequired: item.isCustomizationRequired,
        }));
      } else {
        // 세션 데이터가 없으면 recommended_uniforms 데이터 사용
        (["winter", "summer", "all"] as const).forEach((s) => {
          const seasonItems = initialData[s];
          seasonItems.forEach((item) => {
            // 구입 개수 = 총 개수(quantity) - 지원 개수(provided)
            const initialPurchaseCount = Math.max(0, item.quantity - item.provided);

            // recommendedSize를 디폴트 값으로 사용
            // availableSizes가 비어있으면 0으로 설정하여 에러 케이스로 인지
            const defaultSize = item.recommendedSize
              ? Number(item.recommendedSize)
              : item.availableSizes.length > 0
              ? item.availableSizes[0]
              : 0;

            initialItems.push({
              id: `${item.id}-${Date.now()}-${Math.random()}`,
              itemId: item.id,
              productId: Number(item.id) || undefined,
              name: item.name,
              season: s,
              selectedSize: defaultSize,
              customization: item.customization || "",
              purchaseCount: initialPurchaseCount,
              freeQuantity: item.provided,
              price: item.price,
              isCustomizationRequired: item.isCustomizationRequired,
            });
          });
        });
      }

      setUniformSizeItems(initialItems);
      isInitialized.current = true;
    }
  }, [initialData, sessionData]);

  // 교복 아이템 추가
  const addItem = useCallback(
    (itemId: string, season: "winter" | "summer" | "all") => {
      const uniformItem = initialData[season].find((i) => i.id === itemId);

      if (!uniformItem) return;

      // recommendedSize를 디폴트 값으로 사용
      // availableSizes가 비어있으면 0으로 설정하여 에러 케이스로 인지
      const defaultSize = uniformItem.recommendedSize
        ? Number(uniformItem.recommendedSize)
        : uniformItem.availableSizes.length > 0
        ? uniformItem.availableSizes[0]
        : 0;

      const newItem: UniformSizeItem = {
        id: `${itemId}-${Date.now()}-${Math.random()}`,
        itemId,
        productId: Number(itemId) || undefined,
        name: uniformItem.name,
        season,
        selectedSize: defaultSize,
        customization: "",
        purchaseCount: 1,
        freeQuantity: uniformItem.provided,
        price: uniformItem.price,
        isCustomizationRequired: uniformItem.isCustomizationRequired,
      };
      setUniformSizeItems((prev) => [...prev, newItem]);
    },
    [initialData]
  );

  // 교복 아이템 제거
  const removeItem = useCallback((id: string) => {
    setUniformSizeItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // 사이즈 변경
  const updateSize = useCallback((id: string, size: number) => {
    setUniformSizeItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selectedSize: size } : item
      )
    );
  }, []);

  // 맞춤 정보 변경
  const updateCustomization = useCallback(
    (id: string, customization: string) => {
      setUniformSizeItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, customization } : item))
      );
    },
    []
  );

  // 교복 구입 개수 변경
  const updatePurchaseCount = useCallback((id: string, delta: number) => {
    setUniformSizeItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              purchaseCount: Math.max(0, item.purchaseCount + delta),
            }
          : item
      )
    );
  }, []);

  // 측정 완료 가능 여부 검증 (맞춤 정보는 필수 아님)
  const canComplete = useMemo(() => {
    return true;
  }, []);

  return {
    uniformSizeItems,
    addItem,
    removeItem,
    updateSize,
    updateCustomization,
    updatePurchaseCount,
    canComplete,
  };
};
