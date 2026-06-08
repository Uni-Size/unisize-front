import type { StaffInfo } from "@/stores/authStore";
import type { SchoolListResponse, SchoolDetailResponse } from "@/api/school";
import type { GetStudentsResponse, RegisterStudentsResponse, StudentOrdersData } from "@/api/student";
import type { StaffListResponse } from "@/api/staff";
import type { PaymentPendingListResponse } from "@/api/order";
import type { ProductsData } from "@/api/product";

// ============================================================================
// 데모 계정 정보
// ============================================================================

export const DEMO_CREDENTIALS = {
  employee_id: "test",
  password: "test",
};

export const DEMO_STAFF: StaffInfo = {
  id: 9999,
  employee_id: "test",
  employee_name: "포트폴리오 데모",
  role: "admin",
  is_active: true,
  created_at: "2025-01-15T00:00:00Z",
  updated_at: "2026-02-01T00:00:00Z",
  last_login: "2026-02-10T09:00:00Z",
  staff_stats: {
    total_students_handled: 284,
    today_students_handled: 12,
    currently_measuring: 2,
  },
};

// ============================================================================
// 학교 목록 — 초/중/고, 활성/비활성, 영구/기간제 등 다양한 케이스
// ============================================================================

export const MOCK_SCHOOL_LIST: SchoolListResponse = {
  schools: [
    {
      school_name: "한빛초등학교",
      school_type: "초",
      supported_years: [
        { year: 2026, measurement_start_date: "2026-01-05", measurement_end_date: "2026-02-28" },
        { year: 2025, measurement_start_date: "2025-01-06", measurement_end_date: "2025-02-26" },
        { year: 2024, measurement_start_date: "2024-01-08", measurement_end_date: "2024-02-23" },
      ],
      is_active: true,
      is_permanent: true,
      created_at: "2024-01-10T00:00:00Z",
      updated_at: "2026-01-15T00:00:00Z",
    },
    {
      school_name: "세종중학교",
      school_type: "중",
      supported_years: [
        { year: 2026, measurement_start_date: "2026-01-10", measurement_end_date: "2026-02-20" },
        { year: 2025, measurement_start_date: "2025-01-13", measurement_end_date: "2025-02-21" },
      ],
      is_active: true,
      is_permanent: true,
      created_at: "2024-01-20T00:00:00Z",
      updated_at: "2026-02-01T00:00:00Z",
    },
    {
      school_name: "미래고등학교",
      school_type: "고",
      supported_years: [
        { year: 2026, measurement_start_date: "2026-01-15", measurement_end_date: "2026-02-15" },
        { year: 2025, measurement_start_date: "2025-01-16", measurement_end_date: "2025-02-14" },
      ],
      is_active: true,
      is_permanent: false,
      created_at: "2024-02-01T00:00:00Z",
      updated_at: "2026-01-20T00:00:00Z",
    },
    {
      school_name: "별빛초등학교",
      school_type: "초",
      supported_years: [
        { year: 2026, measurement_start_date: "2026-01-20", measurement_end_date: "2026-02-25" },
      ],
      is_active: false,
      is_permanent: false,
      created_at: "2025-01-05T00:00:00Z",
      updated_at: "2026-01-10T00:00:00Z",
    },
    {
      school_name: "푸른중학교",
      school_type: "중",
      supported_years: [
        { year: 2026, measurement_start_date: "2026-01-12", measurement_end_date: "2026-02-22" },
      ],
      is_active: true,
      is_permanent: false,
      created_at: "2025-01-14T00:00:00Z",
      updated_at: "2026-02-01T00:00:00Z",
    },
    {
      school_name: "하늘고등학교",
      school_type: "고",
      supported_years: [
        { year: 2026, measurement_start_date: "2026-01-07", measurement_end_date: "2026-02-14" },
        { year: 2025, measurement_start_date: "2025-01-08", measurement_end_date: "2025-02-15" },
        { year: 2024, measurement_start_date: "2024-01-09", measurement_end_date: "2024-02-16" },
      ],
      is_active: true,
      is_permanent: true,
      created_at: "2023-11-01T00:00:00Z",
      updated_at: "2026-01-05T00:00:00Z",
    },
    {
      school_name: "청솔초등학교",
      school_type: "초",
      supported_years: [
        { year: 2026, measurement_start_date: "2026-01-19", measurement_end_date: "2026-02-27" },
      ],
      is_active: true,
      is_permanent: false,
      created_at: "2025-01-10T00:00:00Z",
      updated_at: "2026-01-10T00:00:00Z",
    },
    {
      school_name: "광명중학교",
      school_type: "중",
      supported_years: [
        { year: 2025, measurement_start_date: "2025-01-20", measurement_end_date: "2025-02-28" },
      ],
      is_active: false,
      is_permanent: false,
      created_at: "2024-02-01T00:00:00Z",
      updated_at: "2025-02-01T00:00:00Z",
    },
  ],
  total: 8,
};

