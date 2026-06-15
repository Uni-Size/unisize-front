/**
 * 다양한 형태의 성별 값을 한글(남/여/공용)로 변환
 * 지원 케이스: "M", "F", "U", "male", "female", "unisex", "남", "여", "공용"
 */
export function formatGender(gender: string | null | undefined): string {
  if (!gender) return '';
  switch (gender.toLowerCase()) {
    case 'm':
    case 'male':
    case '남':
    case '남자':
      return '남';
    case 'f':
    case 'female':
    case '여':
    case '여자':
      return '여';
    case 'u':
    case 'unisex':
    case '공용':
      return '공용';
    default:
      return gender;
  }
}
