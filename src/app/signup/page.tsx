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
    try {
      const result = await addStudent(formData);
      setStudentData(result);

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
  return <FormStepper handleSubmit={handleSubmit} />;
}
