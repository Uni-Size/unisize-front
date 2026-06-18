import { useState, useCallback } from 'react';
import type { StartMeasurementResponse, RecommendedUniformItem, SupplyItemResponse, UniformProduct } from '../../../../api/student';

export interface MeasurementUniformItem {
  rowId: string;
  productId: string;
  name: string;
  season: 'winter' | 'summer';
  recommendedSize: string;
  selectedSize: string;
  availableSizes: Array<{ size: string; inStock: boolean; stockCount: number }>;
  supportedQuantity: number;
  additionalQuantity: number;
  unitPrice: number;
  repair: string;
  reservation: boolean;
  received: boolean;
  hasNameTag: boolean;
  nameTagCount: number;
  attachCount: number;
  isRequired: boolean; // 지원수량 > 0이면 삭제 불가
}

export interface MeasurementSupplyItem {
  rowId: string;
  productId: number;
  name: string;
  category: string;
  unitPrice: number;
  quantity: number;
  selectedSize: string;
  availableSizes: { size: string; in_stock: boolean; stock_count: number }[];
}

export interface MeasurementNameTag {
  orderQuantity: number;
  attachQuantity: number;
}

let _rowCounter = 0;
const nextRowId = () => `row_${++_rowCounter}`;

const toUniformItem = (
  item: RecommendedUniformItem,
  season: 'winter' | 'summer',
): MeasurementUniformItem => ({
  rowId: nextRowId(),
  productId: String(item.product_id),
  name: item.product_name,
  season,
  recommendedSize: item.recommended_size,
  selectedSize: item.recommended_size,
  availableSizes: (item.available_sizes ?? []).map((s) => ({ size: s.size, inStock: s.in_stock, stockCount: s.stock_count })),
  supportedQuantity: item.supported_quantity,
  additionalQuantity: Math.max(0, (item.purchase_quantity ?? 0) - item.supported_quantity),
  unitPrice: item.price,
  repair: item.customization ?? '',
  reservation: item.is_reserved ?? false,
  received: !(item.is_reserved ?? false),
  hasNameTag: item.has_name_tag ?? true,
  nameTagCount: (item.has_name_tag ?? true) ? (item.name_tag_count ?? 0) : 0,
  attachCount: (item.has_name_tag ?? true) && item.name_tag_attach ? (item.name_tag_count ?? 0) : 0,
  isRequired: item.supported_quantity > 0,
});

const toSupplyItem = (item: SupplyItemResponse): MeasurementSupplyItem => ({
  rowId: nextRowId(),
  productId: item.product_id,
  name: item.name,
  category: item.category ?? '',
  unitPrice: item.price,
  quantity: item.purchase_quantity ?? item.quantity ?? 0,
  selectedSize: '',
  availableSizes: item.available_sizes ?? [],
});

