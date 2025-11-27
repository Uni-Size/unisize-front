import { useState, useEffect, useCallback } from "react";
import {
  getStartMeasurement,
  type StudentMeasurementData,
} from "@/api/studentApi";
import {
  measurementApi,
  type CompleteMeasurementRequest,
} from "@/api/measurementApi";
import { MeasurementMode, UniformSizeItem, SupplyItem } from "../components/types";

export const useMeasurementData = (
  studentId: number,
  mode: MeasurementMode
) => {
  const [studentData, setStudentData] = useState<StudentMeasurementData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isMeasurementComplete, setIsMeasurementComplete] = useState(
    mode === "edit" || mode === "readonly"
  );
  const [signature, setSignature] = useState("");

  // 학생 데이터 가져오기
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setIsLoading(true);
        const data = await getStartMeasurement(studentId);
        setStudentData(data);
      } catch (error) {
        console.error("Failed to fetch student data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentData();
  }, [studentId]);

  const handleCompleteMeasurement = useCallback(() => {
    setIsMeasurementComplete(true);
  }, []);

  const handleFinalConfirmation = useCallback(
    async (
      uniformSizeItems: UniformSizeItem[],
      supplyItems: SupplyItem[],
      itemCounts: Record<string, number>,
      setIsMeasurementSheetOpen: (open: boolean) => void
    ) => {
      if (!signature || signature.trim().length === 0) {
        alert("서명을 입력해주세요.");
        return;
      }

      // 용품 데이터 변환 (구입개수가 0인 항목 제외)
      const supplyItemsData = supplyItems
        .filter((item) => (itemCounts[item.id] || 0) > 0)
        .map((item) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          size: item.size,
          count: itemCounts[item.id] || 0,
        }));

      // 교복 데이터 변환
      const uniformItemsData = uniformSizeItems.map((item) => ({
        id: item.id,
        itemId: item.itemId,
        name: item.name,
        season: item.season,
        selectedSize: item.selectedSize,
        customization: item.customization,
        pantsLength: item.pantsLength,
        purchaseCount: item.purchaseCount,
      }));

      const requestData: CompleteMeasurementRequest = {
        studentId: "student-001",
        uniformItems: uniformItemsData,
        supplyItems: supplyItemsData,
        signature,
      };

      try {
        const result = await measurementApi.completeMeasurement(requestData);
        alert(result.message);
        setIsMeasurementSheetOpen(false);
      } catch (error) {
        console.error("측정 완료 실패:", error);
        alert("측정 완료에 실패했습니다.");
      }
    },
    [signature]
  );

  return {
    studentData,
    isLoading,
    isMeasurementComplete,
    setIsMeasurementComplete,
    signature,
    setSignature,
    handleCompleteMeasurement,
    handleFinalConfirmation,
  };
};