export const MOCK_SCHOOL_DETAIL: SchoolDetailResponse = {
  school_name: "세종중학교",
  school_type: "중",
  is_permanent: true,
  is_active: true,
  created_at: "2024-01-20T00:00:00Z",
  updated_at: "2026-02-01T00:00:00Z",
  years: [
    {
      id: 1,
      year: 2026,
      is_active: true,
      expected_student_count: 180,
      measurement_start_date: "2026-01-10",
      measurement_end_date: "2026-02-20",
    },
    {
      id: 2,
      year: 2025,
      is_active: false,
      expected_student_count: 165,
      measurement_start_date: "2025-01-13",
      measurement_end_date: "2025-02-21",
    },
  ],
  uniforms: {
    winter: [
      { id: 1, product_id: 1, category: "동복 상의", gender: "M", display_name: "남자 동복 상의", contract_price: 85000, free_support_count: 1 },
      { id: 2, product_id: 2, category: "동복 하의", gender: "M", display_name: "남자 동복 바지", contract_price: 65000, free_support_count: 1 },
      { id: 3, product_id: 3, category: "동복 상의", gender: "F", display_name: "여자 동복 상의", contract_price: 85000, free_support_count: 1 },
      { id: 4, product_id: 4, category: "동복 하의", gender: "F", display_name: "여자 동복 치마", contract_price: 65000, free_support_count: 1 },
      { id: 5, product_id: 11, category: "외투", gender: "U", display_name: "공용 패딩", contract_price: 120000, free_support_count: 0 },
    ],
    summer: [
      { id: 6, product_id: 5, category: "하복 상의", gender: "M", display_name: "남자 하복 상의", contract_price: 45000, free_support_count: 1 },
      { id: 7, product_id: 6, category: "하복 하의", gender: "M", display_name: "남자 하복 바지", contract_price: 40000, free_support_count: 1 },
      { id: 8, product_id: 7, category: "하복 상의", gender: "F", display_name: "여자 하복 상의", contract_price: 45000, free_support_count: 1 },
      { id: 9, product_id: 8, category: "하복 하의", gender: "F", display_name: "여자 하복 치마", contract_price: 40000, free_support_count: 1 },
    ],
  },
};

// ============================================================================
// 학생 목록
// 케이스: 신입/재학, 남/여, 배송/방문, 주관구매 여부, 다양한 학교/학년, 연락처 없음
// ============================================================================

