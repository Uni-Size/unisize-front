import { apiClient } from "@/lib/apiClient";

// 학생 생성
export async function addStudent(formData) {
  const startTime = performance.now();

  const response = await apiClient.post("api/v1/students", formData);

  const endTime = performance.now();
  const responseTime = Math.round(endTime - startTime);

  console.log("응답 시간:", `${responseTime}ms`);

  return { ...response.data, responseTime };
}
