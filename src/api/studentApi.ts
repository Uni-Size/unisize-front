import { apiClient } from "@/lib/apiClient";

interface BodyMeasurements {
  height: number;
  weight: number;
  shoulder: number;
  waist: number;
}

interface StudentFormData {
  previousSchool: string;
  admissionYear: number;
  admissionGrade: number;
  admissionSchool: string;
  name: string;
  studentPhone: string;
  guardianPhone: string;
  birthDate: string;
  gender: string;
  privacyConsent: boolean;
  body: BodyMeasurements;
}

// 학생 생성
export async function addStudent(formData: StudentFormData) {
  const startTime = performance.now();

  const response = await apiClient.post("api/v1/students", formData);

  const endTime = performance.now();
  const responseTime = Math.round(endTime - startTime);

  console.log("응답 시간:", `${responseTime}ms`);

  return { ...response.data, responseTime };
}