export const MOCK_STUDENTS: GetStudentsResponse = {
  data: [
    // 세종중 1학년 신입 - 남, 방문수령, 주관구매X
    { id: 1, name: "김민준", gender: "M", birth_date: "2012-04-15", student_phone: "010-1234-5678", guardian_phone: "010-9876-5432", previous_school: "행복초등학교", admission_year: 2026, admission_grade: 1, admission_school: "세종중학교", school_name: "세종중학교", class_name: "1반", student_number: "1", address: "서울시 강남구 테헤란로 1", privacy_consent: true, delivery: false, grade: 1, checked_in_at: "2026-01-10T09:10:00Z", government_purchase: false, is_eligible_for_public_purchase: false, created_at: "2026-01-10T09:10:00Z", updated_at: "2026-01-10T09:30:00Z" },
    // 세종중 1학년 신입 - 여, 배송, 주관구매O
    { id: 2, name: "이서연", gender: "F", birth_date: "2012-07-22", student_phone: "010-2345-6789", guardian_phone: "010-8765-4321", previous_school: "미래초등학교", admission_year: 2026, admission_grade: 1, admission_school: "세종중학교", school_name: "세종중학교", class_name: "1반", student_number: "2", address: "서울시 강남구 역삼로 22", privacy_consent: true, delivery: true, grade: 1, checked_in_at: "2026-01-10T09:25:00Z", government_purchase: false, is_eligible_for_public_purchase: true, created_at: "2026-01-10T09:25:00Z", updated_at: "2026-01-10T09:50:00Z" },
    // 세종중 2학년 재학 - 남, 주관구매O, government_purchase O
    { id: 3, name: "박지호", gender: "M", birth_date: "2011-01-30", student_phone: "010-3456-7890", guardian_phone: "010-7654-3210", previous_school: "", admission_year: 2025, admission_grade: 2, admission_school: "세종중학교", school_name: "세종중학교", class_name: "2반", student_number: "1", address: "서울시 서초구 방배로 3", privacy_consent: true, delivery: false, grade: 2, checked_in_at: "2026-01-12T10:00:00Z", government_purchase: true, is_eligible_for_public_purchase: true, created_at: "2026-01-12T10:00:00Z", updated_at: "2026-01-12T10:20:00Z" },
    // 세종중 2학년 재학 - 여, 배송
    { id: 4, name: "최예은", gender: "F", birth_date: "2011-09-11", student_phone: "010-4567-8901", guardian_phone: "010-6543-2109", previous_school: "", admission_year: 2025, admission_grade: 2, admission_school: "세종중학교", school_name: "세종중학교", class_name: "2반", student_number: "2", address: "서울시 마포구 합정로 44", privacy_consent: true, delivery: true, grade: 2, checked_in_at: "2026-01-13T10:30:00Z", government_purchase: false, is_eligible_for_public_purchase: false, created_at: "2026-01-13T10:30:00Z", updated_at: "2026-01-13T11:00:00Z" },
    // 세종중 3학년 재학 - 남, 학생 연락처 없음
    { id: 5, name: "정현우", gender: "M", birth_date: "2010-11-05", student_phone: "", guardian_phone: "010-5432-1098", previous_school: "", admission_year: 2024, admission_grade: 3, admission_school: "세종중학교", school_name: "세종중학교", class_name: "3반", student_number: "1", address: "서울시 송파구 올림픽로 55", privacy_consent: true, delivery: false, grade: 3, checked_in_at: "2026-01-14T09:00:00Z", government_purchase: false, is_eligible_for_public_purchase: false, created_at: "2026-01-14T09:00:00Z", updated_at: "2026-01-14T09:25:00Z" },
    // 세종중 3학년 재학 - 여, 배송, 주관구매O
    { id: 6, name: "한소희", gender: "F", birth_date: "2010-03-18", student_phone: "010-6789-0123", guardian_phone: "010-4321-0987", previous_school: "", admission_year: 2024, admission_grade: 3, admission_school: "세종중학교", school_name: "세종중학교", class_name: "3반", student_number: "2", address: "서울시 강서구 화곡로 66", privacy_consent: true, delivery: true, grade: 3, checked_in_at: "2026-01-15T09:40:00Z", government_purchase: false, is_eligible_for_public_purchase: true, created_at: "2026-01-15T09:40:00Z", updated_at: "2026-01-15T10:10:00Z" },
    // 한빛초 1학년 신입 - 남
    { id: 7, name: "오승준", gender: "M", birth_date: "2019-06-25", student_phone: "", guardian_phone: "010-3210-9876", previous_school: "광명유치원", admission_year: 2026, admission_grade: 1, admission_school: "한빛초등학교", school_name: "한빛초등학교", class_name: "1반", student_number: "3", address: "경기도 광명시 소하로 77", privacy_consent: true, delivery: false, grade: 1, checked_in_at: "2026-01-16T10:00:00Z", government_purchase: false, is_eligible_for_public_purchase: false, created_at: "2026-01-16T10:00:00Z", updated_at: "2026-01-16T10:30:00Z" },
    // 한빛초 1학년 신입 - 여, 배송
    { id: 8, name: "윤지아", gender: "F", birth_date: "2019-08-14", student_phone: "", guardian_phone: "010-2109-8765", previous_school: "별빛유치원", admission_year: 2026, admission_grade: 1, admission_school: "한빛초등학교", school_name: "한빛초등학교", class_name: "1반", student_number: "4", address: "경기도 안양시 동안구 평촌대로 88", privacy_consent: true, delivery: true, grade: 1, checked_in_at: "2026-01-17T11:00:00Z", government_purchase: false, is_eligible_for_public_purchase: false, created_at: "2026-01-17T11:00:00Z", updated_at: "2026-01-17T11:20:00Z" },
    // 미래고 1학년 신입 - 남, 주관구매O
    { id: 9, name: "강도윤", gender: "M", birth_date: "2009-02-14", student_phone: "010-9001-2345", guardian_phone: "010-1000-2000", previous_school: "세종중학교", admission_year: 2026, admission_grade: 1, admission_school: "미래고등학교", school_name: "미래고등학교", class_name: "1반", student_number: "1", address: "서울시 관악구 봉천로 9", privacy_consent: true, delivery: false, grade: 1, checked_in_at: "2026-01-20T09:00:00Z", government_purchase: true, is_eligible_for_public_purchase: true, created_at: "2026-01-20T09:00:00Z", updated_at: "2026-01-20T09:40:00Z" },
    // 미래고 1학년 신입 - 여, 배송
    { id: 10, name: "서지민", gender: "F", birth_date: "2009-11-30", student_phone: "010-9002-3456", guardian_phone: "010-2000-3000", previous_school: "푸른중학교", admission_year: 2026, admission_grade: 1, admission_school: "미래고등학교", school_name: "미래고등학교", class_name: "1반", student_number: "2", address: "서울시 동작구 상도로 10", privacy_consent: true, delivery: true, grade: 1, checked_in_at: "2026-01-21T10:00:00Z", government_purchase: false, is_eligible_for_public_purchase: false, created_at: "2026-01-21T10:00:00Z", updated_at: "2026-01-21T10:30:00Z" },
    // 미래고 2학년 재학 - 남
    { id: 11, name: "임재원", gender: "M", birth_date: "2008-05-20", student_phone: "010-9003-4567", guardian_phone: "010-3000-4000", previous_school: "", admission_year: 2025, admission_grade: 2, admission_school: "미래고등학교", school_name: "미래고등학교", class_name: "2반", student_number: "1", address: "서울시 구로구 구로대로 11", privacy_consent: true, delivery: false, grade: 2, checked_in_at: "2026-01-22T09:30:00Z", government_purchase: false, is_eligible_for_public_purchase: false, created_at: "2026-01-22T09:30:00Z", updated_at: "2026-01-22T10:00:00Z" },
    // 하늘고 1학년 신입 - 여, 주관구매O
    { id: 12, name: "조유나", gender: "F", birth_date: "2009-08-07", student_phone: "010-9004-5678", guardian_phone: "010-4000-5000", previous_school: "세종중학교", admission_year: 2026, admission_grade: 1, admission_school: "하늘고등학교", school_name: "하늘고등학교", class_name: "1반", student_number: "1", address: "경기도 수원시 팔달구 인계로 12", privacy_consent: true, delivery: true, grade: 1, checked_in_at: "2026-01-23T14:00:00Z", government_purchase: false, is_eligible_for_public_purchase: true, created_at: "2026-01-23T14:00:00Z", updated_at: "2026-01-23T14:30:00Z" },
  ],
  meta: { page: 1, limit: 10, total: 12, total_pages: 2 },
};

