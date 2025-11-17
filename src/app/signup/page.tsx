"use client";

import { useEffect } from "react";
import FormStepper from "./components/FormStepper";
import { checkHealth } from "@/api/healthApi";
import { addStudent } from "@/api/studentApi";
import { useStudentFormStore } from "@/stores/useStudentFormStore";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  useEffect(() => {
    checkHealth();
    console.log(formData);
  }, []);
  const router = useRouter();

  const { formData } = useStudentFormStore();

  const handleSubmit = async () => {
    console.log(formData);

    try {
      const result = await addStudent(formData);
      console.log("생성된 학생 ID:", result.studentId);
      router.push("/waiting");
    } catch (error) {
      console.error("학생 등록 실패:", error);
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
