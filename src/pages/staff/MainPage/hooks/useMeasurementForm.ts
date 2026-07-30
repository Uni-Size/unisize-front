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
  // 이 행이 속한 교체 가능(selectable_with) 그룹의 식별자. 그룹에 속하지 않은
  // 단독 품목이면 undefined — 이 값의 유무로 체크박스 노출 여부를 결정한다.
  groupId?: string;
  // 그룹이 공유하는 무상지원 한도(예: 치마/바지가 함께 1개를 공유하면 1).
  // 그룹 멤버 전원이 동일한 값을 가진다(백엔드 보장).
  groupQuantity?: number;
  // 이 행이 현재 그룹의 공유 지원 한도를 사용 중인지 여부. true면
  // supportedQuantity가 groupQuantity, false면 0이 된다. 같은 그룹 내에서는
  // 체크된 행의 합이 groupQuantity를 넘지 않는다(대부분 quantity=1이므로
  // 사실상 그룹 내 정확히 1행만 체크됨).
  isSupportChecked?: boolean;
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
  group?: { groupId: string; groupQuantity: number; isSupportChecked: boolean },
): MeasurementUniformItem => {
  // 그룹에 속한 행은 체크 상태에 따라 지원수량이 groupQuantity 또는 0이 된다.
  // 그룹에 속하지 않은 단독 품목은 백엔드가 내려준 supported_quantity를 그대로 쓴다.
  const supportedQuantity = group ? (group.isSupportChecked ? group.groupQuantity : 0) : item.supported_quantity;
  return {
    rowId: nextRowId(),
    productId: String(item.product_id),
    name: item.product_name,
    category: item.category,
    season,
    recommendedSize: item.recommended_size,
    selectedSize: item.recommended_size,
    availableSizes: (item.available_sizes ?? []).map((s) => ({ size: s.size, inStock: s.in_stock, stockCount: s.stock_count })),
    supportedQuantity,
    additionalQuantity: Math.max(0, (item.purchase_quantity ?? 0) - item.supported_quantity),
    unitPrice: item.price,
    repair: item.customization ?? '',
    reservation: item.is_reserved ?? false,
    received: !(item.is_reserved ?? false),
    nameTagCount: item.name_tag_count ?? 0,
    nameTagAttach: item.name_tag_attach ?? false,
    isRequired: supportedQuantity > 0,
    isManuallyAdded: false,
    isCustomizationRequired: item.is_customization_required ?? false,
    groupId: group?.groupId,
    groupQuantity: group?.groupQuantity,
    isSupportChecked: group?.isSupportChecked,
  };
};

// 학교의 시즌 전체 품목(catalog_uniforms, 성별 무관)을 화면에 그릴 행 목록으로
// 변환한다. selectable_with로 묶여 지원 한도를 공유하는 그룹(예: 치마/바지)은
// 예전에는 한 행으로 묶고 나머지를 드롭다운 대안으로 숨겼지만, 이 방식은
// 스태프가 "+"로 추가한 행의 드롭다운으로 그룹을 교체하면 그 행이 그룹의
// 공유 지원수량을 다시 채워 넣어(supportedQuantity: target.supportedQuantity)
// 원래 행과 이중으로 지원 처리되는 버그가 있었다. 지금은 그룹 멤버 전원을
// 각자의 행으로 항상 보여주고, 그룹당 groupQuantity만큼만 체크(지원 적용)될
// 수 있는 체크박스로 어느 행이 지원을 받을지 명시적으로 고르게 한다
// (toggleGroupSupport 참고).
//
// 그룹핑 알고리즘 자체는 공용 유틸로 통합됨(src/utils/selectableGroups.ts).
// 초기 체크(대표) 선택 우선순위:
//   1. is_selected: true인 멤버 — 스태프가 이미 저장해둔 실제 선택. 이걸
//      무시하고 성별로만 고르면, 예를 들어 여학생이 치마→바지로 교체 저장한
//      뒤 화면을 새로고침했을 때 바지 선택이 사라지고 치마가 기본값(지원수량
//      그대로)으로 보이는 버그가 생긴다.
//   2. 학생 성별과 일치하는 품목 — 저장된 주문이 없는 최초 진입 시의 기본값.
//   3. 그룹의 첫 번째 품목 — 성별 정보가 없거나 일치하는 멤버가 없을 때.
const buildSeasonUniforms = (
  rawItems: CatalogUniformItem[],
  season: 'winter' | 'summer',
  studentGenderCode?: 'M' | 'F' | 'U',
): MeasurementUniformItem[] => {
  const result: MeasurementUniformItem[] = [];
  resolveNamedSelectableGroups(rawItems, studentGenderCode).forEach(({ canonical, alternatives }, groupIndex) => {
    if (alternatives.length === 0) {
      result.push(toUniformItem(canonical, season));
      return;
    }
    const groupId = `group_${season}_${groupIndex}`;
    // 백엔드가 그룹 멤버 전원에게 동일한 supported_quantity를 내려주므로
    // (CreateMeasurementOrder와 동일 계산 규칙), 대표(canonical)의 값을 그룹
    // 전체가 공유하는 정원으로 써도 안전하다.
    const groupQuantity = canonical.supported_quantity;
    [canonical, ...alternatives].forEach((member) => {
      result.push(
        toUniformItem(member, season, {
          groupId,
          groupQuantity,
          isSupportChecked: member === canonical,
        }),
      );
    });
  });
  return result;
};

