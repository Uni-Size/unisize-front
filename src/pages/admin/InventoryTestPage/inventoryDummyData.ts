import type { InventoryProduct, InventoryOrder, OrderInventoryStatus } from '@/api/order';

// ── 이름 생성용 풀 ─────────────────────────────────────────────

const LAST_NAMES = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임', '한', '오', '서', '신', '권', '황', '안', '송', '류', '전', '홍', '고', '문', '양', '손', '배', '백', '허', '유', '남', '심', '노', '하', '곽', '성', '차', '주', '우', '구', '민'];
const FIRST_NAMES = ['민준', '서연', '지훈', '수아', '우진', '하은', '도현', '소율', '기선', '준서', '태양', '예린', '현우', '채원', '민서', '하린', '나연', '성준', '유진', '도윤', '수민', '지원', '은서', '태민', '지아', '준혁', '유나', '민재', '서현', '지연', '건우', '다은', '재원', '수현', '예준', '지은', '성민', '아린', '현준', '채은', '태준', '소현', '민호', '지수', '준영', '혜원', '동현', '세은', '재민', '유진'];

function makeName(index: number): string {
  const last = LAST_NAMES[index % LAST_NAMES.length];
  const first = FIRST_NAMES[Math.floor(index / LAST_NAMES.length) % FIRST_NAMES.length];
  return `${last}${first}`;
}

// 300명 이름 목록
const STUDENTS = Array.from({ length: 300 }, (_, i) => makeName(i));

// ── 사이즈 분포 (정규분포 근사) ───────────────────────────────

type SizeDist = { size: string; ratio: number }[];

// 상의 사이즈 분포 (85~135, 단위 5cm)
const TOP_SIZES: SizeDist = [
  { size: '85',  ratio: 0.04 },
  { size: '90',  ratio: 0.08 },
  { size: '95',  ratio: 0.13 },
  { size: '100', ratio: 0.20 },
  { size: '105', ratio: 0.18 },
  { size: '110', ratio: 0.15 },
  { size: '115', ratio: 0.10 },
  { size: '120', ratio: 0.07 },
  { size: '125', ratio: 0.03 },
  { size: '130', ratio: 0.02 },
];

// 하의 사이즈 분포 (62~98, 단위 6~8cm)
const BOTTOM_SIZES: SizeDist = [
  { size: '62',  ratio: 0.03 },
  { size: '65',  ratio: 0.05 },
  { size: '68',  ratio: 0.09 },
  { size: '71',  ratio: 0.12 },
  { size: '74',  ratio: 0.16 },
  { size: '77',  ratio: 0.15 },
  { size: '80',  ratio: 0.13 },
  { size: '83',  ratio: 0.10 },
  { size: '86',  ratio: 0.08 },
  { size: '89',  ratio: 0.05 },
  { size: '92',  ratio: 0.03 },
  { size: '95',  ratio: 0.01 },
];

// ── 주문 분배 헬퍼 ─────────────────────────────────────────────

function distributeOrders(
  students: string[],
  sizes: SizeDist,
  statusWeights: { status: OrderInventoryStatus; weight: number }[]
): { size: string; stock: number; ordered: number; remaining: number; orders: InventoryOrder[] }[] {
  // 각 사이즈에 학생 배정
  const sizeOrders: Record<string, InventoryOrder[]> = {};
  sizes.forEach(({ size }) => { sizeOrders[size] = []; });

  let studentIdx = 0;
  sizes.forEach(({ size, ratio }) => {
    const count = Math.round(students.length * ratio);
    for (let i = 0; i < count && studentIdx < students.length; i++, studentIdx++) {
      // 상태 가중치 기반 랜덤
      const totalWeight = statusWeights.reduce((s, w) => s + w.weight, 0);
      let rand = (studentIdx * 7 + i * 13) % totalWeight; // 결정적 pseudo-random
      let status: OrderInventoryStatus = statusWeights[0].status;
      for (const sw of statusWeights) {
        if (rand < sw.weight) { status = sw.status; break; }
        rand -= sw.weight;
      }
      sizeOrders[size].push({ name: students[studentIdx], status });
    }
  });

  // 남은 학생 마지막 사이즈에 배정
  while (studentIdx < students.length) {
    const lastSize = sizes[sizes.length - 2].size;
    sizeOrders[lastSize].push({ name: students[studentIdx], status: 'pending' });
    studentIdx++;
  }

  return sizes.map(({ size }) => {
    const orders = sizeOrders[size];
    const ordered = orders.length;
    // 재고: 주문의 90% 수준 (일부 사이즈 부족 발생)
    const stockRatio = [0.85, 0.90, 0.95, 1.0, 1.05][Math.floor(sizes.indexOf(sizes.find(s => s.size === size)!) / 2) % 5];
    const stock = Math.max(0, Math.round(ordered * stockRatio));
    return { size, stock, ordered, remaining: stock - ordered, orders };
  });
}

