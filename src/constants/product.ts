// ============================================================================
// 교복 품목 공통 옵션
// ============================================================================

export interface SelectOption {
  value: string;
  label: string;
}

export const SEASON_OPTIONS: SelectOption[] = [
  { value: "S", label: "하복(S)" },
  { value: "W", label: "동복(W)" },
  { value: "A", label: "사계절(A)" },
];

export const SEASON_LABEL_MAP: Record<string, string> = Object.fromEntries(
  SEASON_OPTIONS.map((opt) => [opt.value, opt.label]),
);

export const getSeasonLabel = (value: string): string =>
  SEASON_LABEL_MAP[value] ?? value;

export const REPAIRABLE_OPTIONS: SelectOption[] = [
  { value: "yes", label: "가능" },
  { value: "no", label: "불가능" },
];

export const REPAIR_REQUIRED_OPTIONS: SelectOption[] = [
  { value: "required", label: "필수" },
  { value: "optional", label: "선택사항" },
];

export const SIZE_TYPE_OPTIONS: SelectOption[] = [
  { value: "numeric", label: "치수형" },
  { value: "alpha", label: "S/M/L단위" },
  { value: "free", label: "FREE" },
];

export const NUMERIC_STEP_OPTIONS: SelectOption[] = [
  { value: "5", label: "5단위" },
  { value: "3", label: "3단위" },
];

export const DEFAULT_SIZES: Record<string, string[]> = {
  numeric_5: [
    "80",
    "85",
    "90",
    "95",
    "100",
    "105",
    "110",
    "115",
    "120",
    "125",
    "130",
    "135",
  ],
  numeric_3: [
    "59",
    "62",
    "65",
    "68",
    "71",
    "74",
    "77",
    "80",
    "83",
    "86",
    "89",
    "92",
    "95",
    "98",
    "101",
    "104",
    "110",
    "116",
  ],
  alpha: ["XS", "S", "M", "L", "XL", "XXL"],
  free: ["FREE"],
};

const ALPHA_ORDER = [
  "5XS", "4XS", "3XS", "XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL",
];

// 사이즈는 관리자가 자유 텍스트로 입력해서 같은 등급이 "3XL"로도 "XXXL"로도 적힌다.
// 백엔드(sortSizeLabels)와 같은 표를 써서 별칭을 정규 표기로 접어야 표기가 섞여도
// 순서가 안 깨진다.
const ALPHA_ALIASES: [string, string][] = [
  ["2XS", "XXS"], ["XXXS", "3XS"], ["XXXXS", "4XS"], ["XXXXXS", "5XS"],
  ["2XL", "XXL"], ["XXXL", "3XL"], ["XXXXL", "4XL"], ["XXXXXL", "5XL"],
];

const ALPHA_RANK = new Map<string, number>([
  ...ALPHA_ORDER.map((size, i): [string, number] => [size, i]),
  ...ALPHA_ALIASES.map(([alias, canonical]): [string, number] => [
    alias,
    ALPHA_ORDER.indexOf(canonical),
  ]),
]);

const alphaRank = (size: string): number =>
  ALPHA_RANK.get(size.trim().toUpperCase()) ?? -1;

export const compareSizes = (a: string, b: string): number => {
  const ai = alphaRank(a);
  const bi = alphaRank(b);
  if (ai !== -1 && bi !== -1) return ai - bi;
  const an = parseFloat(a);
  const bn = parseFloat(b);
  if (!isNaN(an) && !isNaN(bn)) return an - bn;
  return a.localeCompare(b);
};

export const sortSizes = (sizes: string[]): string[] => [...sizes].sort(compareSizes);

/** @deprecated SIZE_TYPE_OPTIONS 사용 */
export const SIZE_UNIT_OPTIONS = SIZE_TYPE_OPTIONS;
