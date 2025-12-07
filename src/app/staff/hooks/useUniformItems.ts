import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { UniformSizeItem } from "../components/types";

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
}

interface InitialData {
  동복: UniformProductItem[];
  하복: UniformProductItem[];
}

export const useUniformItems = (initialData: InitialData) => {
  const [uniformSizeItems, setUniformSizeItems] = useState<UniformSizeItem[]>(
    []
  );
  const isInitialized = useRef(false);

  // 초기화: 각 교복 아이템에 대해 첫 번째 사이즈 항목을 추가
  useEffect(() => {
    if (!isInitialized.current && uniformSizeItems.length === 0) {
      const initialItems: UniformSizeItem[] = [];

      // recommended_uniforms 데이터 사용
      ["동복", "하복"].forEach((s) => {
        const seasonItems = initialData[s as "동복" | "하복"];
        seasonItems.forEach((item) => {
          // 구입 개수 = 총 개수(quantity) - 지원 개수(provided)
          const initialPurchaseCount = Math.max(0, item.quantity - item.provided);

          initialItems.push({
            id: `${item.id}-${Date.now()}-${Math.random()}`,
            itemId: item.id,
            productId: Number(item.id) || undefined,
            name: item.name,
            season: s as "동복" | "하복",
            selectedSize: Number(item.recommendedSize) || item.availableSizes[0] || 95,
            customization: "",
            pantsLength: item.name.includes("바지") ? "" : undefined,
            purchaseCount: initialPurchaseCount,
            freeQuantity: item.provided,
            price: item.price,
          });
        });
      });

      setUniformSizeItems(initialItems);
      isInitialized.current = true;
    }
  }, [initialData]);

  // 교복 아이템 추가
  const addItem = useCallback(
    (itemId: string, season: "동복" | "하복") => {
      const uniformItem = initialData[season].find((i) => i.id === itemId);

      if (!uniformItem) return;

      const newItem: UniformSizeItem = {
        id: `${itemId}-${Date.now()}-${Math.random()}`,
        itemId,
        productId: Number(itemId) || undefined,
        name: uniformItem.name,
        season,
        selectedSize:
          Number(uniformItem.recommendedSize) ||
          uniformItem.availableSizes[0] ||
          95,
        customization: "",
        pantsLength: uniformItem.name.includes("바지") ? "" : undefined,
        purchaseCount: 1,
        freeQuantity: uniformItem.provided,
        price: uniformItem.price,
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

  // 바지 기장 변경
  const updatePantsLength = useCallback((id: string, length: string) => {
    setUniformSizeItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, pantsLength: length } : item
      )
    );
  }, []);

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
    updatePantsLength,
    updatePurchaseCount,
    canComplete,
  };
};
