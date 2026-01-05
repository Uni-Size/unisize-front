/**
 * 측정 시트의 세션 데이터 타입
 */
export interface MeasurementSessionData {
  studentId: number;
  mode: "new" | "edit";
  orderId?: number;
  uniformItems: Array<{
    itemId: string | number;
    productId?: number;
    name: string;
    season: string;
    selectedSize: string | number;
    customization?: string;
    purchaseCount: number;
    freeQuantity?: number;
    isCustomizationRequired?: boolean;
  }>;
  supplyItems: Array<{
    id: string;
    product_id?: number;
    name: string;
    category: string;
    size: string;
  }>;
  supplyItemCounts: Record<string, number>;
  season: "winter" | "summer" | "all";
  timestamp: number;
}

const SESSION_KEY_PREFIX = "measurement_session_";

/**
 * 세션 데이터를 저장합니다.
 */
export function saveMeasurementSession(
  studentId: number,
  data: Omit<MeasurementSessionData, "studentId" | "timestamp">
): void {
  try {
    const sessionData: MeasurementSessionData = {
      ...data,
      studentId,
      timestamp: Date.now(),
    };
    sessionStorage.setItem(
      `${SESSION_KEY_PREFIX}${studentId}`,
      JSON.stringify(sessionData)
    );
  } catch (error) {
    console.error("세션 저장 실패:", error);
  }
}

/**
 * 세션 데이터를 불러옵니다.
 */
export function loadMeasurementSession(
  studentId: number
): MeasurementSessionData | null {
  try {
    const data = sessionStorage.getItem(`${SESSION_KEY_PREFIX}${studentId}`);
    if (!data) return null;

    const sessionData: MeasurementSessionData = JSON.parse(data);

    // 24시간 이상 경과한 세션은 삭제
    const ONE_DAY = 24 * 60 * 60 * 1000;
    if (Date.now() - sessionData.timestamp > ONE_DAY) {
      clearMeasurementSession(studentId);
      return null;
    }

    return sessionData;
  } catch (error) {
    console.error("세션 불러오기 실패:", error);
    return null;
  }
}

/**
 * 세션 데이터를 삭제합니다.
 */
export function clearMeasurementSession(studentId: number): void {
  try {
    sessionStorage.removeItem(`${SESSION_KEY_PREFIX}${studentId}`);
  } catch (error) {
    console.error("세션 삭제 실패:", error);
  }
}

/**
 * 모든 측정 세션을 삭제합니다.
 */
export function clearAllMeasurementSessions(): void {
  try {
    const keys = Object.keys(sessionStorage);
    keys.forEach((key) => {
      if (key.startsWith(SESSION_KEY_PREFIX)) {
        sessionStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error("전체 세션 삭제 실패:", error);
  }
}

/**
 * 세션 데이터가 존재하는지 확인합니다.
 */
export function hasMeasurementSession(studentId: number): boolean {
  return sessionStorage.getItem(`${SESSION_KEY_PREFIX}${studentId}`) !== null;
}
