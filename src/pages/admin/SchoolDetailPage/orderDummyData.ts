export interface StockData {
  stock: number;
  ordered: number;
}

export interface StudentOrderRow {
  studentName: string;
  sizes: Record<string, { name: string; reserved: boolean }>;
}

export interface ProductSection {
  name: string;
  sizes?: string[];
  sizeStocks: Record<string, StockData>;
  rows: StudentOrderRow[];
}

// TODO: 실제 API 연동 시 이 더미 데이터를 교체
export const DUMMY_SECTIONS: ProductSection[] = [
  {
    name: "후드",
    sizeStocks: {
      "85": { stock: 5, ordered: 2 },
      "90": { stock: 4, ordered: 4 },
      "95": { stock: 4, ordered: 2 },
      "100": { stock: 4, ordered: 6 },
      "105": { stock: 4, ordered: 0 },
      "110": { stock: 4, ordered: 0 },
      "115": { stock: 4, ordered: 0 },
      "120": { stock: 4, ordered: 0 },
      "125": { stock: 2, ordered: 0 },
      "130": { stock: 4, ordered: 6 },
      "135": { stock: 1, ordered: 0 },
    },
    rows: [
      {
        studentName: "한기선",
        sizes: {
          "85": { name: "한기선", reserved: false },
          "90": { name: "가나다", reserved: false },
          "95": { name: "가나다", reserved: false },
          "100": { name: "가나다", reserved: false },
          "130": { name: "홍길동", reserved: false },
        },
      },
      {
        studentName: "한기선",
        sizes: {
          "85": { name: "한기선", reserved: false },
          "90": { name: "가나다", reserved: false },
          "95": { name: "가나다", reserved: false },
          "100": { name: "가나다", reserved: false },
          "130": { name: "홍길동", reserved: false },
        },
      },
      {
        studentName: "가나다",
        sizes: {
          "90": { name: "가나다", reserved: false },
          "100": { name: "가나다", reserved: false },
          "130": { name: "홍길동", reserved: false },
        },
      },
      {
        studentName: "가나다",
        sizes: {
          "90": { name: "가나다", reserved: false },
          "100": { name: "가나다", reserved: false },
          "130": { name: "홍길동", reserved: false },
        },
      },
      {
        studentName: "김인철",
        sizes: {
          "100": { name: "김인철", reserved: true },
          "130": { name: "홍길동", reserved: true },
        },
      },
      {
        studentName: "김인철",
        sizes: {
          "100": { name: "김인철", reserved: true },
          "130": { name: "홍길동", reserved: true },
        },
      },
    ],
  },
  {
    name: "셔츠",
    sizeStocks: {
      "85": { stock: 5, ordered: 2 },
      "90": { stock: 4, ordered: 3 },
      "95": { stock: 4, ordered: 2 },
      "100": { stock: 4, ordered: 4 },
      "105": { stock: 4, ordered: 0 },
      "110": { stock: 4, ordered: 0 },
      "115": { stock: 4, ordered: 0 },
      "120": { stock: 4, ordered: 1 },
      "125": { stock: 2, ordered: 0 },
      "130": { stock: 4, ordered: 3 },
      "135": { stock: 1, ordered: 0 },
    },
    rows: [
      {
        studentName: "한기선",
        sizes: {
          "85": { name: "한기선", reserved: false },
          "90": { name: "가나다", reserved: false },
          "95": { name: "가나다", reserved: false },
          "100": { name: "가나다", reserved: false },
          "130": { name: "홍길동", reserved: false },
        },
      },
      {
        studentName: "한기선",
        sizes: {
          "85": { name: "한기선", reserved: false },
          "90": { name: "가나다", reserved: false },
          "95": { name: "가나다", reserved: false },
          "100": { name: "가나다", reserved: false },
          "130": { name: "홍길동", reserved: false },
        },
      },
      {
        studentName: "가나다",
        sizes: {
          "90": { name: "가나다", reserved: false },
          "100": { name: "가나다", reserved: false },
          "130": { name: "홍길동", reserved: false },
        },
      },
      {
        studentName: "이순신",
        sizes: {
          "100": { name: "이순신", reserved: false },
          "120": { name: "이순신", reserved: false },
        },
      },
    ],
  },
  {
    name: "바지",
    sizes: ["62", "65", "68", "71", "74", "77", "80", "83", "86", "89", "92", "95", "98", "101", "104", "107", "110"],
    sizeStocks: {
      "62": { stock: 2, ordered: 1 },
      "65": { stock: 3, ordered: 1 },
      "68": { stock: 4, ordered: 2 },
      "71": { stock: 4, ordered: 1 },
      "74": { stock: 5, ordered: 3 },
      "77": { stock: 4, ordered: 2 },
      "80": { stock: 4, ordered: 1 },
      "83": { stock: 3, ordered: 1 },
      "86": { stock: 4, ordered: 2 },
      "89": { stock: 3, ordered: 0 },
      "92": { stock: 4, ordered: 1 },
      "95": { stock: 3, ordered: 4 },
      "98": { stock: 2, ordered: 0 },
      "101": { stock: 3, ordered: 1 },
      "104": { stock: 2, ordered: 0 },
      "107": { stock: 3, ordered: 1 },
      "110": { stock: 2, ordered: 0 },
    },
    rows: [
      {
        studentName: "한기선",
        sizes: {
          "62": { name: "한기선", reserved: false },
          "68": { name: "한기선", reserved: false },
          "74": { name: "한기선", reserved: false },
          "77": { name: "한기선", reserved: false },
          "86": { name: "한기선", reserved: false },
        },
      },
      {
        studentName: "가나다",
        sizes: {
          "65": { name: "가나다", reserved: false },
          "71": { name: "가나다", reserved: false },
          "74": { name: "가나다", reserved: false },
          "77": { name: "가나다", reserved: false },
          "83": { name: "가나다", reserved: false },
          "86": { name: "가나다", reserved: false },
          "92": { name: "가나다", reserved: false },
          "107": { name: "가나다", reserved: false },
        },
      },
      {
        studentName: "박철수",
        sizes: {
          "68": { name: "박철수", reserved: false },
          "74": { name: "박철수", reserved: false },
          "80": { name: "박철수", reserved: false },
          "95": { name: "박철수", reserved: false },
          "101": { name: "박철수", reserved: false },
        },
      },
      {
        studentName: "홍길동",
        sizes: {
          "95": { name: "홍길동", reserved: false },
        },
      },
      {
        studentName: "김인철",
        sizes: {
          "95": { name: "김인철", reserved: false },
        },
      },
      {
        studentName: "이순신",
        sizes: {
          "95": { name: "이순신", reserved: false },
        },
      },
    ],
  },
  {
    name: "생활복 상의",
    sizeStocks: {
      "85": { stock: 4, ordered: 1 },
      "90": { stock: 5, ordered: 2 },
      "95": { stock: 3, ordered: 1 },
      "100": { stock: 4, ordered: 1 },
      "105": { stock: 4, ordered: 0 },
      "110": { stock: 3, ordered: 1 },
      "115": { stock: 4, ordered: 1 },
      "120": { stock: 3, ordered: 0 },
      "125": { stock: 2, ordered: 1 },
      "130": { stock: 4, ordered: 1 },
      "135": { stock: 2, ordered: 0 },
    },
    rows: [
      {
        studentName: "최영희",
        sizes: {
          "85": { name: "최영희", reserved: false },
          "90": { name: "가나다", reserved: false },
          "100": { name: "가나다", reserved: false },
          "115": { name: "홍길동", reserved: false },
        },
      },
      {
        studentName: "가나다",
        sizes: {
          "90": { name: "가나다", reserved: false },
          "95": { name: "가나다", reserved: false },
          "110": { name: "홍길동", reserved: false },
        },
      },
      {
        studentName: "김민준",
        sizes: {
          "125": { name: "김민준", reserved: true },
          "130": { name: "김민준", reserved: true },
        },
      },
    ],
  },
  {
    name: "라운드티",
    sizeStocks: {
      "85": { stock: 3, ordered: 1 },
      "90": { stock: 4, ordered: 2 },
      "95": { stock: 3, ordered: 0 },
      "100": { stock: 5, ordered: 1 },
      "105": { stock: 3, ordered: 1 },
      "110": { stock: 4, ordered: 0 },
      "115": { stock: 3, ordered: 1 },
      "120": { stock: 4, ordered: 1 },
      "125": { stock: 2, ordered: 0 },
      "130": { stock: 3, ordered: 1 },
      "135": { stock: 2, ordered: 0 },
    },
    rows: [
      {
        studentName: "정수민",
        sizes: {
          "85": { name: "정수민", reserved: false },
          "90": { name: "가나다", reserved: false },
          "100": { name: "가나다", reserved: false },
          "130": { name: "홍길동", reserved: false },
        },
      },
      {
        studentName: "가나다",
        sizes: {
          "90": { name: "가나다", reserved: false },
          "105": { name: "가나다", reserved: false },
          "120": { name: "홍길동", reserved: false },
        },
      },
      {
        studentName: "오준서",
        sizes: {
          "115": { name: "오준서", reserved: true },
        },
      },
    ],
  },
];
