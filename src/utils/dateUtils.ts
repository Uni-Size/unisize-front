function parseDate(value: string): Date {
  // "2026년 05월 21일 15:22:16" 형식 처리
  const korean = value.match(/(\d{4})년\s*(\d{2})월\s*(\d{2})일(?:\s*(\d{2}):(\d{2}):(\d{2}))?/);
  if (korean) {
    const [, yyyy, mm, dd, hh = '0', min = '0', ss = '0'] = korean;
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(min), Number(ss));
  }
  return new Date(value);
}

/**
 * 날짜 문자열을 "YY.MM.DD" 형식으로 변환
 */
export function formatDate(value: string | null | undefined): string {
  if (!value) return "";
  const d = parseDate(value);
  if (isNaN(d.getTime())) return "";
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yy}.${mm}.${dd}`;
}

/**
 * 날짜+시간 문자열을 "YY.MM.DD HH:mm" 형식으로 변환 (초 미포함)
 */
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "";
  const d = parseDate(value);
  if (isNaN(d.getTime())) return "";
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${yy}.${mm}.${dd} ${hh}:${min}`;
}

/** @deprecated formatDate 를 사용하세요 */
export const formatShortDate = formatDate;
