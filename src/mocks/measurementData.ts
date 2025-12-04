// 학생 정보 더미 데이터
export const STUDENT_INFO = {
  school: {
    from: "솔밭중학교",
    to: "청주고등학교",
    year: "26년 신입",
  },
  student: {
    name: "김인철",
    gender: "남",
  },
  contact: ["010-5571-8239", "010-5571-8233"],
  deadline: "26/01/26",
  timestamps: {
    reservation: "25/01/12 15:00",
    reception: "25/01/12 15:00",
    measurementStart: "25/01/12 15:00",
    measurementComplete: null,
  },
};

// 채촌 정보 더미 데이터
export const MEASUREMENT_INFO = {
  height: "172cm",
  weight: "90kg",
  shoulder: "44cm",
  waist: "32inch",
};

// 용품 아이템 설정 타입
export type SupplyOption = {
  category: string;
  size: string;
};

export type SupplyItemConfig = {
  name: string;
  options: SupplyOption[];
};

// 용품 아이템 설정 더미 데이터
export const SUPPLY_ITEMS_CONFIG: Record<string, SupplyItemConfig> = {
  명찰: {
    name: "명찰",
    options: [{ category: "-", size: "-" }],
  },
  "교복 탄성 반팔": {
    name: "교복 탄성 반팔",
    options: [
      { category: "흰색", size: "100" },
      { category: "검정", size: "100" },
    ],
  },
  "교복 긴 반팔": {
    name: "교복 긴 반팔",
    options: [
      { category: "검정", size: "100" },
      { category: "흰색", size: "100" },
    ],
  },
  속바지: {
    name: "속바지",
    options: [
      { category: "-", size: "L" },
      { category: "-", size: "M" },
      { category: "-", size: "S" },
    ],
  },
  "검정 소취 스타킹": {
    name: "검정 소취 스타킹",
    options: [
      { category: "유발", size: "L" },
      { category: "유발", size: "M" },
    ],
  },
  "살색 소취 스타킹": {
    name: "살색 소취 스타킹",
    options: [{ category: "-", size: "one size" }],
  },
  "기본 소취 스타킹": {
    name: "기본 소취 스타킹",
    options: [
      { category: "-", size: "L" },
      { category: "-", size: "M" },
    ],
  },
};
