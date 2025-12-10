export type SupplyItem = {
  id: string;
  name: string;
  category: string;
  size: string;
  product_id?: number;
  price?: number;
  quantity?: number;
  season?: string;
  available_sizes?: Array<{
    size: string;
    in_stock: boolean;
    stock_count: number;
  }>;
};

export type UniformSizeItem = {
  id: string;
  itemId: string;
  productId?: number;
  name: string;
  season: "동복" | "하복";
  selectedSize: number;
  customization: string;
  purchaseCount: number;
  freeQuantity?: number;
  price?: number;
  isCustomizationRequired?: boolean;
};

export type MeasurementMode = "new" | "edit" | "readonly";