// ============================================================================
// 대기 학생 (staff 측정 대기열)
// 케이스: 신입/재학, 남/여, 다른 학교
// ============================================================================

export const MOCK_PENDING_STUDENTS: RegisterStudentsResponse = {
  success: true,
  data: {
    students: [
      // 신입, 남
      { id: 101, name: "강태양", gender: "M", birth_date: "2012-05-10", student_phone: "010-1111-2222", guardian_phone: "010-3333-4444", previous_school: "햇살초등학교", admission_year: 2026, admission_grade: 1, admission_school: "세종중학교", school_name: "세종중학교", class_name: "", student_number: "", address: "서울시 노원구 공릉로 10", privacy_consent: true, delivery: false, student_type: "new", checked_in_at: "2026-02-03T08:30:00Z", created_at: "2026-02-03T08:30:00Z", updated_at: "2026-02-03T08:30:00Z" },
      // 신입, 여, 배송
      { id: 102, name: "신유빈", gender: "F", birth_date: "2012-12-03", student_phone: "010-2222-3333", guardian_phone: "010-4444-5555", previous_school: "은하초등학교", admission_year: 2026, admission_grade: 1, admission_school: "세종중학교", school_name: "세종중학교", class_name: "", student_number: "", address: "서울시 도봉구 창동로 20", privacy_consent: true, delivery: true, student_type: "new", checked_in_at: "2026-02-03T08:45:00Z", created_at: "2026-02-03T08:45:00Z", updated_at: "2026-02-03T08:45:00Z" },
      // 신입, 남, 고등학교
      { id: 103, name: "임도현", gender: "M", birth_date: "2009-02-28", student_phone: "010-3333-4444", guardian_phone: "010-5555-6666", previous_school: "솔빛중학교", admission_year: 2026, admission_grade: 1, admission_school: "미래고등학교", school_name: "미래고등학교", class_name: "", student_number: "", address: "서울시 강북구 수유로 30", privacy_consent: true, delivery: false, student_type: "new", checked_in_at: "2026-02-03T09:00:00Z", created_at: "2026-02-03T09:00:00Z", updated_at: "2026-02-03T09:00:00Z" },
      // 재학, 여, 초등학교
      { id: 104, name: "박하은", gender: "F", birth_date: "2018-07-19", student_phone: "", guardian_phone: "010-6666-7777", previous_school: "", admission_year: 2025, admission_grade: 2, admission_school: "한빛초등학교", school_name: "한빛초등학교", class_name: "2반", student_number: "5", address: "경기도 부천시 원미구 중동로 40", privacy_consent: true, delivery: false, student_type: "existing", checked_in_at: "2026-02-03T09:15:00Z", created_at: "2025-01-10T09:15:00Z", updated_at: "2026-02-03T09:15:00Z" },
      // 재학, 남, 중학교
      { id: 105, name: "유재석", gender: "M", birth_date: "2011-03-14", student_phone: "010-7777-8888", guardian_phone: "010-8888-9999", previous_school: "", admission_year: 2025, admission_grade: 2, admission_school: "세종중학교", school_name: "세종중학교", class_name: "1반", student_number: "8", address: "서울시 은평구 불광로 50", privacy_consent: true, delivery: true, student_type: "existing", checked_in_at: "2026-02-03T09:30:00Z", created_at: "2025-01-13T09:30:00Z", updated_at: "2026-02-03T09:30:00Z" },
    ],
    total: 5,
  },
  meta: { page: 1, limit: 10, total: 5, total_pages: 1 },
};

// ============================================================================
// 학생 주문 상세 (StudentOrdersData)
// 케이스: 동복+하복 주문, 여러 orderItem, 이력 있음
// ============================================================================

