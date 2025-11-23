"use client";

import { useEffect } from "react";
import FormStepper from "./components/FormStepper";
import { checkHealth } from "@/api/healthApi";
import { addStudent } from "@/api/studentApi";
import { useStudentFormStore } from "@/stores/useStudentFormStore";
import { useStudentResponseStore } from "@/stores/useStudentResponseStore";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  useEffect(() => {
    checkHealth();
    console.log(formData);
  }, []);
  const router = useRouter();

  const { formData } = useStudentFormStore();
  const { setStudentData } = useStudentResponseStore();

  const handleSubmit = async () => {
    console.log("=== 폼 제출 시작 ===");
    console.log("전송할 데이터:", formData);

    try {
      const result = await addStudent(formData);
      console.log("=== API 응답 받음 ===");
      console.log("응답 전체:", result);
      console.log("응답 타입:", typeof result);
      console.log("응답 키:", Object.keys(result || {}));

      // 응답 데이터를 store에 저장
      console.log("=== Store에 저장 시도 ===");
      setStudentData(result);
      console.log("=== Store에 저장 완료 ===");

      // 저장 직후 store 확인
      console.log(
        "저장 직후 store 확인:",
        useStudentResponseStore.getState().studentData
      );

      router.push("/waiting");
    } catch (error) {
      console.error("=== 학생 등록 실패 ===");
      console.error("에러:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "학생 정보 등록에 실패했습니다.";
      alert(errorMessage);
    }
  };
  return (
    <main className="p-4 relative overflow-hidden h-screen ">
      <FormStepper handleSubmit={handleSubmit} />
    </main>
  );
}
