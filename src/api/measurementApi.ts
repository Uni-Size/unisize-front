import {
  SUPPLY_ITEMS_CONFIG,
} from "@/mocks/measurementData";

// API 응답 타입
export type StudentInfoResponse = Record<string, unknown>;
export type MeasurementInfoResponse = Record<string, unknown>;
export type SupplyItemsConfigResponse = typeof SUPPLY_ITEMS_CONFIG;

// 측정 완료 요청 타입
export type CompleteMeasurementRequest = {
  studentId: string;
  uniformItems: Array<{
    id: string;
    itemId: string;
    name: string;
    season: "동복" | "하복";
    selectedSize: number;
    customization: string;
    pantsLength?: string;
    purchaseCount: number;
  }>;
  supplyItems: Array<{
    id: string;
    name: string;
    category: string;
    size: string;
    count: number;
  }>;
  signature: string;
};

// 더미 API 함수들
class MeasurementApi {
  // 학생 정보 조회
  async getStudentInfo(_studentId: string): Promise<StudentInfoResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({});
      }, 300);
    });
  }

  // 채촌 정보 조회
  async getMeasurementInfo(_studentId: string): Promise<MeasurementInfoResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({});
      }, 300);
    });
  }


  // 용품 아이템 설정 조회
  async getSupplyItemsConfig(): Promise<SupplyItemsConfigResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(SUPPLY_ITEMS_CONFIG);
      }, 300);
    });
  }

  // 측정 완료 제출
  async completeMeasurement(
    data: CompleteMeasurementRequest
  ): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("측정 완료 데이터:", data);
        resolve({
          success: true,
          message: "측정이 성공적으로 완료되었습니다.",
        });
      }, 500);
    });
  }
}

// API 인스턴스 export
export const measurementApi = new MeasurementApi();