export const MOCK_STUDENT_ORDERS: StudentOrdersData = {
  id: 1,
  name: "김민준",
  birth_date: "2012-04-15",
  gender: "M",
  student_phone: "010-1234-5678",
  guardian_phone: "010-9876-5432",
  address: "서울시 강남구 테헤란로 1",
  delivery: false,
  privacy_consent: true,
  previous_school: "행복초등학교",
  admission_year: 2026,
  admission_grade: 1,
  school_name: "세종중학교",
  class_name: "1반",
  student_number: "1",
  student_type: "new",
  is_eligible_for_public_purchase: false,
  has_order: true,
  recommended_uniforms: {
    winter: [
      { product: "남자 동복 상의", recommended_size: "170", quantity: 1, price: 85000, supported_quantity: 1, available_sizes: [{ size: "160", in_stock: true, stock_count: 5 }, { size: "165", in_stock: true, stock_count: 3 }, { size: "170", in_stock: true, stock_count: 2 }], gender: "M" },
      { product: "남자 동복 바지", recommended_size: "80", quantity: 1, price: 65000, supported_quantity: 1, available_sizes: [{ size: "75", in_stock: true, stock_count: 4 }, { size: "80", in_stock: true, stock_count: 6 }, { size: "85", in_stock: false, stock_count: 0 }], gender: "M" },
    ],
    summer: [
      { product: "남자 하복 상의", recommended_size: "170", quantity: 1, price: 45000, supported_quantity: 1, available_sizes: [{ size: "165", in_stock: true, stock_count: 7 }, { size: "170", in_stock: true, stock_count: 2 }], gender: "M" },
      { product: "남자 하복 바지", recommended_size: "80", quantity: 1, price: 40000, supported_quantity: 1, available_sizes: [{ size: "75", in_stock: true, stock_count: 3 }, { size: "80", in_stock: true, stock_count: 5 }], gender: "M" },
    ],
  },
  orders: [
    {
      // 2026년 — 동복+하복 풀셋, 추가수량 없음
      id: 501,
      orderNumber: "ORD-2026-0001",
      studentId: 1,
      totalAmount: 235000,
      status: "confirmed",
      orderType: "measurement",
      orderDate: "2026-01-10",
      notes: "수선 요청 없음",
      signature: "",
      createdAt: "2026-01-10T09:30:00Z",
      updatedAt: "2026-01-10T09:30:00Z",
      orderItems: [
        { id: 1, orderId: 501, productId: 1, size: "170", quantity: 1, supportedQuantity: 1, unitPrice: 85000, subtotal: 85000, customization: "", deliveryStatus: "delivered", receivedAt: "2026-02-10T00:00:00Z", product: { id: 1, name: "남자 동복 상의", season: "W", price: 85000 } },
        { id: 2, orderId: 501, productId: 2, size: "80", quantity: 1, supportedQuantity: 1, unitPrice: 65000, subtotal: 65000, customization: "", deliveryStatus: "receipt", receivedAt: "2026-02-05T00:00:00Z", product: { id: 2, name: "남자 동복 바지", season: "W", price: 65000 } },
        { id: 3, orderId: 501, productId: 5, size: "170", quantity: 1, supportedQuantity: 1, unitPrice: 45000, subtotal: 45000, customization: "", deliveryStatus: "pending", receivedAt: null, product: { id: 5, name: "남자 하복 상의", season: "S", price: 45000 } },
        { id: 4, orderId: 501, productId: 6, size: "80", quantity: 1, supportedQuantity: 1, unitPrice: 40000, subtotal: 40000, customization: "", deliveryStatus: "pending", receivedAt: null, product: { id: 6, name: "남자 하복 바지", season: "S", price: 40000 } },
      ],
    },
    {
      // 2025년 — 동복만, 동복 상의 추가 1벌
      id: 401,
      orderNumber: "ORD-2025-0001",
      studentId: 1,
      totalAmount: 235000,
      status: "confirmed",
      orderType: "measurement",
      orderDate: "2025-01-15",
      notes: "",
      signature: "",
      createdAt: "2025-01-15T10:00:00Z",
      updatedAt: "2025-01-15T10:30:00Z",
      orderItems: [
        { id: 11, orderId: 401, productId: 1, size: "165", quantity: 2, supportedQuantity: 1, unitPrice: 82000, subtotal: 164000, customization: "소매 수선", deliveryStatus: "delivered", receivedAt: "2025-02-10T00:00:00Z", product: { id: 1, name: "남자 동복 상의", season: "W", price: 82000 } },
        { id: 12, orderId: 401, productId: 2, size: "75", quantity: 1, supportedQuantity: 1, unitPrice: 63000, subtotal: 63000, customization: "", deliveryStatus: "delivered", receivedAt: "2025-02-10T00:00:00Z", product: { id: 2, name: "남자 동복 바지", season: "W", price: 63000 } },
        { id: 13, orderId: 401, productId: 5, size: "165", quantity: 1, supportedQuantity: 1, unitPrice: 43000, subtotal: 43000, customization: "", deliveryStatus: "delivered", receivedAt: "2025-02-20T00:00:00Z", product: { id: 5, name: "남자 하복 상의", season: "S", price: 43000 } },
      ],
    },
  ],
  created_at: "2026-01-10T09:10:00Z",
  updated_at: "2026-01-10T09:30:00Z",
};

// ============================================================================
// 스태프 목록
// 케이스: 활성/비활성, 남/여, 다양한 역할, 최근/오래된 등록일
// ============================================================================

