import { useState, useCallback } from 'react';
import type { StartMeasurementResponse, CatalogUniformItem, SupplyItemResponse } from '../../../../api/student';
import { sortUniformsByCategoryGroup } from '@/constants/productCategories';
import { resolveNamedSelectableGroups } from '@/utils/selectableGroups';

// 학생 gender 값(다양한 표기: "M"/"F"/"male"/"남" 등)을 카탈로그 품목의
// gender 코드("M"|"F"|"U")로 정규화한다. 매칭 안 되면 undefined.
const normalizeGenderCode = (gender?: string | null): 'M' | 'F' | 'U' | undefined => {
  if (!gender) return undefined;
  switch (gender.toLowerCase()) {
    case 'm':
    case 'male':
    case '남':
    case '남자':
      return 'M';
    case 'f':
    case 'female':
    case '여':
    case '여자':
      return 'F';
    case 'u':
    case 'unisex':
    case '공용':
      return 'U';
    default:
      return undefined;
  }
};

// 지원 한도를 공유하는 교체 가능 품목(예: 치마 ↔ 바지) 중, 현재 선택되지 않은
// 대안 하나를 나타낸다. 스태프가 드롭다운에서 이 대안을 고르면 현재 행이
// 이 품목으로 교체된다.
export interface SelectableAlternative {
  productId: string;
  name: string;
  recommendedSize: string;
  availableSizes: Array<{ size: string; inStock: boolean; stockCount: number }>;
  supportedQuantity: number;
  unitPrice: number;
  isCustomizationRequired: boolean;
}

export interface MeasurementUniformItem {
  rowId: string;
  productId: string;
  name: string;
  category?: string;
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
  // 스태프가 "+" 버튼으로 직접 추가한 행인지 여부. 학교 카탈로그에 원래 있던
  // 품목(지원수량이 0이어도)과 구분하기 위한 값 — 삭제(×) 버튼 노출 여부와
  // 수량 최소값(min=1) 판단에 쓰인다.
  isManuallyAdded: boolean;
  // 이 품목과 지원 한도를 공유하는 교체 가능한 대안들 (예: 바지 행이면 [치마]).
  // 비어있거나 없으면 교체 UI를 보여주지 않는다.
  selectableWith?: SelectableAlternative[];
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
  item: CatalogUniformItem,
  season: 'winter' | 'summer',
  selectableWith: SelectableAlternative[] = [],
): MeasurementUniformItem => ({
  rowId: nextRowId(),
  productId: String(item.product_id),
  name: item.product_name,
  category: item.category,
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
  isManuallyAdded: false,
  isCustomizationRequired: item.is_customization_required ?? false,
  selectableWith: selectableWith.length > 0 ? selectableWith : undefined,
});

const toSelectableAlternative = (item: CatalogUniformItem): SelectableAlternative => ({
  productId: String(item.product_id),
  name: item.product_name,
  recommendedSize: item.recommended_size,
  availableSizes: (item.available_sizes ?? []).map((s) => ({ size: s.size, inStock: s.in_stock, stockCount: s.stock_count })),
  supportedQuantity: item.supported_quantity,
  unitPrice: item.price,
  isCustomizationRequired: item.is_customization_required ?? false,
});

