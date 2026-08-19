export const REASON_PRESETS = ['전학', '구매취소', '중복등록', '기타'] as const;

export type ReasonPreset = (typeof REASON_PRESETS)[number];

export const DELETE_REASON_MAX_LENGTH = 255;

// 프리셋과 자유입력을 서버가 받는 단일 문자열로 합친다.
// "기타"는 프리셋 자체로는 의미가 없으므로 자유입력만 보낸다.
export const composeDeleteReason = (preset: ReasonPreset, detail: string) => {
  const trimmed = detail.trim();
  if (preset === '기타') return trimmed;
  return trimmed ? `${preset} - ${trimmed}` : preset;
};