export const MOCK_STAFF_LIST: StaffListResponse = {
  data: [
    { id: 1, employee_id: "staff001", employee_name: "홍길동", gender: "M", phone: "010-0001-0001", role: "staff", is_active: true, created_at: "2024-01-15T00:00:00Z", updated_at: "2026-02-01T00:00:00Z" },
    { id: 2, employee_id: "staff002", employee_name: "김영희", gender: "F", phone: "010-0002-0002", role: "staff", is_active: true, created_at: "2024-01-20T00:00:00Z", updated_at: "2026-01-15T00:00:00Z" },
    { id: 3, employee_id: "staff003", employee_name: "이철수", gender: "M", phone: "010-0003-0003", role: "staff", is_active: true, created_at: "2024-02-01T00:00:00Z", updated_at: "2026-01-20T00:00:00Z" },
    { id: 4, employee_id: "staff004", employee_name: "박미나", gender: "F", phone: "010-0004-0004", role: "staff", is_active: false, created_at: "2024-02-10T00:00:00Z", updated_at: "2026-01-10T00:00:00Z" },
    { id: 5, employee_id: "staff005", employee_name: "최준혁", gender: "M", phone: "010-0005-0005", role: "staff", is_active: true, created_at: "2025-01-20T00:00:00Z", updated_at: "2026-02-05T00:00:00Z" },
    { id: 6, employee_id: "staff006", employee_name: "윤서아", gender: "F", phone: "010-0006-0006", role: "staff", is_active: false, created_at: "2025-02-05T00:00:00Z", updated_at: "2025-02-20T00:00:00Z" },
  ],
  meta: { page: 1, limit: 10, total: 6, total_pages: 1 },
};

export const MOCK_PENDING_STAFF_LIST: StaffListResponse = {
  data: [
    { id: 10, employee_id: "staff010", employee_name: "최신입", gender: "M", phone: "010-0010-0010", role: "staff", is_active: false, created_at: "2026-02-03T08:00:00Z", updated_at: "2026-02-03T08:00:00Z" },
    { id: 11, employee_id: "staff011", employee_name: "장지원", gender: "F", phone: "010-0011-0011", role: "staff", is_active: false, created_at: "2026-02-03T09:00:00Z", updated_at: "2026-02-03T09:00:00Z" },
    { id: 12, employee_id: "staff012", employee_name: "김대한", gender: "M", phone: "010-0012-0012", role: "staff", is_active: false, created_at: "2026-02-03T10:00:00Z", updated_at: "2026-02-03T10:00:00Z" },
  ],
  meta: { page: 1, limit: 10, total: 3, total_pages: 1 },
};

// ============================================================================
// 결제 대기 주문
// 케이스: 전액 미납, 일부 납부, 거의 완납, 다양한 학교/성별
// ============================================================================

