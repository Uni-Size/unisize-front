// 교체 가능(selectable_with) 품목 그룹핑 공용 유틸.
//
// 배경: "교체 가능" 그룹(예: 치마 ↔ 바지)은 여러 품목이 지원 한도(supported_quantity)
// 하나를 공유한다. 화면에는 그룹당 한 행(대표/canonical)만 보여주고, 나머지는
// 그 행의 드롭다운 대안(alternatives)으로 노출해야 한다. 그렇지 않으면 두 품목이
// 각각 별도 행으로 보여서 스태프/관리자가 실수로 둘 다 확정해 지원 한도가
// 이중으로 소진될 수 있다.
//
// 이 로직이 화면마다(관리자 학교상세/학생목록/학생모달, 스태프 측정폼) 조금씩
// 다르게 재구현되어 있었고 휴리스틱이 서로 어긋나 있었다(카테고리 문자열
// "skirt"/"치마" 매칭, item_id를 selectable_with 이름 목록과 비교하는 버그 등).
// 백엔드가 그룹 멤버/지원수량 계산을 단일 리졸버로 통합했으므로, 프론트도
// "그룹을 묶고 대표를 고르는" 알고리즘 자체는 여기 하나로 통합한다.

export interface SelectableGroupResult<T> {
  /** 그룹의 대표(화면에 실제로 보여줄) 품목 */
  canonical: T;
  /** 대표를 제외한 나머지 그룹 멤버(드롭다운 대안 등으로 사용) */
  alternatives: T[];
}

export interface SelectableGroupAdapter<T> {
  /** 그룹 내에서 이 품목을 유일하게 식별하는 키 (예: product_name, product_id) */
  getKey: (item: T) => string;
  /** 이 품목과 교체 가능한 다른 품목들의 키 목록 (예: selectable_with) */
  getLinkedKeys: (item: T) => string[] | undefined;
  /** true를 반환하는 첫 멤버가 최우선으로 대표가 된다 (예: 저장된 실제 선택) */
  isSelected?: (item: T) => boolean;
  /** isSelected로 정해지지 않았을 때 차순위 기준 (예: 성별 일치, 이름 패턴 일치) */
  matchesPreferred?: (item: T) => boolean;
}

/**
 * 품목 목록을 selectable_with로 연결된 그룹(전이적 폐쇄, transitive closure)으로
 * 묶고, 그룹마다 대표 품목 하나를 고른다.
 *
 * - 단순 페어(A↔B)뿐 아니라 A→B, B→C처럼 한쪽에만 연결이 걸려 있어도(원본
 *   데이터가 비대칭적으로 채워진 경우) BFS로 하나의 그룹으로 묶는다.
 * - 대표 선택 우선순위: isSelected(item) === true > matchesPreferred(item) === true
 *   > 그룹 내에서 원본 배열에 먼저 등장한 품목.
 * - selectable_with가 없거나 연결된 품목이 목록에 없는 경우, 해당 품목은 자기
 *   자신만 있는 1개짜리 그룹(대안 없음)이 된다.
 * - 결과 순서는 원본 배열에서 각 그룹의 첫 등장 순서를 따른다.
 */
export function resolveSelectableGroups<T>(
  items: T[],
  adapter: SelectableGroupAdapter<T>,
): SelectableGroupResult<T>[] {
  const { getKey, getLinkedKeys, isSelected, matchesPreferred } = adapter;

  const byKey = new Map<string, T>();
  for (const item of items) {
    byKey.set(getKey(item), item);
  }

  const visited = new Set<string>();
  const results: SelectableGroupResult<T>[] = [];

  for (const item of items) {
    const startKey = getKey(item);
    if (visited.has(startKey)) continue;

    const groupKeys: string[] = [];
    const queue: string[] = [startKey];
    visited.add(startKey);

    while (queue.length > 0) {
      const key = queue.shift()!;
      groupKeys.push(key);
      const current = byKey.get(key);
      if (!current) continue;
      for (const linkedKey of getLinkedKeys(current) ?? []) {
        if (visited.has(linkedKey) || !byKey.has(linkedKey)) continue;
        visited.add(linkedKey);
        queue.push(linkedKey);
      }
    }

    const group = groupKeys
      .map((key) => byKey.get(key))
      .filter((g): g is T => g !== undefined);
    if (group.length === 0) continue;

    const canonical =
      (isSelected && group.find(isSelected)) ||
      (matchesPreferred && group.find(matchesPreferred)) ||
      group[0];
    const alternatives = group.filter((g) => g !== canonical);

    results.push({ canonical, alternatives });
  }

  return results;
}

/** product_name으로 키를 잡고 selectable_with(이름 배열)로 연결되는, 백엔드
 * catalog/recommended 품목 응답 계열이 공통으로 갖는 최소 형태.
 * (RecommendedUniformItem, CatalogUniformItem 모두 이 형태를 만족한다.) */
export interface NamedSelectableItem {
  product_name: string;
  selectable_with?: string[];
  gender?: string;
  is_selected?: boolean;
}

/**
 * RecommendedUniformItem / CatalogUniformItem처럼 product_name으로 식별되고
 * selectable_with가 이름 배열인 품목 목록에 대한 편의 래퍼.
 * 대표 선택 우선순위: is_selected > gender === preferredGenderCode > 첫 품목.
 */
export function resolveNamedSelectableGroups<T extends NamedSelectableItem>(
  items: T[],
  preferredGenderCode?: string,
): SelectableGroupResult<T>[] {
  return resolveSelectableGroups(items, {
    getKey: (item) => item.product_name,
    getLinkedKeys: (item) => item.selectable_with,
    isSelected: (item) => item.is_selected === true,
    matchesPreferred: preferredGenderCode
      ? (item) => item.gender === preferredGenderCode
      : undefined,
  });
}
