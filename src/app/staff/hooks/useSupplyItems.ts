import { useState, useCallback, useEffect, useRef } from "react";
import { SUPPLY_ITEMS_CONFIG } from "@/mocks/measurementData";
import { SupplyItem } from "../components/types";

interface ApiSupplyItem {
  product_id: number;
  name: string;
  category: string;
  season: string;
  price: number;
  quantity: number;
}

export const useSupplyItems = (initialSupplyItems?: ApiSupplyItem[]) => {
  const [supplyItems, setSupplyItems] = useState<SupplyItem[]>([]);
  const [itemCounts, setItemCounts] = useState<Record<string, number>>({});
  const isInitialized = useRef(false);

  // 초기화: API 응답의 supply_items로 초기 상태 설정
  useEffect(() => {
    if (!isInitialized.current && initialSupplyItems && initialSupplyItems.length > 0) {
      const initialItems: SupplyItem[] = initialSupplyItems.map((item) => ({
        id: `${item.product_id}-${Date.now()}-${Math.random()}`,
        name: item.name,
        category: item.category,
        size: "-", // 기본값 (API에서 사이즈 정보가 없으면 기본값 사용)
        product_id: item.product_id,
        price: item.price,
        quantity: item.quantity,
        season: item.season,
      }));

      const initialCounts: Record<string, number> = {};
      initialItems.forEach((item) => {
        initialCounts[item.id] = item.quantity || 0;
      });

      setSupplyItems(initialItems);
      setItemCounts(initialCounts);
      isInitialized.current = true;
    }
  }, [initialSupplyItems]);

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
    removeItem,
    updateItem,
    updateCount,
  };
};
