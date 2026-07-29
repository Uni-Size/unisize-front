export interface CategoryOption {
  value: string;
  label: string;
  group: string;
}

export interface CategoryGroup {
  label: string;
  options: CategoryOption[];
}

export const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    label: '상의',
    options: [
      { value: 'jacket', label: '자켓', group: '상의' },
      { value: 'hood', label: '후드', group: '상의' },
      { value: 'fleece', label: '후리스', group: '상의' },
      { value: 'vest', label: '조끼', group: '상의' },
      { value: 'knit_vest', label: '니트조끼', group: '상의' },
      { value: 'fabric_vest', label: '원단조끼', group: '상의' },
      { value: 'shirt', label: '셔츠', group: '상의' },
      { value: 'blouse', label: '블라우스', group: '상의' },
      { value: 'collar_long', label: '카라긴팔', group: '상의' },
      { value: 'collar_short', label: '반팔카라', group: '상의' },
      { value: 'round_tee', label: '라운드티', group: '상의' },
    ],
  },
  {
    label: '하의',
    options: [
      { value: 'pants_full_elastic', label: '온고무줄긴바지', group: '하의' },
      { value: 'pants_half_elastic', label: '반고무줄긴바지', group: '하의' },
      { value: 'pants_adjuster', label: '조절기긴바지', group: '하의' },
      { value: 'shorts_full_elastic', label: '온고무줄반바지', group: '하의' },
      { value: 'shorts_half_elastic', label: '반고무줄반바지', group: '하의' },
      { value: 'shorts_adjuster', label: '조절기반바지', group: '하의' },
      { value: 'shorts_life', label: '생활복반바지', group: '하의' },
      { value: 'skirt', label: '치마', group: '하의' },
    ],
  },
  {
    label: '체육복',
    options: [
      { value: 'gym_top', label: '체육복 상의', group: '체육복' },
      { value: 'gym_bottom', label: '체육복 하의', group: '체육복' },
    ],
  },
];

export const CATEGORY_OPTIONS: CategoryOption[] = CATEGORY_GROUPS.flatMap(
  (group) => group.options,
);

export const CATEGORY_LABEL_MAP: Record<string, string> = Object.fromEntries(
  CATEGORY_OPTIONS.map((opt) => [opt.value, opt.label]),
);

export const CATEGORY_GROUP_MAP: Record<string, string> = Object.fromEntries(
  CATEGORY_OPTIONS.map((opt) => [opt.value, opt.group]),
);

export const getCategoryLabel = (value: string): string =>
  CATEGORY_LABEL_MAP[value] ?? value;

// label → group 역방향 맵 (API가 category value 대신 한글 레이블을 내려주는 경우 대응)
export const CATEGORY_LABEL_TO_GROUP: Record<string, string> = Object.fromEntries(
  CATEGORY_GROUPS.flatMap((g) => g.options.map((o) => [o.label, g.label])),
);

// CATEGORY_GROUPS 순서(상의 → 하의 → 체육복)를 그룹 정렬 우선순위로 사용한다.
const CATEGORY_GROUP_ORDER: Record<string, number> = Object.fromEntries(
  CATEGORY_GROUPS.map((group, index) => [group.label, index]),
);
// 매핑되지 않은 값은 상의/하의보다 뒤, 체육복보다는 앞에 둔다.
const UNKNOWN_CATEGORY_ORDER = CATEGORY_GROUPS.length - 1;

// category value(예: 'gym_bottom') → 한글 레이블(예: '체육복 하의') → 이름에 포함된 키워드 순으로
// 그룹을 추정한다. category가 아예 없으면 맨 뒤로 보낸다.
const getCategoryGroupOrder = (category?: string): number => {
  if (!category) return CATEGORY_GROUPS.length;
  const group =
    CATEGORY_GROUP_MAP[category] ??
    CATEGORY_LABEL_TO_GROUP[category] ??
    (category.includes('체육') ? '체육복' : undefined);
  return group !== undefined ? CATEGORY_GROUP_ORDER[group] : UNKNOWN_CATEGORY_ORDER;
};

// 교복 목록을 상의 → 하의 → 체육복 순서로 정렬한다 (같은 그룹 내 순서는 유지).
export const sortUniformsByCategoryGroup = <T extends { category?: string }>(
  items: T[],
): T[] =>
  [...items].sort(
    (a, b) => getCategoryGroupOrder(a.category) - getCategoryGroupOrder(b.category),
  );
