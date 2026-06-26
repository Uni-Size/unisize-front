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
  nameTagCount: number;
  nameTagAttach: boolean;
  isRequired: boolean; // 지원수량 > 0이면 삭제 불가
  isCustomizationRequired: boolean;
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
  nameTagCount: item.name_tag_count ?? 0,
  nameTagAttach: item.name_tag_attach ?? false,
  isRequired: item.supported_quantity > 0,
  isCustomizationRequired: item.is_customization_required ?? false,
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

const calcNameTagSummary = (
  all: MeasurementUniformItem[],
  minUnit: number,
  prevOrderQuantity: number,
): MeasurementNameTag => {
  const nameTagTotal = all.reduce((sum, i) => sum + i.nameTagCount, 0);
  const attachTotal = all.reduce((sum, i) => (i.nameTagAttach ? sum + i.nameTagCount : sum), 0);
  const minCeiled = nameTagTotal === 0 ? 0 : Math.ceil(nameTagTotal / minUnit) * minUnit;
  return {
    orderQuantity: Math.max(prevOrderQuantity, minCeiled),
    attachQuantity: attachTotal,
  };
};

export function useMeasurementForm() {
  const [winterUniforms, setWinterUniforms] = useState<MeasurementUniformItem[]>([]);
  const [summerUniforms, setSummerUniforms] = useState<MeasurementUniformItem[]>([]);
  const [supplies, setSupplies] = useState<MeasurementSupplyItem[]>([]);
  const [nameTag, setNameTag] = useState<MeasurementNameTag>({ orderQuantity: 0, attachQuantity: 0 });
  const [nameTagMinUnit, setNameTagMinUnit] = useState(8);
  const [nameTagName, setNameTagName] = useState('');

  const initFromResponse = useCallback((data: StartMeasurementResponse) => {
    const winter = (data.recommended_uniforms?.winter ?? []).map((i) => toUniformItem(i, 'winter'));
    const summer = (data.recommended_uniforms?.summer ?? []).map((i) => toUniformItem(i, 'summer'));
    const minUnit = data.name_tag_service?.min_unit ?? 8;
    setWinterUniforms(winter);
    setSummerUniforms(summer);
    setSupplies((data.supply_items ?? []).map(toSupplyItem));
    setNameTagMinUnit(minUnit);
    setNameTag(calcNameTagSummary([...winter, ...summer], minUnit, 0));
    setNameTagName(data.name_tag_name ?? data.student_name ?? '');
  }, []);

  const reset = useCallback(() => {
    setWinterUniforms([]);
    setSummerUniforms([]);
    setSupplies([]);
    setNameTagMinUnit(8);
    setNameTag({ orderQuantity: 0, attachQuantity: 0 });
    setNameTagName('');
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

      if (patch.nameTagCount !== undefined || patch.nameTagAttach !== undefined) {
        setNameTag((prev) => calcNameTagSummary([...nextWinter, ...nextSummer], nameTagMinUnit, prev.orderQuantity));
      }
    },
    [winterUniforms, summerUniforms, nameTagMinUnit],
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
        nameTagCount: 0,
        nameTagAttach: false,
        isRequired: false,
        isCustomizationRequired: false,
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
        nameTagAttach: false,
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

  // 주문수량은 min_unit 단위로 증감, 품목 행 합계 이하로는 줄일 수 없음
  const updateNameTagOrderQuantity = useCallback(
    (delta: number) => {
      const all = [...winterUniforms, ...summerUniforms];
      const nameTagTotal = all.reduce((sum, i) => sum + i.nameTagCount, 0);
      const minCeiled = nameTagTotal === 0 ? 0 : Math.ceil(nameTagTotal / nameTagMinUnit) * nameTagMinUnit;
      setNameTag((prev) => {
        const next = prev.orderQuantity + delta * nameTagMinUnit;
        return { ...prev, orderQuantity: Math.max(next, minCeiled) };
      });
    },
    [winterUniforms, summerUniforms, nameTagMinUnit],
  );

  return {
    winterUniforms,
    summerUniforms,
    supplies,
    nameTag,
    nameTagMinUnit,
    nameTagName,
    setNameTagName,
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
  };
}
