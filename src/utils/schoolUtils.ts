// 현재 월에 따라 조회할 연도 결정 (12월이면 내년)
export const getTargetYear = () => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 0-based이므로 +1
  const currentYear = now.getFullYear();
  return currentMonth === 12 ? currentYear + 1 : currentYear;
};

// 학교 타입에 따른 기본 생년월일 계산
export const getDefaultBirthDate = (
  schoolName: string,
  admissionYear: number
): string => {
  const isMiddleSchool = schoolName.includes('중학교');
  const isHighSchool = schoolName.includes('고등학교');

  let birthYear: number;

  if (isMiddleSchool) {
    birthYear = admissionYear - 11;
  } else if (isHighSchool) {
    birthYear = admissionYear - 15;
  } else {
    birthYear = admissionYear - 11;
  }

  return `${birthYear}-01-01`;
};
