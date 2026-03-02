// ============================================================================
// 성별 상수
// ============================================================================

export interface GenderOption {
  value: string;
  label: string;
}

/** M/F/U 전체 옵션 (교복 품목 등 공용 포함) */
export const GENDER_OPTIONS: GenderOption[] = [
  { value: 'M', label: '남' },
  { value: 'F', label: '여' },
  { value: 'U', label: '공용' },
];

/** M/F 옵션 (학생 등 공용 제외) */
export const GENDER_OPTIONS_MF: GenderOption[] = [
  { value: 'M', label: '남' },
  { value: 'F', label: '여' },
];

/** value → label 변환 */
export const GENDER_LABEL_MAP: Record<string, string> = {
  M: '남',
  F: '여',
  U: '공용',
};

export const getGenderLabel = (value: string): string =>
  GENDER_LABEL_MAP[value] ?? value;