export function useMeasurementForm() {
  const [winterUniforms, setWinterUniforms] = useState<MeasurementUniformItem[]>([]);
  const [summerUniforms, setSummerUniforms] = useState<MeasurementUniformItem[]>([]);
  const [supplies, setSupplies] = useState<MeasurementSupplyItem[]>([]);
  const [nameTag, setNameTag] = useState<MeasurementNameTag>({ orderQuantity: 0, attachQuantity: 0 });

  const initFromResponse = useCallback((data: StartMeasurementResponse) => {
    const winter = (data.recommended_uniforms?.winter ?? []).map((i) => toUniformItem(i, 'winter'));
    const summer = (data.recommended_uniforms?.summer ?? []).map((i) => toUniformItem(i, 'summer'));
    setWinterUniforms(winter);
    setSummerUniforms(summer);
    setSupplies((data.supply_items ?? []).map(toSupplyItem));
    setNameTag({ orderQuantity: 0, attachQuantity: 0 });
  }, []);

  const reset = useCallback(() => {
    setWinterUniforms([]);
    setSummerUniforms([]);
    setSupplies([]);
    setNameTag({ orderQuantity: 0, attachQuantity: 0 });
  }, []);

  const updateUniform = useCallback(
    (season: 'winter' | 'summer', rowId: string, patch: Partial<MeasurementUniformItem>) => {
      if (patch.reservation !== undefined) {
        patch = { ...patch, received: !patch.reservation };
      }
      const applyPatch = (list: MeasurementUniformItem[]) =>
        list.map((item) => (item.rowId === rowId ? { ...item, ...patch } : item));

      let nextWinter = winterUniforms;
      let nextSummer = summerUniforms;

      if (season === 'winter') {
        nextWinter = applyPatch(winterUniforms);
        setWinterUniforms(nextWinter);
      } else {
        nextSummer = applyPatch(summerUniforms);
        setSummerUniforms(nextSummer);
      }

      if (patch.nameTagCount !== undefined || patch.attachCount !== undefined) {
        const all = [...nextWinter, ...nextSummer];
        const nameTagTotal = all.reduce((sum, i) => sum + i.nameTagCount, 0);
        const attachTotal = all.reduce((sum, i) => sum + i.attachCount, 0);
        const ceiled = nameTagTotal === 0 ? 0 : Math.ceil(nameTagTotal / 8) * 8;
        setNameTag((prev) => ({
          orderQuantity: Math.max(prev.orderQuantity, ceiled),
          attachQuantity: attachTotal,
        }));
      }
    },
    [winterUniforms, summerUniforms],
  );

  const addUniformFromProduct = useCallback(
    (season: 'winter' | 'summer', product: UniformProduct) => {
      const newRow: MeasurementUniformItem = {
        rowId: nextRowId(),
        productId: String(product.product_id),
        name: product.product_name,
        season,
        recommendedSize: product.recommended_size ?? '',
        selectedSize: '',
        availableSizes: (product.available_sizes ?? []).map((s) => ({ size: s, inStock: true, stockCount: 0 })),
        supportedQuantity: 0,
        additionalQuantity: 1,
        unitPrice: product.price,
        repair: '',
        reservation: false,
        received: true,
        hasNameTag: true,
        nameTagCount: 0,
        attachCount: 0,
        isRequired: false,
      };
      if (season === 'winter') {
        setWinterUniforms((prev) => [...prev, newRow]);
      } else {
        setSummerUniforms((prev) => [...prev, newRow]);
      }
    },
    [],
  );

  const addUniformRow = useCallback(
    (season: 'winter' | 'summer', source: MeasurementUniformItem) => {
      const newRow: MeasurementUniformItem = {
        ...source,
        rowId: nextRowId(),
        selectedSize: '',
        supportedQuantity: 0,
        additionalQuantity: 1,
        repair: '',
        reservation: false,
        received: true,
        nameTagCount: 0,
        attachCount: 0,
        isRequired: false,
      };
      if (season === 'winter') {
        setWinterUniforms((prev) => {
          const idx = prev.reduce((r, item, n) => (item.productId === source.productId ? n : r), -1);
          const next = [...prev];
          next.splice(idx + 1, 0, newRow);
          return next;
        });
      } else {
        setSummerUniforms((prev) => {
          const idx = prev.reduce((r, item, n) => (item.productId === source.productId ? n : r), -1);
          const next = [...prev];
          next.splice(idx + 1, 0, newRow);
          return next;
        });
      }
    },
    [],
  );

  const removeUniformRow = useCallback(
    (season: 'winter' | 'summer', rowId: string) => {
      if (season === 'winter') {
        setWinterUniforms((prev) => prev.filter((i) => i.rowId !== rowId));
      } else {
        setSummerUniforms((prev) => prev.filter((i) => i.rowId !== rowId));
      }
    },
    [],
  );

  const updateSupply = useCallback(
    (rowId: string, patch: Partial<MeasurementSupplyItem>) => {
      setSupplies((prev) =>
        prev.map((item) => (item.rowId === rowId ? { ...item, ...patch } : item)),
      );
    },
    [],
  );

  const addSupplyRow = useCallback((source: MeasurementSupplyItem) => {
    const newRow: MeasurementSupplyItem = {
      ...source,
      rowId: nextRowId(),
      quantity: 1,
      selectedSize: '',
    };
    setSupplies((prev) => {
      const idx = prev.reduce((r, item, n) => (item.productId === source.productId ? n : r), -1);
      const next = [...prev];
      next.splice(idx + 1, 0, newRow);
      return next;
    });
  }, []);

  const removeSupplyRow = useCallback((rowId: string) => {
    setSupplies((prev) => prev.filter((i) => i.rowId !== rowId));
  }, []);

  const updateNameTagOrderQuantity = useCallback(
    (value: number) => {
      const all = [...winterUniforms, ...summerUniforms];
      const nameTagTotal = all.reduce((sum, i) => sum + i.nameTagCount, 0);
      const minCeiled = nameTagTotal === 0 ? 0 : Math.ceil(nameTagTotal / 8) * 8;
      const newVal = value === 0 ? 0 : Math.ceil(value / 8) * 8;
      setNameTag((prev) => ({ ...prev, orderQuantity: Math.max(newVal, minCeiled) }));
    },
    [winterUniforms, summerUniforms],
  );

  const updateNameTagAttachQuantity = useCallback((value: number) => {
    setNameTag((prev) => ({ ...prev, attachQuantity: value }));
  }, []);

  return {
    winterUniforms,
    summerUniforms,
    supplies,
    nameTag,
    initFromResponse,
    reset,
    updateUniform,
    addUniformFromProduct,
    addUniformRow,
    removeUniformRow,
    updateSupply,
    addSupplyRow,
    removeSupplyRow,
    updateNameTagOrderQuantity,
    updateNameTagAttachQuantity,
  };
}
