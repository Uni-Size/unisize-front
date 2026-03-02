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

export const SIZE_UNIT_OPTIONS: SelectOption[] = [
  { value: "5", label: "5단위" },
  { value: "10", label: "10단위" },
  { value: "free", label: "프리" },
];
