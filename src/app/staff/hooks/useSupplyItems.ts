import { useState, useCallback, useEffect, useRef } from "react";
import { SUPPLY_ITEMS_CONFIG } from "@/mocks/measurementData";
import { SupplyItem } from "../components/types";

interface ApiSupplyItem {
  product_id: number;
  name: string;
  category?: string;
  season?: string;
  price: number;
  quantity: number;
  available_sizes?: Array<{
    size: string;
    in_stock: boolean;
    stock_count: number;
  }>;
}

export const useSupplyItems = (initialSupplyItems?: ApiSupplyItem[]) => {
  const [supplyItems, setSupplyItems] = useState<SupplyItem[]>([]);
  const [itemCounts, setItemCounts] = useState<Record<string, number>>({});
  const isInitialized = useRef(false);

  // 초기화: API 응답의 supply_items로 초기 상태 설정
  useEffect(() => {
    if (!isInitialized.current && initialSupplyItems && initialSupplyItems.length > 0) {
      const initialItems: SupplyItem[] = initialSupplyItems.map((item) => {
        // 사이즈 결정 로직:
        // 1. 기본값: 빈 문자열 (선택 안됨)
        // 2. quantity >= 1 && available_sizes.length === 1이면 해당 사이즈를 디폴트로 설정
        let defaultSize = "";

        if (
          item.quantity >= 1 &&
          item.available_sizes &&
          item.available_sizes.length === 1
        ) {
          defaultSize = item.available_sizes[0].size;
        }

        return {
          id: `${item.product_id}-${Date.now()}-${Math.random()}`,
          name: item.name,
          category: item.category || "",
          size: defaultSize,
          product_id: item.product_id,
          price: item.price,
          quantity: item.quantity,
          season: item.season,
          available_sizes: item.available_sizes,
        };
      });

      const initialCounts: Record<string, number> = {};
      initialItems.forEach((item) => {
        initialCounts[item.id] = item.quantity || 0;
      });

      setSupplyItems(initialItems);
      setItemCounts(initialCounts);
      isInitialized.current = true;
    }
  }, [initialSupplyItems]);

  // 같은 품목의 새 사이즈 추가 (복사 기능)
  const addSameItem = useCallback((baseItem: SupplyItem) => {
    // 새로 추가하는 아이템은 사이즈를 초기화
    // quantity가 없거나 0이면 빈 문자열로, 1 이상이고 available_sizes가 1개만 있으면 해당 사이즈로
    let defaultSize = "";
    if (
      baseItem.available_sizes &&
      baseItem.available_sizes.length === 1 &&
      (baseItem.quantity || 0) >= 1
    ) {
      defaultSize = baseItem.available_sizes[0].size;
    }

    const newItem: SupplyItem = {
      ...baseItem,
      id: `${baseItem.product_id}-${Date.now()}-${Math.random()}`,
      size: defaultSize,
    };
    setSupplyItems((prev) => [...prev, newItem]);
    // 새 아이템의 수량은 0으로 초기화
    setItemCounts((prev) => ({
      ...prev,
      [newItem.id]: 0,
    }));
  }, []);

  const addItem = useCallback(
    (itemName: keyof typeof SUPPLY_ITEMS_CONFIG) => {
      const config = SUPPLY_ITEMS_CONFIG[itemName];
      const firstOption = config.options[0];
      const newItem: SupplyItem = {
        id: `${itemName}-${Date.now()}`,
        name: config.name,
        category: firstOption.category,
        size: firstOption.size,
      };
      setSupplyItems((prev) => [...prev, newItem]);
    },
    []
  );

  const removeItem = useCallback((itemId: string) => {
    setSupplyItems((prev) => prev.filter((item) => item.id !== itemId));
    setItemCounts((prev) => {
      const newCounts = { ...prev };
      delete newCounts[itemId];
      return newCounts;
    });
  }, []);

  const updateItem = useCallback(
    (itemId: string, field: "category" | "size", value: string) => {
      setSupplyItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, [field]: value } : item
        )
      );
    },
    []
  );

  const updateCount = useCallback((itemId: string, delta: number) => {
    setItemCounts((prev) => ({
      ...prev,
      [itemId]: Math.max(0, (prev[itemId] || 0) + delta),
    }));
  }, []);

  return {
    supplyItems,
    itemCounts,
    setItemCounts,
    addItem,
    addSameItem,
    removeItem,
    updateItem,
    updateCount,
  };
};
