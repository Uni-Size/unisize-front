import { useState, useEffect, useCallback } from "react";
import {
  getStartMeasurement,
  type StudentMeasurementData,
  type StartMeasurementResponse,
  type RegisterStudent,
  submitMeasurementOrder,
  finalizeMeasurementOrder,
  type MeasurementOrderRequest,
  type FinalizeOrderRequest,
  type MeasurementOrderItem,
  type SupplyOrderItem,
} from "@/api/studentApi";
import {
  MeasurementMode,
  UniformSizeItem,
  SupplyItem,
} from "../components/types";

export const useMeasurementData = (
  studentId: number,
  mode: MeasurementMode,
  initialMeasurementData?: StartMeasurementResponse,
  selectedStudent?: RegisterStudent
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

        // initialMeasurementData가 있으면 API 호출 대신 이 데이터를 사용
        if (initialMeasurementData) {
          const convertedData: StudentMeasurementData = {
            id: initialMeasurementData.student_id,
            name: initialMeasurementData.student_name,
            gender: selectedStudent?.gender || "",
            birth_date: selectedStudent?.birth_date || "",
            student_phone: selectedStudent?.student_phone || "",
            guardian_phone: initialMeasurementData.parent_phone,
            previous_school: initialMeasurementData.from_school,
            admission_year: selectedStudent?.admission_year || 0,
            admission_grade: selectedStudent?.admission_grade || 0,
            school_name: initialMeasurementData.to_school,
            address: selectedStudent?.address || "",
            delivery: selectedStudent?.delivery || false,
            body: initialMeasurementData.body_measurements || {
              height: 0,
              weight: 0,
              shoulder: 0,
              waist: 0,
            },
            deadline: initialMeasurementData.school_deadline,
          };
          setStudentData(convertedData);
        } else {
          const data = await getStartMeasurement(studentId);
          setStudentData(data);
        }
      } catch (error) {
        console.error("Failed to fetch student data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentData();
  }, [studentId, initialMeasurementData, selectedStudent]);

  // 데이터 변환 헬퍼 함수
  const transformOrderData = useCallback(
    (
      uniformSizeItems: UniformSizeItem[],
      supplyItems: SupplyItem[],
      itemCounts: Record<string, number>
    ): MeasurementOrderRequest => {
      // 교복 데이터 변환
      const uniformItems: MeasurementOrderItem[] = uniformSizeItems.map(
        (item) => ({
          item_id: item.itemId,
          name: item.name,
          season: item.season,
          selected_size: item.selectedSize,
          customization: item.customization,
          pants_length: item.pantsLength,
          purchase_count: item.purchaseCount,
        })
      );

      // 용품 데이터 변환 (구입개수가 0인 항목 제외)
      const supplyItemsData: SupplyOrderItem[] = supplyItems
        .filter((item) => (itemCounts[item.id] || 0) > 0)
        .map((item) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          size: item.size,
          count: itemCounts[item.id] || 0,
        }));

      return {
        uniform_items: uniformItems,
        supply_items: supplyItemsData,
      };
    },
    []
  );

  const handleCompleteMeasurement = useCallback(
    async (
      uniformSizeItems: UniformSizeItem[],
      supplyItems: SupplyItem[],
      itemCounts: Record<string, number>
    ) => {
      try {
        const orderData = transformOrderData(
          uniformSizeItems,
          supplyItems,
          itemCounts
        );
        await submitMeasurementOrder(studentId, orderData);
        setIsMeasurementComplete(true);
      } catch (error) {
        console.error("임시 장바구니 저장 실패:", error);
        alert("측정 데이터 저장에 실패했습니다.");
        throw error;
      }
    },
    [studentId, transformOrderData]
  );

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

      try {
        const orderData = transformOrderData(
          uniformSizeItems,
          supplyItems,
          itemCounts
        );
        const finalizeData: FinalizeOrderRequest = {
          ...orderData,
          signature,
        };

        await finalizeMeasurementOrder(studentId, finalizeData);
        alert("사이즈 확정 및 주문이 완료되었습니다.");
        setIsMeasurementSheetOpen(false);
      } catch (error) {
        console.error("최종 확정 실패:", error);
        alert("주문 확정에 실패했습니다.");
      }
    },
    [studentId, signature, transformOrderData]
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
