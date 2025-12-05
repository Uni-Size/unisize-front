import { useState, useEffect, useCallback } from "react";
import {
  getStartMeasurement,
  type StudentMeasurementData,
  type StartMeasurementResponse,
  type RegisterStudent,
  completeMeasurement,
  type CompleteMeasurementRequest,
  type UniformOrderItem,
  type AccessoryOrderItem,
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
            registered_at: initialMeasurementData.registered_at || null,
            measurement_start_at: initialMeasurementData.measurement_start_at || null,
            measurement_end_at: initialMeasurementData.measurement_end_at || null,
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

  // 데이터 변환 헬퍼 함수 (새로운 API 형식)
  const transformToCompleteMeasurementData = useCallback(
    (
      uniformSizeItems: UniformSizeItem[],
      supplyItems: SupplyItem[],
      itemCounts: Record<string, number>
    ): CompleteMeasurementRequest => {
      // 교복 데이터 변환
      const uniformItems: UniformOrderItem[] = uniformSizeItems.map((item) => {
        // 맞춤 정보 조합 (바지인 경우 기장 포함)
        const customDetails = item.pantsLength
          ? `기장: ${item.pantsLength}${item.customization ? `, ${item.customization}` : ""}`
          : item.customization || "";

        return {
          product_id: item.productId || 0,
          size: String(item.selectedSize),
          custom_details: customDetails,
          free_quantity: item.freeQuantity || 0,
          purchase_quantity: item.purchaseCount,
        };
      });

      // 용품 데이터 변환 (구입개수가 0인 항목 제외)
      const accessoryItems: AccessoryOrderItem[] = supplyItems
        .filter((item) => (itemCounts[item.id] || 0) > 0)
        .map((item) => ({
          product_id: 0, // 용품은 product_id가 없으므로 0으로 설정
          size: item.size,
          custom_details: `${item.name} - ${item.category}`,
          free_quantity: 0,
          purchase_quantity: itemCounts[item.id] || 0,
        }));

      return {
        uniform_items: uniformItems,
        accessory_items: accessoryItems,
        notes: "",
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
        const orderData = transformToCompleteMeasurementData(
          uniformSizeItems,
          supplyItems,
          itemCounts
        );
        await completeMeasurement(studentId, orderData);
        setIsMeasurementComplete(true);
      } catch (error) {
        console.error("측정 완료 저장 실패:", error);
        alert("측정 데이터 저장에 실패했습니다.");
        throw error;
      }
    },
    [studentId, transformToCompleteMeasurementData]
  );

  const handleFinalConfirmation = useCallback(
    async (
      uniformSizeItems: UniformSizeItem[],
      supplyItems: SupplyItem[],
      itemCounts: Record<string, number>,
      setIsMeasurementSheetOpen: (open: boolean) => void
    ) => {
      if (!signature || signature.trim().length === 0) {
        alert("서명을 작성해주세요.");
        return;
      }

      // base64 이미지인지 확인
      if (!signature.startsWith("data:image")) {
        alert("서명을 작성해주세요.");
        return;
      }

      try {
        const orderData = transformToCompleteMeasurementData(
          uniformSizeItems,
          supplyItems,
          itemCounts
        );

        // 서명 정보를 notes에 추가 (base64 이미지 데이터)
        const finalizeData: CompleteMeasurementRequest = {
          ...orderData,
          notes: `서명 이미지: ${signature}`,
        };

        await completeMeasurement(studentId, finalizeData);
        alert("사이즈 확정 및 주문이 완료되었습니다.");
        setIsMeasurementSheetOpen(false);
      } catch (error) {
        console.error("최종 확정 실패:", error);
        alert("주문 확정에 실패했습니다.");
      }
    },
    [studentId, signature, transformToCompleteMeasurementData]
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