// 교체 가능 품목 그룹(groupId)에서 rowId 행의 지원 체크 상태를 토글한 새 목록을
// 반환하는 순수 함수. React 상태와 분리해두어 유닛 테스트가 가능하다.
//   - 체크 해제 -> 체크 시: 그룹 정원(groupQuantity)을 넘지 않도록, 이미 체크된
//     다른 행이 있으면 배열 등장 순서상 오래된 것부터 필요한 만큼 해제한다
//     (대부분 quantity=1이라 사실상 "다른 행 전부 해제"가 된다).
//   - 체크 -> 체크 해제 시: 이 행만 해제한다(다른 행은 그대로).
// 체크된 행은 supportedQuantity=groupQuantity, 해제된 행은 supportedQuantity=0.
// 그룹에 속하지 않은 행(groupId 없음)을 대상으로 호출하면 아무 변화 없이
// 원본 목록을 그대로 반환한다.
export function applyGroupSupportToggle(
  list: MeasurementUniformItem[],
  rowId: string,
): MeasurementUniformItem[] {
  const target = list.find((i) => i.rowId === rowId);
  if (!target || !target.groupId) return list;
  const { groupId } = target;
  const groupQuantity = target.groupQuantity ?? 1;
  const nextChecked = !target.isSupportChecked;

  if (!nextChecked) {
    return list.map((item) =>
      item.rowId === rowId
        ? { ...item, isSupportChecked: false, supportedQuantity: 0, isRequired: false }
        : item,
    );
  }

  const otherMembers = list.filter((i) => i.groupId === groupId && i.rowId !== rowId);
  const currentlyChecked = otherMembers.filter((i) => i.isSupportChecked);
  const overflow = currentlyChecked.length + 1 - groupQuantity;
  const toUncheck = new Set(
    overflow > 0 ? currentlyChecked.slice(0, overflow).map((i) => i.rowId) : [],
  );

  return list.map((item) => {
    if (item.rowId === rowId) {
      return {
        ...item,
        isSupportChecked: true,
        supportedQuantity: groupQuantity,
        isRequired: groupQuantity > 0,
      };
    }
    if (toUncheck.has(item.rowId)) {
      return { ...item, isSupportChecked: false, supportedQuantity: 0, isRequired: false };
    }
    return item;
  });
}

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

  // 교체 가능 품목 그룹(groupId)에서 스태프가 어느 행에 무상지원을 적용할지
  // 고를 때 사용. rowId 행을 토글한다(순수 함수 apply로 분리해 유닛 테스트 가능).
  const toggleGroupSupport = useCallback(
    (season: 'winter' | 'summer', rowId: string) => {
      if (season === 'winter') {
        setWinterUniforms((prev) => applyGroupSupportToggle(prev, rowId));
      } else {
        setSummerUniforms((prev) => applyGroupSupportToggle(prev, rowId));
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
        // 그룹에 속한 품목을 "+"로 복제한 행(추가 구매 전용)은 그룹 소속은
        // 유지하되(체크박스로 나중에 지원을 옮겨 받을 수 있음), 생성 시점엔
        // 항상 미체크 상태로 시작한다. 이걸 source에서 그대로 물려받으면
        // supportedQuantity=0인데 isSupportChecked=true인 모순 상태가 되어,
        // 복제 행이 그룹의 무상지원 한도를 원본 행과 이중으로 표시하게 된다.
        isSupportChecked: source.groupId ? false : undefined,
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
    toggleGroupSupport,
    addUniformRow,
    removeUniformRow,
    updateSupply,
    addSupplyRow,
    removeSupplyRow,
    updateNameTagOrderQuantity,
  };
}