export const MOCK_PAYMENT_PENDING: PaymentPendingListResponse = {
  orders: [
    // 전액 미납 — 동복 풀셋, 남, 세종중
    { order_id: 601, order_number: "ORD-2026-0021", student_id: 3, student_name: "박지호", gender: "M", school_name: "세종중학교", category_summary: "동복 상의, 동복 바지", measurement_end_time: "2026-02-10T10:20:00Z", total_amount: 150000, paid_amount: 0, remaining_amount: 150000 },
    // 일부 납부 — 동복+하복, 여, 세종중
    { order_id: 602, order_number: "ORD-2026-0022", student_id: 4, student_name: "최예은", gender: "F", school_name: "세종중학교", category_summary: "동복 상의, 동복 치마, 하복 상의", measurement_end_time: "2026-02-10T11:00:00Z", total_amount: 215000, paid_amount: 100000, remaining_amount: 115000 },
    // 전액 미납 — 하복만, 남, 미래고
    { order_id: 603, order_number: "ORD-2026-0023", student_id: 9, student_name: "강도윤", gender: "M", school_name: "미래고등학교", category_summary: "하복 상의, 하복 바지", measurement_end_time: "2026-02-09T15:30:00Z", total_amount: 85000, paid_amount: 0, remaining_amount: 85000 },
    // 소액 잔금 — 거의 완납, 여, 하늘고, 풀셋
    { order_id: 604, order_number: "ORD-2026-0024", student_id: 12, student_name: "조유나", gender: "F", school_name: "하늘고등학교", category_summary: "동복 상의, 동복 치마, 하복 상의, 하복 치마", measurement_end_time: "2026-02-08T14:00:00Z", total_amount: 275000, paid_amount: 250000, remaining_amount: 25000 },
    // 전액 미납 — 패딩 포함 고액, 남, 한빛초
    { order_id: 605, order_number: "ORD-2026-0025", student_id: 7, student_name: "오승준", gender: "M", school_name: "한빛초등학교", category_summary: "동복 상의, 동복 바지, 패딩", measurement_end_time: "2026-02-07T09:30:00Z", total_amount: 328000, paid_amount: 0, remaining_amount: 328000 },
    // 일부 납부 — 하복 여자, 세종중
    { order_id: 606, order_number: "ORD-2026-0026", student_id: 6, student_name: "한소희", gender: "F", school_name: "세종중학교", category_summary: "하복 상의, 하복 치마", measurement_end_time: "2026-02-07T10:00:00Z", total_amount: 85000, paid_amount: 45000, remaining_amount: 40000 },
    // 전액 미납 — 동복 풀셋, 여, 미래고, 수선 포함 고가
    { order_id: 607, order_number: "ORD-2026-0027", student_id: 10, student_name: "서지민", gender: "F", school_name: "미래고등학교", category_summary: "동복 상의(수선), 동복 치마", measurement_end_time: "2026-02-06T09:00:00Z", total_amount: 210000, paid_amount: 0, remaining_amount: 210000 },
    // 절반 납부 — 동복+하복 풀셋, 남, 세종중
    { order_id: 608, order_number: "ORD-2026-0028", student_id: 5, student_name: "정현우", gender: "M", school_name: "세종중학교", category_summary: "동복 상의, 동복 바지, 하복 상의, 하복 바지", measurement_end_time: "2026-02-06T10:30:00Z", total_amount: 235000, paid_amount: 120000, remaining_amount: 115000 },
    // 전액 미납 — 동복 단품(상의만), 여, 한빛초, 소액
    { order_id: 609, order_number: "ORD-2026-0029", student_id: 8, student_name: "윤지아", gender: "F", school_name: "한빛초등학교", category_summary: "동복 상의", measurement_end_time: "2026-02-05T11:00:00Z", total_amount: 78000, paid_amount: 0, remaining_amount: 78000 },
    // 전액 미납 — 동복+하복 풀셋+패딩, 남, 하늘고, 최고액
    { order_id: 610, order_number: "ORD-2026-0030", student_id: 11, student_name: "임재원", gender: "M", school_name: "하늘고등학교", category_summary: "동복 상의, 동복 바지, 하복 상의, 하복 바지, 패딩", measurement_end_time: "2026-02-05T14:00:00Z", total_amount: 490000, paid_amount: 0, remaining_amount: 490000 },
    // 일부 납부 — 하복 풀셋, 여, 푸른중
    { order_id: 611, order_number: "ORD-2026-0031", student_id: 2, student_name: "이서연", gender: "F", school_name: "푸른중학교", category_summary: "하복 상의, 하복 치마", measurement_end_time: "2026-02-04T09:30:00Z", total_amount: 90000, paid_amount: 50000, remaining_amount: 40000 },
    // 잔금 소액 — 동복 풀셋, 남, 청솔초
    { order_id: 612, order_number: "ORD-2026-0032", student_id: 1, student_name: "김민준", gender: "M", school_name: "청솔초등학교", category_summary: "동복 상의, 동복 바지", measurement_end_time: "2026-02-03T10:00:00Z", total_amount: 156000, paid_amount: 146000, remaining_amount: 10000 },
  ],
  meta: { page: 1, limit: 10, total: 12, total_pages: 2 },
};

// ============================================================================
// 상품 목록
// 케이스: 동복/하복, 남/여/공용, 수선가능/불가, 사이즈 다양, 여러 학교 품목
// ============================================================================

