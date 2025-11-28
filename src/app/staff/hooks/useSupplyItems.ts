import { useState, useCallback } from "react";
import { SUPPLY_ITEMS_CONFIG } from "@/mocks/measurementData";
import { SupplyItem } from "../components/types";

export const useSupplyItems = () => {
  const [supplyItems, setSupplyItems] = useState<SupplyItem[]>([]);
  const [itemCounts, setItemCounts] = useState<Record<string, number>>({});

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
