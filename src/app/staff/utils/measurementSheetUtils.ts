import type { StartMeasurementResponse } from "@/api/student";
import type { UniformProductItem } from "../components/MeasurementSheetTypes";

/**
 * 마감일이 지났는지 체크하는 함수
 * @param deadlineString "2025년 12월 31일" 형식의 마감일 문자열
 * @returns 마감일이 지났으면 true, 아니면 false
 */
export function isAfterDeadline(deadlineString?: string): boolean {
  if (!deadlineString) return false;

  // "2025년 12월 31일" 형식을 파싱
  const deadlineMatch = deadlineString.trim().match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/);
  if (!deadlineMatch) {
    return false;
  }

  const [, year, month, day] = deadlineMatch;

  // 마감일의 끝 시각 (23:59:59.999)
  const deadline = new Date(
    parseInt(year),
    parseInt(month) - 1,
    parseInt(day),
    23,
    59,
    59,
    999
  );

  // 현재 시각
  const now = new Date();

  return now > deadline;
}

/**
 * recommended_uniforms 데이터를 표시 형식으로 변환하는 함수
 */
export function transformUniformProducts(
  measurementData?: StartMeasurementResponse
): {
  winter: UniformProductItem[];
  summer: UniformProductItem[];
  all: UniformProductItem[];
} {
  const transformItem = (item: {
    product: string;
    available_sizes: Array<{ size: string }>;
    recommended_size: string;
    price: number;
    supported_quantity: number;
    quantity: number;
    selectable_with: string[];
    gender: "male" | "female" | "unisex";
    is_customization_required?: boolean;
    customization?: string;
  }): UniformProductItem => {
    const availableSizes =
      item.available_sizes.length > 0
        ? item.available_sizes.map((s) => Number(s.size) || 95)
        : item.recommended_size
          ? [Number(item.recommended_size) || 95]
          : [];

    return {
      id: item.product,
      name: item.product,
      recommendedSize: item.recommended_size,
      availableSizes,
      price: item.price,
      provided: item.supported_quantity,
      quantity: item.quantity,
      selectableWith: item.selectable_with,
      gender: item.gender,
      isCustomizationRequired: item.is_customization_required,
      customization: item.customization,
    };
  };

  return {
    winter: measurementData?.recommended_uniforms?.winter?.map(transformItem) || [],
    summer: measurementData?.recommended_uniforms?.summer?.map(transformItem) || [],
    all: measurementData?.recommended_uniforms?.all?.map(transformItem) || [],
  };
}

/**
 * 맞춤 정보가 필요한데 누락된 품목들을 찾는 함수
 */
export function findMissingCustomizationItems(
  uniformSizeItems: Array<{
    name: string;
    season: string;
    isCustomizationRequired?: boolean;
    customization?: string;
  }>
): string[] {
  const missingItems: string[] = [];

  uniformSizeItems.forEach((item) => {
    if (item.isCustomizationRequired) {
      const hasCustomization =
        item.customization && item.customization.trim().length > 0;

      if (!hasCustomization) {
        missingItems.push(`${item.name} (${item.season})`);
      }
    }
  });

  return missingItems;
}
