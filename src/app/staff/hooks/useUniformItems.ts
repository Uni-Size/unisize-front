import { useState, useMemo, useCallback } from "react";
import { UNIFORM_ITEMS } from "@/mocks/measurementData";
import { UniformSizeItem } from "../components/types";

export const useUniformItems = () => {
  const [uniformSizeItems, setUniformSizeItems] = useState<UniformSizeItem[]>(
    []
  );

  // 초기화: 각 교복 아이템에 대해 첫 번째 사이즈 항목을 추가
  useMemo(() => {
    if (uniformSizeItems.length === 0) {
      const initialItems: UniformSizeItem[] = [];
      ["동복", "하복"].forEach((s) => {
        const seasonItems = UNIFORM_ITEMS[s as "동복" | "하복"];
        seasonItems.forEach((item) => {
          initialItems.push({
            id: `${item.id}-${Date.now()}-${Math.random()}`,
            itemId: item.id,
            name: item.name,
            season: s as "동복" | "하복",
            selectedSize: item.size,
            customization: item.customization,
            pantsLength: item.name.includes("바지") ? "" : undefined,
            purchaseCount: 0,
          });
        });
      });
      setUniformSizeItems(initialItems);
    }
  }, [uniformSizeItems.length]);

  // 교복 아이템 추가
  const addItem = useCallback(
    (itemId: string, season: "동복" | "하복") => {
      const uniformItem = UNIFORM_ITEMS[season].find((i) => i.id === itemId);
      if (!uniformItem) return;

      const newItem: UniformSizeItem = {
        id: `${itemId}-${Date.now()}-${Math.random()}`,
        itemId,
        name: uniformItem.name,
        season,
        selectedSize: uniformItem.size,
        customization: uniformItem.customization,
        pantsLength: uniformItem.name.includes("바지") ? "" : undefined,
        purchaseCount: 1,
      };
      setUniformSizeItems((prev) => [...prev, newItem]);
    },
    []
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

  // 측정 완료 가능 여부 검증
  const canComplete = useMemo(() => {
    const allPantsLengthsFilled = uniformSizeItems
      .filter((item) => item.name.includes("바지"))
      .every((item) => item.pantsLength && item.pantsLength.trim().length > 0);

    return allPantsLengthsFilled;
  }, [uniformSizeItems]);

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
