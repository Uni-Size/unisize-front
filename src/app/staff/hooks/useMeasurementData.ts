import { useState, useEffect, useCallback } from "react";
import {
  getStartMeasurement,
  type StudentMeasurementData,
  type StartMeasurementResponse,
  type RegisterStudent,
  completeMeasurement,
  type CompleteMeasurementRequest,
} from "@/api/student";
import { MeasurementMode } from "../components/types";

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

  // 데이터 변환 헬퍼 함수는 더 이상 필요 없음 (notes와 signature만 전송)


  const handleCompleteMeasurement = useCallback(async () => {
    try {
      // notes와 signature만 전송 (교복 데이터는 전송하지 않음)
      const orderData: CompleteMeasurementRequest = {
        notes: "",
        signature: "",
      };
      await completeMeasurement(studentId, orderData);
      setIsMeasurementComplete(true);
    } catch (error) {
      console.error("측정 완료 저장 실패:", error);
      alert("측정 데이터 저장에 실패했습니다.");
      throw error;
    }
  }, [studentId]);

  const handleFinalConfirmation = useCallback(async () => {
    if (!signature || signature.trim().length === 0) {
      alert("서명을 작성해주세요.");
      throw new Error("서명이 필요합니다.");
    }

    // base64 이미지인지 확인
    if (!signature.startsWith("data:image")) {
      alert("서명을 작성해주세요.");
      throw new Error("서명이 필요합니다.");
    }

    try {
      // notes와 signature만 전송 (교복 데이터는 전송하지 않음)
      const finalizeData: CompleteMeasurementRequest = {
        notes: "",
        signature: signature,
      };

      await completeMeasurement(studentId, finalizeData);
      alert("사이즈 확정 및 주문이 완료되었습니다.");
    } catch (error) {
      console.error("최종 확정 실패:", error);
      alert("주문 확정에 실패했습니다.");
      throw error;
    }
  }, [studentId, signature]);

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
