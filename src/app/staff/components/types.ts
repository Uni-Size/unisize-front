export type SupplyItem = {
  id: string;
  name: string;
  category: string;
  size: string;
};

export type UniformSizeItem = {
  id: string;
  itemId: string;
  name: string;
  season: "동복" | "하복";
  selectedSize: number;
  customization: string;
  pantsLength?: string;
  purchaseCount: number;
};

export type MeasurementMode = "new" | "edit" | "readonly";
