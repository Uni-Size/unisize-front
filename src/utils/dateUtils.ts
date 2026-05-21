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
export function formatShortDate(value: string | null | undefined): string {
  if (!value) return "";
  const d = parseDate(value);
  if (isNaN(d.getTime())) return "";
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yy}.${mm}.${dd}`;
}

/**
 * 날짜 문자열을 "YYYY년 MM월 DD일" 형식으로 변환
 * ISO 8601 및 "YYYY년 MM월 DD일 HH:mm:ss" 형식 모두 지원
 * 빈 값이나 파싱 불가 문자열은 빈 문자열 반환
 */
export function formatDate(value: string | null | undefined): string {
  if (!value) return "";
  const d = parseDate(value);
  if (isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}년 ${mm}월 ${dd}일`;
}