// ── 상태 가중치 세트 ──────────────────────────────────────────

const NORMAL_WEIGHTS: { status: OrderInventoryStatus; weight: number }[] = [
  { status: 'pending',      weight: 70 },
  { status: 'reserved',     weight: 15 },
  { status: 'out_of_stock', weight: 10 },
  { status: 'receipt',      weight: 5  },
];

// ── 품목별 더미 생성 ──────────────────────────────────────────

// 상의 계열 (300명 전원)
const topStats = distributeOrders(STUDENTS, TOP_SIZES, NORMAL_WEIGHTS);

// 하의 계열 (300명 전원)
const bottomStats = distributeOrders(STUDENTS, BOTTOM_SIZES, NORMAL_WEIGHTS);

// 생활복 상의 (300명 전원)
const casualTopStats = distributeOrders(STUDENTS, TOP_SIZES, [
  { status: 'pending',      weight: 60 },
  { status: 'reserved',     weight: 20 },
  { status: 'out_of_stock', weight: 15 },
  { status: 'receipt',      weight: 5  },
]);

// 생활복 하의 (300명 전원)
const casualBottomStats = distributeOrders(STUDENTS, BOTTOM_SIZES, [
  { status: 'pending',      weight: 65 },
  { status: 'reserved',     weight: 20 },
  { status: 'out_of_stock', weight: 10 },
  { status: 'receipt',      weight: 5  },
]);

// 체육복 상의 (재고 0 상태 — noStock 시나리오 확인용)
const peTopStats = TOP_SIZES.map(({ size }) => ({
  size, stock: 0, ordered: 0, remaining: 0, orders: [] as InventoryOrder[],
}));

// 하복 상의
const summerTopStats = distributeOrders(STUDENTS, TOP_SIZES, [
  { status: 'pending',      weight: 65 },
  { status: 'reserved',     weight: 20 },
  { status: 'out_of_stock', weight: 10 },
  { status: 'receipt',      weight: 5  },
]);

// 하복 하의
const summerBottomStats = distributeOrders(STUDENTS, BOTTOM_SIZES, [
  { status: 'pending',      weight: 70 },
  { status: 'reserved',     weight: 15 },
  { status: 'out_of_stock', weight: 10 },
  { status: 'receipt',      weight: 5  },
]);

export const INITIAL_PRODUCTS: InventoryProduct[] = [
  { product_id: 1, display_name: '동복 상의 (후드)', category: 'uniform', season: 'W', size_stats: topStats },
  { product_id: 2, display_name: '동복 하의 (바지)', category: 'uniform', season: 'W', size_stats: bottomStats },
  { product_id: 3, display_name: '생활복 상의',      category: 'casual',  season: 'W', size_stats: casualTopStats },
  { product_id: 4, display_name: '생활복 하의',      category: 'casual',  season: 'W', size_stats: casualBottomStats },
  { product_id: 5, display_name: '체육복 상의',      category: 'pe',      season: 'W', size_stats: peTopStats },
  { product_id: 6, display_name: '하복 상의 (셔츠)', category: 'uniform', season: 'S', size_stats: summerTopStats },
  { product_id: 7, display_name: '하복 하의 (바지)', category: 'uniform', season: 'S', size_stats: summerBottomStats },
];
