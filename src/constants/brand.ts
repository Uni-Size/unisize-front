// 운영 문구가 기본값이고, dev 빌드에서만 VITE_BRAND_NAME으로 덮어씁니다.
export const BRAND_NAME =
  import.meta.env.VITE_BRAND_NAME || "스마트학생복 청주점";

export const ADMIN_TEST_ID =
  import.meta.env.VITE_ADMIN_TEST_ID || "01048102606";
