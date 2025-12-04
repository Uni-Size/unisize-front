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
