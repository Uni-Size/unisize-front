import { useEffect, useState } from "react";

/**
 * 값이 일정 시간 동안 더 이상 바뀌지 않을 때만 갱신되는 "지연된 사본"을 돌려준다.
 *
 * 검색어처럼 타이핑할 때마다 바뀌는 값을 API 요청 트리거로 쓸 때 사용한다.
 * 화면 입력값(즉시 반영)과 요청에 실을 값(지연 반영)을 분리하는 것이 핵심이다.
 *
 * @example
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearch = useDebouncedValue(searchTerm, 300);
 * // <input>은 searchTerm을 쓰고(입력이 끊기지 않음),
 * // API 호출은 debouncedSearch가 바뀔 때만 나간다.
 *
 * @param value 감시할 값
 * @param delay 값이 멈춘 뒤 반영까지 기다릴 시간(ms). 기본 300ms
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    // value가 delay 안에 또 바뀌면 이전 타이머를 버린다.
    // 이 정리(cleanup)가 없으면 타이핑한 글자 수만큼 갱신이 줄줄이 예약된다.
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