export const MOCK_PRODUCTS: ProductsData = {
  products: [
    // 세종중 동복
    { id: 1, name: "세종중 남자 동복 상의", category: "동복 상의", gender: "M", season: "W", price: 85000, is_repair: true, is_repair_required: false, sizes: [{ size: "155", size_type: "numeric" }, { size: "160", size_type: "numeric" }, { size: "165", size_type: "numeric" }, { size: "170", size_type: "numeric" }, { size: "175", size_type: "numeric" }, { size: "180", size_type: "numeric" }], created_at: "2025-01-10T00:00:00Z", updated_at: "2026-01-10T00:00:00Z" },
    { id: 2, name: "세종중 남자 동복 바지", category: "동복 하의", gender: "M", season: "W", price: 65000, is_repair: false, is_repair_required: false, sizes: [{ size: "70", size_type: "numeric" }, { size: "75", size_type: "numeric" }, { size: "80", size_type: "numeric" }, { size: "85", size_type: "numeric" }, { size: "90", size_type: "numeric" }], created_at: "2025-01-10T00:00:00Z", updated_at: "2026-01-10T00:00:00Z" },
    { id: 3, name: "세종중 여자 동복 상의", category: "동복 상의", gender: "F", season: "W", price: 85000, is_repair: true, is_repair_required: false, sizes: [{ size: "150", size_type: "numeric" }, { size: "155", size_type: "numeric" }, { size: "160", size_type: "numeric" }, { size: "165", size_type: "numeric" }], created_at: "2025-01-10T00:00:00Z", updated_at: "2026-01-10T00:00:00Z" },
    { id: 4, name: "세종중 여자 동복 치마", category: "동복 하의", gender: "F", season: "W", price: 65000, is_repair: false, is_repair_required: false, sizes: [{ size: "55", size_type: "numeric" }, { size: "58", size_type: "numeric" }, { size: "61", size_type: "numeric" }, { size: "64", size_type: "numeric" }], created_at: "2025-01-10T00:00:00Z", updated_at: "2026-01-10T00:00:00Z" },
    // 세종중 하복
    { id: 5, name: "세종중 남자 하복 상의", category: "하복 상의", gender: "M", season: "S", price: 45000, is_repair: false, is_repair_required: false, sizes: [{ size: "155", size_type: "numeric" }, { size: "160", size_type: "numeric" }, { size: "165", size_type: "numeric" }, { size: "170", size_type: "numeric" }, { size: "175", size_type: "numeric" }], created_at: "2025-01-10T00:00:00Z", updated_at: "2026-01-10T00:00:00Z" },
    { id: 6, name: "세종중 남자 하복 바지", category: "하복 하의", gender: "M", season: "S", price: 40000, is_repair: false, is_repair_required: false, sizes: [{ size: "70", size_type: "numeric" }, { size: "75", size_type: "numeric" }, { size: "80", size_type: "numeric" }, { size: "85", size_type: "numeric" }], created_at: "2025-01-10T00:00:00Z", updated_at: "2026-01-10T00:00:00Z" },
    { id: 7, name: "세종중 여자 하복 상의", category: "하복 상의", gender: "F", season: "S", price: 45000, is_repair: false, is_repair_required: false, sizes: [{ size: "150", size_type: "numeric" }, { size: "155", size_type: "numeric" }, { size: "160", size_type: "numeric" }, { size: "165", size_type: "numeric" }], created_at: "2025-01-10T00:00:00Z", updated_at: "2026-01-10T00:00:00Z" },
    { id: 8, name: "세종중 여자 하복 치마", category: "하복 하의", gender: "F", season: "S", price: 40000, is_repair: false, is_repair_required: false, sizes: [{ size: "55", size_type: "numeric" }, { size: "58", size_type: "numeric" }, { size: "61", size_type: "numeric" }], created_at: "2025-01-10T00:00:00Z", updated_at: "2026-01-10T00:00:00Z" },
    // 공용 외투
    { id: 11, name: "세종중 공용 패딩", category: "외투", gender: "U", season: "W", price: 120000, is_repair: false, is_repair_required: false, sizes: [{ size: "S", size_type: "alpha" }, { size: "M", size_type: "alpha" }, { size: "L", size_type: "alpha" }, { size: "XL", size_type: "alpha" }], created_at: "2025-01-10T00:00:00Z", updated_at: "2026-01-10T00:00:00Z" },
    // 한빛초 품목
    { id: 9, name: "한빛초 남자 동복 상의", category: "동복 상의", gender: "M", season: "W", price: 78000, is_repair: true, is_repair_required: false, sizes: [{ size: "120", size_type: "numeric" }, { size: "125", size_type: "numeric" }, { size: "130", size_type: "numeric" }, { size: "135", size_type: "numeric" }, { size: "140", size_type: "numeric" }, { size: "145", size_type: "numeric" }], created_at: "2025-01-20T00:00:00Z", updated_at: "2026-01-10T00:00:00Z" },
    { id: 10, name: "한빛초 여자 동복 상의", category: "동복 상의", gender: "F", season: "W", price: 78000, is_repair: true, is_repair_required: false, sizes: [{ size: "120", size_type: "numeric" }, { size: "125", size_type: "numeric" }, { size: "130", size_type: "numeric" }, { size: "135", size_type: "numeric" }, { size: "140", size_type: "numeric" }], created_at: "2025-01-20T00:00:00Z", updated_at: "2026-01-10T00:00:00Z" },
    // 미래고 품목 (수선 필수)
    { id: 12, name: "미래고 남자 동복 상의", category: "동복 상의", gender: "M", season: "W", price: 95000, is_repair: true, is_repair_required: true, sizes: [{ size: "160", size_type: "numeric" }, { size: "165", size_type: "numeric" }, { size: "170", size_type: "numeric" }, { size: "175", size_type: "numeric" }, { size: "180", size_type: "numeric" }, { size: "185", size_type: "numeric" }], created_at: "2025-02-01T00:00:00Z", updated_at: "2026-02-01T00:00:00Z" },
    { id: 13, name: "미래고 여자 동복 상의", category: "동복 상의", gender: "F", season: "W", price: 95000, is_repair: true, is_repair_required: true, sizes: [{ size: "155", size_type: "numeric" }, { size: "160", size_type: "numeric" }, { size: "165", size_type: "numeric" }, { size: "170", size_type: "numeric" }], created_at: "2025-02-01T00:00:00Z", updated_at: "2026-02-01T00:00:00Z" },
    { id: 14, name: "미래고 남자 하복 상의", category: "하복 상의", gender: "M", season: "S", price: 52000, is_repair: false, is_repair_required: false, sizes: [{ size: "160", size_type: "numeric" }, { size: "165", size_type: "numeric" }, { size: "170", size_type: "numeric" }, { size: "175", size_type: "numeric" }, { size: "180", size_type: "numeric" }], created_at: "2025-02-01T00:00:00Z", updated_at: "2026-02-01T00:00:00Z" },
  ],
  total: 14,
};
