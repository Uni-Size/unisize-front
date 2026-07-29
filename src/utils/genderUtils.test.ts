import { describe, expect, it } from 'vitest';
import { formatGender } from './genderUtils';

describe('formatGender', () => {
  it('영문/한글 남성 표기를 "남"으로 변환한다', () => {
    expect(formatGender('M')).toBe('남');
    expect(formatGender('male')).toBe('남');
    expect(formatGender('남')).toBe('남');
    expect(formatGender('남자')).toBe('남');
  });

  it('영문/한글 여성 표기를 "여"로 변환한다', () => {
    expect(formatGender('F')).toBe('여');
    expect(formatGender('female')).toBe('여');
    expect(formatGender('여')).toBe('여');
    expect(formatGender('여자')).toBe('여');
  });

  it('공용 표기를 "공용"으로 변환한다', () => {
    expect(formatGender('U')).toBe('공용');
    expect(formatGender('unisex')).toBe('공용');
    expect(formatGender('공용')).toBe('공용');
  });

  it('대소문자를 구분하지 않는다', () => {
    expect(formatGender('MALE')).toBe('남');
    expect(formatGender('Female')).toBe('여');
  });

  it('알 수 없는 값은 원본 그대로 반환한다', () => {
    expect(formatGender('other')).toBe('other');
  });

  it('빈 값은 빈 문자열을 반환한다', () => {
    expect(formatGender(null)).toBe('');
    expect(formatGender(undefined)).toBe('');
    expect(formatGender('')).toBe('');
  });
});