// 학교의 시즌 전체 품목(catalog_uniforms, 성별 무관)을 화면에 그릴 행 목록으로
// 변환한다. selectable_with로 묶여 지원 한도를 공유하는 그룹(예: 치마/바지)은
// 두 행을 다 만들면 스태프가 실수로 둘 다 확정해서 지원 한도가 이중으로
// 소진될 수 있으므로, 한 행으로 묶고 나머지는 그 행의 selectableWith 옵션으로
// 드롭다운 교체할 수 있게 한다. 백엔드가 그룹 멤버 전원에게 동일한
// supported_quantity를 내려주므로(CreateMeasurementOrder와 동일 계산 규칙)
// 어느 멤버를 기본으로 고르든 화면에 보이는 지원 개수는 항상 정확하다.
//
// 그룹핑/대표(canonical) 선택 알고리즘은 공용 유틸로 통합됨
// (src/utils/selectableGroups.ts). 대표 행 선택 우선순위:
//   1. is_selected: true인 멤버 — 스태프가 이미 저장해둔 실제 교체 선택. 이걸
//      무시하고 성별로만 고르면, 예를 들어 여학생이 치마→바지로 교체 저장한
//      뒤 화면을 새로고침했을 때 바지 선택이 사라지고 치마가 기본값(지원수량
//      그대로)으로 보이는 버그가 생긴다.
//   2. 학생 성별과 일치하는 품목 — 저장된 주문이 없는 최초 진입 시의 기본값.
//   3. 그룹의 첫 번째 품목 — 성별 정보가 없거나 일치하는 멤버가 없을 때.
const buildSeasonUniforms = (
  rawItems: CatalogUniformItem[],
  season: 'winter' | 'summer',
  studentGenderCode?: 'M' | 'F' | 'U',
): MeasurementUniformItem[] =>
  resolveNamedSelectableGroups(rawItems, studentGenderCode).map(({ canonical, alternatives }) =>
    toUniformItem(canonical, season, alternatives.map(toSelectableAlternative)),
  );

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

  const initFromResponse = useCallback((data: StartMeasurementResponse, studentGender?: string | null) => {
    const genderCode = normalizeGenderCode(studentGender);
    const winter = sortUniformsByCategoryGroup(
      buildSeasonUniforms(data.catalog_uniforms?.winter ?? [], 'winter', genderCode),
    );
    const summer = sortUniformsByCategoryGroup(
      buildSeasonUniforms(data.catalog_uniforms?.summer ?? [], 'summer', genderCode),
    );
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

  // 교체 가능 품목 그룹(selectableWith)에서 스태프가 다른 품목으로 바꿀 때 사용.
  // 현재 행을 targetProductId 품목으로 교체하고, 원래 있던 품목은 다시
  // selectableWith 목록에 넣어 언제든 되돌릴 수 있게 한다. 그룹 멤버는 항상
  // 동일한 supported_quantity를 가지므로(백엔드 보장) 교체해도 지원 개수는
  // 그대로 유지된다.
  const switchUniformProduct = useCallback(
    (season: 'winter' | 'summer', rowId: string, targetProductId: string) => {
      const applySwitch = (list: MeasurementUniformItem[]) =>
        list.map((item) => {
          if (item.rowId !== rowId || item.productId === targetProductId) return item;
          const target = item.selectableWith?.find((a) => a.productId === targetProductId);
          if (!target) return item;

          const previousAsAlternative: SelectableAlternative = {
            productId: item.productId,
            name: item.name,
            recommendedSize: item.recommendedSize,
            availableSizes: item.availableSizes,
            supportedQuantity: item.supportedQuantity,
            unitPrice: item.unitPrice,
            isCustomizationRequired: item.isCustomizationRequired,
          };
          const remainingAlternatives = (item.selectableWith ?? []).filter(
            (a) => a.productId !== targetProductId,
          );

          return {
            ...item,
            productId: target.productId,
            name: target.name,
            recommendedSize: target.recommendedSize,
            selectedSize: target.recommendedSize,
            availableSizes: target.availableSizes,
            supportedQuantity: target.supportedQuantity,
            unitPrice: target.unitPrice,
            isCustomizationRequired: target.isCustomizationRequired,
            isRequired: target.supportedQuantity > 0,
            repair: '',
            selectableWith: [previousAsAlternative, ...remainingAlternatives],
          };
        });

      if (season === 'winter') {
        setWinterUniforms((prev) => applySwitch(prev));
      } else {
        setSummerUniforms((prev) => applySwitch(prev));
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
        isManuallyAdded: true,
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
    switchUniformProduct,
    addUniformRow,
    removeUniformRow,
    updateSupply,
    addSupplyRow,
    removeSupplyRow,
    updateNameTagOrderQuantity,
  };
}
