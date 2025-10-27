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

// 교복 아이템 타입
export type UniformItem = {
  id: string;
  name: string;
  price: number;
  size: number;
  customization: string;
  provided: number;
  availableSizes: number[]; // 선택 가능한 사이즈 옵션들
};

// 교복 아이템 더미 데이터
export const UNIFORM_ITEMS: {
  동복: UniformItem[];
  하복: UniformItem[];
} = {
  동복: [
    {
      id: "자켓",
      name: "자켓",
      price: 55000,
      size: 100,
      customization: "소매 : 2cm 줄임",
      provided: 1,
      availableSizes: [90, 95, 100, 105, 110],
    },
    {
      id: "니트조끼",
      name: "니트조끼",
      price: 55000,
      size: 100,
      customization: "",
      provided: 1,
      availableSizes: [90, 95, 100, 105, 110],
    },
    {
      id: "블라우스",
      name: "블라우스",
      price: 55000,
      size: 100,
      customization: "",
      provided: 1,
      availableSizes: [90, 95, 100, 105, 110],
    },
    {
      id: "치마",
      name: "치마",
      price: 55000,
      size: 74,
      customization: "",
      provided: 1,
      availableSizes: [66, 70, 74, 78, 82],
    },
    {
      id: "바지",
      name: "바지",
      price: 55000,
      size: 80,
      customization: "기장 : 34 3/4",
      provided: 0,
      availableSizes: [72, 76, 80, 84, 88],
    },
    {
      id: "체육복상의",
      name: "체육복 상의",
      price: 55000,
      size: 100,
      customization: "지원제외품목",
      provided: 0,
      availableSizes: [90, 95, 100, 105, 110],
    },
    {
      id: "체육복하의",
      name: "체육복 하의",
      price: 55000,
      size: 100,
      customization: "지원제외품목",
      provided: 0,
      availableSizes: [90, 95, 100, 105, 110],
    },
  ],
  하복: [
    {
      id: "하복셔츠",
      name: "하복 셔츠",
      price: 35000,
      size: 100,
      customization: "",
      provided: 2,
      availableSizes: [90, 95, 100, 105, 110],
    },
    {
      id: "하복블라우스",
      name: "하복 블라우스",
      price: 35000,
      size: 100,
      customization: "",
      provided: 2,
      availableSizes: [90, 95, 100, 105, 110],
    },
    {
      id: "하복치마",
      name: "하복 치마",
      price: 45000,
      size: 74,
      customization: "",
      provided: 1,
      availableSizes: [66, 70, 74, 78, 82],
    },
    {
      id: "하복바지",
      name: "하복 바지",
      price: 45000,
      size: 80,
      customization: "기장 : 34 3/4",
      provided: 1,
      availableSizes: [72, 76, 80, 84, 88],
    },
    {
      id: "하복체육복상의",
      name: "하복 체육복 상의",
      price: 40000,
      size: 100,
      customization: "지원제외품목",
      provided: 0,
      availableSizes: [90, 95, 100, 105, 110],
    },
    {
      id: "하복체육복하의",
      name: "하복 체육복 하의",
      price: 40000,
      size: 100,
      customization: "지원제외품목",
      provided: 0,
      availableSizes: [90, 95, 100, 105, 110],
    },
  ],
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
