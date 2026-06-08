import type { InternalAxiosRequestConfig, AxiosResponse } from "axios";
import {
  DEMO_STAFF,
  MOCK_SCHOOL_LIST,
  MOCK_SCHOOL_DETAIL,
  MOCK_STUDENTS,
  MOCK_PENDING_STUDENTS,
  MOCK_STUDENT_ORDERS,
  MOCK_STAFF_LIST,
  MOCK_PENDING_STAFF_LIST,
  MOCK_PAYMENT_PENDING,
  MOCK_PRODUCTS,
} from "./mockData";

function makeResponse<T>(data: T, config: InternalAxiosRequestConfig): AxiosResponse<{ success: boolean; data: T }> {
  return {
    data: { success: true, data },
    status: 200,
    statusText: "OK",
    headers: {},
    config,
  };
}

// URL 패턴 매칭 헬퍼
function match(url: string, pattern: RegExp): RegExpMatchArray | null {
  return url.match(pattern);
}

export function handleMockRequest(config: InternalAxiosRequestConfig): AxiosResponse | null {
  const url = config.url ?? "";
  const method = (config.method ?? "get").toLowerCase();

  // ============================================================================
  // Auth
  // ============================================================================

  // 로그아웃 (no-op)
  if (url.includes("/auth/logout")) {
    return makeResponse(null, config);
  }

  // 프로필 조회
  if (url.includes("/auth/profile")) {
    return makeResponse(DEMO_STAFF, config);
  }

  // ============================================================================
  // Schools
  // ============================================================================

  // 학교 목록
  if (url.includes("/schools/list")) {
    return makeResponse(MOCK_SCHOOL_LIST, config);
  }

  // 지원 학교 목록
  if (url.includes("/schools/supported/detail")) {
    return makeResponse(MOCK_SCHOOL_DETAIL, config);
  }

  if (url.includes("/schools/supported/by-year")) {
    return makeResponse({ schools: [] }, config);
  }

  if (url.includes("/schools/supported") && method === "get") {
    return makeResponse({ schools: MOCK_SCHOOL_LIST.schools.map((s, i) => ({ id: i + 1, name: s.school_name, year: 2026, created_at: s.created_at, updated_at: s.updated_at })) }, config);
  }

  // 학교별 주문/재고 현황 — 품절/예약/수령 등 다양한 상태 포함
  if (match(url, /\/schools\/(.+)\/order-inventory/)) {
    return makeResponse({
      school_name: "세종중학교",
      products: [
        {
          product_id: 1,
          display_name: "남자 동복 상의",
          category: "동복 상의",
          season: "W",
          size_stats: [
            { size: "155", stock: 6, ordered: 2, remaining: 4, orders: [{ name: "강도윤", status: "pending" }, { name: "임재원", status: "reserved" }] },
            { size: "160", stock: 10, ordered: 5, remaining: 5, orders: [{ name: "박지호", status: "pending" }, { name: "정현우", status: "receipt" }, { name: "유재석", status: "delivered" }] },
            { size: "165", stock: 8, ordered: 8, remaining: 0, orders: [{ name: "김민준", status: "shipped" }, { name: "오승준", status: "receipt" }] },
            { size: "170", stock: 4, ordered: 2, remaining: 2, orders: [{ name: "임도현", status: "pending" }] },
            { size: "175", stock: 3, ordered: 0, remaining: 3, orders: [] },
          ],
        },
        {
          product_id: 2,
          display_name: "남자 동복 바지",
          category: "동복 하의",
          season: "W",
          size_stats: [
            { size: "70", stock: 8, ordered: 3, remaining: 5, orders: [{ name: "강도윤", status: "pending" }] },
            { size: "75", stock: 12, ordered: 7, remaining: 5, orders: [{ name: "김민준", status: "delivered" }, { name: "박지호", status: "receipt" }] },
            { size: "80", stock: 9, ordered: 9, remaining: 0, orders: [{ name: "정현우", status: "shipped" }, { name: "임재원", status: "shipped" }] },
            { size: "85", stock: 4, ordered: 1, remaining: 3, orders: [{ name: "유재석", status: "reserved" }] },
          ],
        },
        {
          product_id: 3,
          display_name: "여자 동복 상의",
          category: "동복 상의",
          season: "W",
          size_stats: [
            { size: "150", stock: 5, ordered: 2, remaining: 3, orders: [{ name: "이서연", status: "pending" }] },
            { size: "155", stock: 7, ordered: 4, remaining: 3, orders: [{ name: "최예은", status: "receipt" }, { name: "한소희", status: "delivered" }] },
            { size: "160", stock: 6, ordered: 6, remaining: 0, orders: [{ name: "조유나", status: "shipped" }, { name: "서지민", status: "shipped" }] },
            { size: "165", stock: 3, ordered: 1, remaining: 2, orders: [{ name: "신유빈", status: "pending" }] },
          ],
        },
        {
          product_id: 4,
          display_name: "여자 동복 치마",
          category: "동복 하의",
          season: "W",
          size_stats: [
            { size: "55", stock: 8, ordered: 3, remaining: 5, orders: [{ name: "이서연", status: "pending" }] },
            { size: "58", stock: 10, ordered: 6, remaining: 4, orders: [{ name: "최예은", status: "delivered" }, { name: "한소희", status: "receipt" }] },
            { size: "61", stock: 5, ordered: 5, remaining: 0, orders: [{ name: "조유나", status: "shipped" }] },
            { size: "64", stock: 3, ordered: 0, remaining: 3, orders: [] },
          ],
        },
        {
          product_id: 5,
          display_name: "남자 하복 상의",
          category: "하복 상의",
          season: "S",
          size_stats: [
            { size: "155", stock: 7, ordered: 2, remaining: 5, orders: [{ name: "강태양", status: "pending" }] },
            { size: "160", stock: 9, ordered: 4, remaining: 5, orders: [{ name: "박지호", status: "reserved" }, { name: "임도현", status: "pending" }] },
            { size: "165", stock: 6, ordered: 6, remaining: 0, orders: [{ name: "김민준", status: "delivered" }, { name: "오승준", status: "receipt" }] },
            { size: "170", stock: 4, ordered: 1, remaining: 3, orders: [] },
          ],
        },
      ],
    }, config);
  }

  // 학교 CUD (no-op)
  if (url.includes("/schools/") && (method === "post" || method === "put" || method === "delete")) {
    return makeResponse(null, config);
  }

  // ============================================================================
  // Students
  // ============================================================================

  // 대기 학생 목록
  if (url.includes("/students/pending-measurements")) {
    return {
      data: MOCK_PENDING_STUDENTS,
      status: 200,
      statusText: "OK",
      headers: {},
      config,
    };
  }

  // 학생 등록 (no-op)
  if (url.includes("/students/register")) {
    return makeResponse({
      id: 999,
      name: "테스트 학생",
      birth_date: "2012-01-01",
      gender: "M",
      student_phone: "010-0000-0000",
      guardian_phone: "010-0000-0001",
      address: "서울시 중구 테스트로 1",
      delivery: false,
      privacy_consent: true,
      previous_school: "테스트초",
      admission_year: 2026,
      admission_grade: 1,
      school_name: "세종중학교",
      grade: 1,
      checked_in_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, config);
  }

  // 전화 주문 (no-op)
  if (url.includes("/students/phone-order")) {
    return makeResponse({
      student: { id: 998, name: "전화주문 테스트", gender: "M", school_name: "세종중학교", student_type: "phone", is_eligible_for_public_purchase: false, has_order: true, orders: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      order: { id: 701, order_number: "ORD-2026-DEMO", total_amount: 150000, status: "confirmed", item_count: 2 },
    }, config);
  }

  // 측정 시작 — studentId로 남/여 케이스 분기
  if (match(url, /\/students\/(\d+)\/start-measurement/)) {
    const sid = parseInt(match(url, /\/students\/(\d+)\/start-measurement/)![1]);
    const student = MOCK_PENDING_STUDENTS.data.students.find((s) => s.id === sid) ?? MOCK_PENDING_STUDENTS.data.students[0];
    const isMale = student.gender === "M";
    return makeResponse({
      student_id: student.id,
      student_name: student.name,
      from_school: student.previous_school || "이전학교없음",
      to_school: student.school_name,
      parent_phone: student.guardian_phone,
      school_deadline: "2026-05-15",
      body_measurements: isMale
        ? { height: 162, weight: 52, shoulder: 38, waist: 72 }
        : { height: 158, weight: 46, shoulder: 35, waist: 65 },
      uniform_products: isMale
        ? [
            { product_id: 1, product_name: "남자 동복 상의", category: "동복 상의", gender: "M", price: 85000, recommended_size: "165", available_sizes: ["155", "160", "165", "170", "175"], alternative_product_names: [], is_custom_detail_required: false, free_quantity: 1 },
            { product_id: 2, product_name: "남자 동복 바지", category: "동복 하의", gender: "M", price: 65000, recommended_size: "75", available_sizes: ["70", "75", "80", "85"], alternative_product_names: [], is_custom_detail_required: false, free_quantity: 1 },
            { product_id: 5, product_name: "남자 하복 상의", category: "하복 상의", gender: "M", price: 45000, recommended_size: "165", available_sizes: ["155", "160", "165", "170"], alternative_product_names: [], is_custom_detail_required: false, free_quantity: 1 },
            { product_id: 6, product_name: "남자 하복 바지", category: "하복 하의", gender: "M", price: 40000, recommended_size: "75", available_sizes: ["70", "75", "80"], alternative_product_names: [], is_custom_detail_required: false, free_quantity: 1 },
          ]
        : [
            { product_id: 3, product_name: "여자 동복 상의", category: "동복 상의", gender: "F", price: 85000, recommended_size: "160", available_sizes: ["150", "155", "160", "165"], alternative_product_names: [], is_custom_detail_required: false, free_quantity: 1 },
            { product_id: 4, product_name: "여자 동복 치마", category: "동복 하의", gender: "F", price: 65000, recommended_size: "58", available_sizes: ["55", "58", "61", "64"], alternative_product_names: [], is_custom_detail_required: false, free_quantity: 1 },
            { product_id: 7, product_name: "여자 하복 상의", category: "하복 상의", gender: "F", price: 45000, recommended_size: "160", available_sizes: ["150", "155", "160", "165"], alternative_product_names: [], is_custom_detail_required: false, free_quantity: 1 },
            { product_id: 8, product_name: "여자 하복 치마", category: "하복 하의", gender: "F", price: 40000, recommended_size: "58", available_sizes: ["55", "58", "61"], alternative_product_names: [], is_custom_detail_required: false, free_quantity: 1 },
          ],
      accessory_products: null,
      recommended_uniforms: {
        winter: isMale
          ? [
              { product: "남자 동복 상의", recommended_size: "165", quantity: 1, price: 85000, supported_quantity: 1, available_sizes: [{ size: "160", in_stock: true, stock_count: 5 }, { size: "165", in_stock: true, stock_count: 3 }, { size: "170", in_stock: true, stock_count: 2 }], gender: "M" },
              { product: "남자 동복 바지", recommended_size: "75", quantity: 1, price: 65000, supported_quantity: 1, available_sizes: [{ size: "70", in_stock: true, stock_count: 4 }, { size: "75", in_stock: true, stock_count: 6 }, { size: "80", in_stock: false, stock_count: 0 }], gender: "M" },
            ]
          : [
              { product: "여자 동복 상의", recommended_size: "160", quantity: 1, price: 85000, supported_quantity: 1, available_sizes: [{ size: "155", in_stock: true, stock_count: 3 }, { size: "160", in_stock: true, stock_count: 5 }, { size: "165", in_stock: true, stock_count: 1 }], gender: "F" },
              { product: "여자 동복 치마", recommended_size: "58", quantity: 1, price: 65000, supported_quantity: 1, available_sizes: [{ size: "55", in_stock: true, stock_count: 4 }, { size: "58", in_stock: true, stock_count: 3 }, { size: "61", in_stock: false, stock_count: 0 }], gender: "F" },
            ],
        summer: isMale
          ? [
              { product: "남자 하복 상의", recommended_size: "165", quantity: 1, price: 45000, supported_quantity: 1, available_sizes: [{ size: "160", in_stock: true, stock_count: 7 }, { size: "165", in_stock: true, stock_count: 2 }, { size: "170", in_stock: true, stock_count: 4 }], gender: "M" },
              { product: "남자 하복 바지", recommended_size: "75", quantity: 1, price: 40000, supported_quantity: 1, available_sizes: [{ size: "70", in_stock: true, stock_count: 5 }, { size: "75", in_stock: true, stock_count: 3 }], gender: "M" },
            ]
          : [
              { product: "여자 하복 상의", recommended_size: "160", quantity: 1, price: 45000, supported_quantity: 1, available_sizes: [{ size: "155", in_stock: true, stock_count: 6 }, { size: "160", in_stock: true, stock_count: 4 }], gender: "F" },
              { product: "여자 하복 치마", recommended_size: "58", quantity: 1, price: 40000, supported_quantity: 1, available_sizes: [{ size: "55", in_stock: true, stock_count: 5 }, { size: "58", in_stock: true, stock_count: 2 }, { size: "61", in_stock: true, stock_count: 3 }], gender: "F" },
            ],
      },
      supply_items: [],
      registered_at: null,
      measurement_start_at: new Date().toISOString(),
      measurement_end_at: null,
    }, config);
  }

  // 측정 주문 저장 / 측정 완료 (no-op)
  if (match(url, /\/students\/(\d+)\/(measurement-order|complete-measurement)/)) {
    return makeResponse(null, config);
  }

  // 학생 주문 조회
  if (match(url, /\/students\/(\d+)\/orders/)) {
    return makeResponse(MOCK_STUDENT_ORDERS, config);
  }

  // 학생 단건 조회
  if (match(url, /\/students\/(\d+)$/) && method === "get") {
    const studentId = parseInt(match(url, /\/students\/(\d+)$/)![1]);
    const found = MOCK_STUDENTS.data.find((s) => s.id === studentId);
    return makeResponse(found ?? MOCK_STUDENTS.data[0], config);
  }

  // 학생 목록 조회
  if (url.includes("/students") && method === "get") {
    return makeResponse({ students: MOCK_STUDENTS.data, total: MOCK_STUDENTS.meta.total }, config);
  }

  // 학생 수정 / 삭제 (no-op)
  if (match(url, /\/students\/(\d+)/) && (method === "put" || method === "delete" || method === "patch")) {
    return makeResponse(null, config);
  }

  // ============================================================================
  // Orders
  // ============================================================================

  // 결제 대기 목록 (admin)
  if (url.includes("/admin/payment-pending")) {
    return makeResponse({ orders: MOCK_PAYMENT_PENDING.orders, total: MOCK_PAYMENT_PENDING.meta.total }, config);
  }

  // 결제 대기 목록 (staff)
  if (url.includes("/staff/my-payment-pending")) {
    return makeResponse({ orders: MOCK_PAYMENT_PENDING.orders.slice(0, 2), total: 2 }, config);
  }

  // 주문 히스토리
  if (match(url, /\/orders\/(\d+)\/history/)) {
    return makeResponse({
      histories: [
        { changed_at: "2026-03-05T09:30:00Z", description: "주문 생성" },
        { changed_at: "2026-03-05T10:00:00Z", description: "주문 확인" },
        { changed_at: "2026-03-12T14:20:00Z", description: "동복 상의 사이즈 165 → 170 변경 (고객 요청)" },
        { changed_at: "2026-04-01T09:00:00Z", description: "동복 입고 처리" },
        { changed_at: "2026-04-10T11:30:00Z", description: "동복 바지 수령 완료" },
      ],
    }, config);
  }

  // 주문 아이템 수령 처리 (no-op)
  if (match(url, /\/orders\/(\d+)\/items\/(\d+)\/receive/)) {
    return makeResponse(null, config);
  }

  // 주문 상세 조회
  if (match(url, /\/orders\/(\d+)$/) && method === "get") {
    const orderId = parseInt(match(url, /\/orders\/(\d+)$/)![1]);

    // 추가구매 없음 — 지원수량만 (601, 603, 609)
    const baseOrder = {
      order_id: orderId,
      created_at: "2026-02-10T09:10:00Z",
      registered_date: "2026-02-10",
      last_modified_date: "2026-02-10",
      measurement_dates: ["2026-02-10"],
      supplies: [],
      name_tag: { order_quantity: 0, attach_quantity: 0 },
      history: [{ date: "2026-02-10T09:00:00Z", content: "주문 생성" }],
    };

    // 케이스별 분기
    if (orderId === 602) {
      // 일부 추가구매 — 동복 상의 1벌 추가, 하복도 있음, 여, 세종중
      return makeResponse({ ...baseOrder,
        student_id: 4, student_name: "최예은", gender: "F", admission_school: "세종중학교", previous_school: "미래초등학교", class_name: "1반",
        student_phone: "010-4567-8901", guardian_phone: "010-6543-2109",
        winter_uniforms: [
          { item_id: "1", name: "여자 동복 상의", season: "winter", selected_size: "160", supported_quantity: 1, additional_quantity: 1, unit_price: 85000, customization: "", reservation: false, name_tag: null },
          { item_id: "2", name: "여자 동복 치마", season: "winter", selected_size: "58", supported_quantity: 1, additional_quantity: 0, unit_price: 65000, customization: "", reservation: false, name_tag: null },
        ],
        summer_uniforms: [
          { item_id: "3", name: "여자 하복 상의", season: "summer", selected_size: "160", supported_quantity: 1, additional_quantity: 0, unit_price: 45000, customization: "", reservation: false, name_tag: null },
        ],
      }, config);
    }

    if (orderId === 604) {
      // 전 품목 추가구매 — 동복+하복 각 1벌 추가, 여, 하늘고
      return makeResponse({ ...baseOrder,
        student_id: 12, student_name: "조유나", gender: "F", admission_school: "하늘고등학교", previous_school: "세종중학교", class_name: "1반",
        student_phone: "010-9004-5678", guardian_phone: "010-4000-5000",
        winter_uniforms: [
          { item_id: "1", name: "여자 동복 상의", season: "winter", selected_size: "160", supported_quantity: 1, additional_quantity: 1, unit_price: 95000, customization: "소매 수선", reservation: false, name_tag: null },
          { item_id: "2", name: "여자 동복 치마", season: "winter", selected_size: "58", supported_quantity: 1, additional_quantity: 1, unit_price: 75000, customization: "", reservation: false, name_tag: null },
        ],
        summer_uniforms: [
          { item_id: "3", name: "여자 하복 상의", season: "summer", selected_size: "160", supported_quantity: 1, additional_quantity: 1, unit_price: 52000, customization: "", reservation: false, name_tag: null },
          { item_id: "4", name: "여자 하복 치마", season: "summer", selected_size: "58", supported_quantity: 1, additional_quantity: 1, unit_price: 48000, customization: "", reservation: false, name_tag: null },
        ],
      }, config);
    }

    if (orderId === 605) {
      // 패딩 추가구매 — 동복 풀셋 지원 + 패딩 추가, 남, 한빛초
      return makeResponse({ ...baseOrder,
        student_id: 7, student_name: "오승준", gender: "M", admission_school: "한빛초등학교", previous_school: "광명유치원", class_name: "1반",
        student_phone: "", guardian_phone: "010-3210-9876",
        winter_uniforms: [
          { item_id: "1", name: "남자 동복 상의", season: "winter", selected_size: "130", supported_quantity: 1, additional_quantity: 0, unit_price: 78000, customization: "", reservation: false, name_tag: null },
          { item_id: "2", name: "남자 동복 바지", season: "winter", selected_size: "65", supported_quantity: 1, additional_quantity: 0, unit_price: 62000, customization: "", reservation: false, name_tag: null },
          { item_id: "3", name: "공용 패딩", season: "winter", selected_size: "M", supported_quantity: 0, additional_quantity: 1, unit_price: 188000, customization: "", reservation: false, name_tag: null },
        ],
        summer_uniforms: [],
      }, config);
    }

    if (orderId === 607) {
      // 수선 포함 + 동복 2벌 추가구매, 여, 미래고
      return makeResponse({ ...baseOrder,
        student_id: 10, student_name: "서지민", gender: "F", admission_school: "미래고등학교", previous_school: "푸른중학교", class_name: "1반",
        student_phone: "010-9002-3456", guardian_phone: "010-2000-3000",
        winter_uniforms: [
          { item_id: "1", name: "여자 동복 상의", season: "winter", selected_size: "165", supported_quantity: 1, additional_quantity: 2, unit_price: 95000, customization: "소매 수선", reservation: false, name_tag: null },
          { item_id: "2", name: "여자 동복 치마", season: "winter", selected_size: "61", supported_quantity: 1, additional_quantity: 0, unit_price: 75000, customization: "", reservation: false, name_tag: null },
        ],
        summer_uniforms: [],
      }, config);
    }

    if (orderId === 608) {
      // 풀셋 + 하복 바지 추가 1벌 + 용품(먼티, 스타킹), 남, 세종중
      return makeResponse({ ...baseOrder,
        student_id: 5, student_name: "정현우", gender: "M", admission_school: "세종중학교", previous_school: "", class_name: "3반",
        student_phone: "", guardian_phone: "010-5432-1098",
        winter_uniforms: [
          { item_id: "1", name: "남자 동복 상의", season: "winter", selected_size: "170", supported_quantity: 1, additional_quantity: 0, unit_price: 85000, customization: "", reservation: false, name_tag: null },
          { item_id: "2", name: "남자 동복 바지", season: "winter", selected_size: "80", supported_quantity: 1, additional_quantity: 0, unit_price: 65000, customization: "", reservation: false, name_tag: null },
        ],
        summer_uniforms: [
          { item_id: "3", name: "남자 하복 상의", season: "summer", selected_size: "170", supported_quantity: 1, additional_quantity: 0, unit_price: 45000, customization: "", reservation: false, name_tag: null },
          { item_id: "4", name: "남자 하복 바지", season: "summer", selected_size: "80", supported_quantity: 1, additional_quantity: 1, unit_price: 40000, customization: "", reservation: false, name_tag: null },
        ],
        supplies: [
          { item_id: "s1", category: "교복 먼티", name: "검정 교복 먼티", selected_size: "M", quantity: 2, unit_price: 8000 },
          { item_id: "s2", category: "교복 먼티", name: "흰색 교복 먼티", selected_size: "M", quantity: 1, unit_price: 8000 },
          { item_id: "s3", category: "스타킹", name: "살색", selected_size: "", quantity: 3, unit_price: 3000 },
          { item_id: "s4", category: "스타킹", name: "유발", selected_size: "", quantity: 0, unit_price: 3000 },
        ],
      }, config);
    }

    if (orderId === 610) {
      // 최고액 — 풀셋 + 패딩 + 동복 바지 2벌 추가, 남, 하늘고
      return makeResponse({ ...baseOrder,
        student_id: 11, student_name: "임재원", gender: "M", admission_school: "하늘고등학교", previous_school: "", class_name: "2반",
        student_phone: "010-9003-4567", guardian_phone: "010-3000-4000",
        winter_uniforms: [
          { item_id: "1", name: "남자 동복 상의", season: "winter", selected_size: "175", supported_quantity: 1, additional_quantity: 0, unit_price: 95000, customization: "", reservation: false, name_tag: null },
          { item_id: "2", name: "남자 동복 바지", season: "winter", selected_size: "85", supported_quantity: 1, additional_quantity: 2, unit_price: 75000, customization: "", reservation: false, name_tag: null },
          { item_id: "3", name: "공용 패딩", season: "winter", selected_size: "L", supported_quantity: 0, additional_quantity: 1, unit_price: 188000, customization: "", reservation: false, name_tag: null },
        ],
        summer_uniforms: [
          { item_id: "4", name: "남자 하복 상의", season: "summer", selected_size: "175", supported_quantity: 1, additional_quantity: 0, unit_price: 52000, customization: "", reservation: false, name_tag: null },
          { item_id: "5", name: "남자 하복 바지", season: "summer", selected_size: "85", supported_quantity: 1, additional_quantity: 0, unit_price: 47000, customization: "", reservation: false, name_tag: null },
        ],
      }, config);
    }

    // 기본 — 지원수량만, 추가구매 없음
    return makeResponse({ ...baseOrder,
      student_id: 3, student_name: "박지호", gender: "M", admission_school: "세종중학교", previous_school: "행복초등학교", class_name: "2반",
      student_phone: "010-3456-7890", guardian_phone: "010-7654-3210",
      winter_uniforms: [
        { item_id: "1", name: "남자 동복 상의", season: "winter", selected_size: "170", supported_quantity: 1, additional_quantity: 0, unit_price: 85000, customization: "", reservation: false, name_tag: null },
        { item_id: "2", name: "남자 동복 바지", season: "winter", selected_size: "80", supported_quantity: 1, additional_quantity: 0, unit_price: 65000, customization: "", reservation: false, name_tag: null },
      ],
      summer_uniforms: [],
    }, config);
  }

  // 주문 수정 / admin orders (no-op)
  if (url.includes("/admin/orders") || match(url, /\/orders\/(\d+)$/)) {
    return makeResponse(null, config);
  }

  // ============================================================================
  // Staff
  // ============================================================================

  // 스태프 목록
  if (url.includes("/admin/staff/pending")) {
    return makeResponse({ users: MOCK_PENDING_STAFF_LIST.data, total: MOCK_PENDING_STAFF_LIST.meta.total }, config);
  }

  if (url.includes("/admin/staff")) {
    if (method === "get") {
      return makeResponse({ users: MOCK_STAFF_LIST.data, total: MOCK_STAFF_LIST.meta.total }, config);
    }
    // 승인 / 비밀번호 초기화 (no-op)
    return makeResponse(null, config);
  }

  // ============================================================================
  // Products
  // ============================================================================

  if (url.includes("/products")) {
    if (method === "get") {
      return makeResponse(MOCK_PRODUCTS, config);
    }
    // 생성 / 수정 / 삭제 (no-op)
    return makeResponse(null, config);
  }

  return null;
}
