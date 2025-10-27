// 지원 학교 목록 더미 데이터
export const SUPPORTED_SCHOOLS = [
  "서울고등학교",
  "경기고등학교",
  "부산고등학교",
  "대구고등학교",
  "인천고등학교",
];

// 학년 옵션 더미 데이터
export const GRADE_OPTIONS = [
  { value: 1, label: "1학년" },
  { value: 2, label: "2학년" },
  { value: 3, label: "3학년" },
];

// 입력 필드 유효성 검사 범위
export const VALIDATION_RANGES = {
  height: { min: 130, max: 200 },
  weight: { min: 30, max: 150 },
  shoulder: { min: 30, max: 60 },
  waist: { min: 20, max: 40 },
};

// 개인정보 수집 이용 동의 안내문
export const PRIVACY_POLICY = {
  title: "개인정보 수집·이용에 동의합니다. (필수)",
  items: [
    "수집항목: 학생 이름, 생년월일, 성별, 연락처, 보호자 연락처",
    "이용목적: 무상교복 지원 사업 신청 및 교복 수선 서비스 제공",
    "보유기간: 업무 처리 완료 후 3년",
  ],
};
