import {
  useQuery,
  useMutation,
  UseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";
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

export type CompleteMeasurementResponse = {
  success: boolean;
  message: string;
};

// Query Keys
export const measurementKeys = {
  all: ["measurement"] as const,
  studentInfo: (studentId: string) =>
    [...measurementKeys.all, "studentInfo", studentId] as const,
  measurementInfo: (studentId: string) =>
    [...measurementKeys.all, "measurementInfo", studentId] as const,
  supplyItemsConfig: () =>
    [...measurementKeys.all, "supplyItemsConfig"] as const,
};

// API 함수들

async function fetchStudentInfo(
  studentId: string
): Promise<StudentInfoResponse> {
  // 더미 데이터로 시뮬레이션
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`학생 정보 조회 (ID: ${studentId})`);
      resolve({});
    }, 300);
  });
}

async function fetchMeasurementInfo(
  studentId: string
): Promise<MeasurementInfoResponse> {
  // 더미 데이터로 시뮬레이션
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`채촌 정보 조회 (ID: ${studentId})`);
      resolve({});
    }, 300);
  });
}


async function fetchSupplyItemsConfig(): Promise<SupplyItemsConfigResponse> {
  // 더미 데이터로 시뮬레이션
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("용품 아이템 설정 조회:", SUPPLY_ITEMS_CONFIG);
      resolve(SUPPLY_ITEMS_CONFIG);
    }, 300);
  });
}

async function submitCompleteMeasurement(
  data: CompleteMeasurementRequest
): Promise<CompleteMeasurementResponse> {
  // 더미 데이터로 시뮬레이션
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

// React Query Hooks

// 1. 학생 정보 조회
export function useStudentInfo(
  studentId: string,
  options?: Omit<
    UseQueryOptions<
      StudentInfoResponse,
      Error,
      StudentInfoResponse,
      readonly string[]
    >,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: measurementKeys.studentInfo(studentId),
    queryFn: () => fetchStudentInfo(studentId),
    enabled: !!studentId, // studentId가 있을 때만 실행
    ...options,
  });
}

// 2. 채촌 정보 조회
export function useMeasurementInfo(
  studentId: string,
  options?: Omit<
    UseQueryOptions<
      MeasurementInfoResponse,
      Error,
      MeasurementInfoResponse,
      readonly string[]
    >,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: measurementKeys.measurementInfo(studentId),
    queryFn: () => fetchMeasurementInfo(studentId),
    enabled: !!studentId, // studentId가 있을 때만 실행
    ...options,
  });
}

// 3. 용품 아이템 설정 조회
export function useSupplyItemsConfig(
  options?: Omit<
    UseQueryOptions<
      SupplyItemsConfigResponse,
      Error,
      SupplyItemsConfigResponse,
      readonly string[]
    >,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: measurementKeys.supplyItemsConfig(),
    queryFn: fetchSupplyItemsConfig,
    ...options,
  });
}

// 4. 측정 완료 제출
export function useCompleteMeasurement(
  options?: UseMutationOptions<
    CompleteMeasurementResponse,
    Error,
    CompleteMeasurementRequest
  >
) {
  return useMutation({
    mutationFn: submitCompleteMeasurement,
    ...options,
  });
}
