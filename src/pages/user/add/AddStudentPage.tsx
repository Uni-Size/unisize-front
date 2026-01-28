import FormStepper from "./components/FormStepper";
import { addStudent } from "@/api/student";
import { useStudentFormStore } from "@/stores/useStudentFormStore";
import { useStudentResponseStore } from "@/stores/useStudentResponseStore";
import { useNavigate } from "react-router-dom";

export default function AddStudentPage() {
  const navigate = useNavigate();

  const { formData, resetFormData } = useStudentFormStore();
  const { setStudentData } = useStudentResponseStore();

  const handleSubmit = async () => {
    try {
      const result = await addStudent(formData);
      setStudentData(result);

      // 제출 성공 후 폼 데이터 초기화
      resetFormData();

      navigate("/waiting");
    } catch (error) {
      console.error("=== 학생 등록 실패 ===");
      console.error("에러:", error);

      // 에러 메시지 추출
      let errorMessage = "학생 정보 등록에 실패했습니다.";

      if (error && typeof error === "object") {
        if ("response" in error && error.response && typeof error.response === "object") {
          if ("data" in error.response && error.response.data && typeof error.response.data === "object") {
            if ("message" in error.response.data && typeof error.response.data.message === "string") {
              errorMessage = error.response.data.message;
            }
          }
        } else if ("message" in error && typeof error.message === "string") {
          errorMessage = error.message;
        }
      }

      console.error("에러 메시지:", errorMessage);
      alert(errorMessage);
    }
  };

  return (
    <div className="p-4">
      <FormStepper handleSubmit={handleSubmit} />
    </div>
  );
}
