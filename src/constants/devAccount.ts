// dev 데모용 로그인 자동입력 계정. 값은 코드가 아니라 dev 빌드의 환경변수에서만 옵니다.
// 운영 빌드는 VITE_DEV_* 를 정의하지 않으므로 빈 문자열로 폴백되고, 자격증명 문자열 자체가 번들에 남지 않습니다.
export const DEV_ADMIN_ACCOUNT = {
  employeeId: import.meta.env.VITE_DEV_ADMIN_ID || '',
  password: import.meta.env.VITE_DEV_ADMIN_PASSWORD || '',
};

export const DEV_STAFF_ACCOUNT = {
  employeeId: import.meta.env.VITE_DEV_STAFF_ID || '',
  password: import.meta.env.VITE_DEV_STAFF_PASSWORD || '',
};
