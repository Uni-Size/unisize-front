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

const ALPHA_ORDER = ["XXS", "XS", "S", "M", "L", "XL", "XXL"];

export const sortSizes = (sizes: string[]): string[] =>
  [...sizes].sort((a, b) => {
    const ai = ALPHA_ORDER.indexOf(a.toUpperCase());
    const bi = ALPHA_ORDER.indexOf(b.toUpperCase());
    if (ai !== -1 && bi !== -1) return ai - bi;
    const an = parseFloat(a);
    const bn = parseFloat(b);
    if (!isNaN(an) && !isNaN(bn)) return an - bn;
    return a.localeCompare(b);
  });

/** @deprecated SIZE_TYPE_OPTIONS 사용 */
export const SIZE_UNIT_OPTIONS = SIZE_TYPE_OPTIONS;
