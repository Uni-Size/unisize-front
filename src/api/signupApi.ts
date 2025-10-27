import { SUPPORTED_SCHOOLS } from "@/mocks/signupData";

// 학생 등록 요청 타입
export interface StudentRegistrationRequest {
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
  body: {
    height: number;
    weight: number;
    shoulder: number;
    waist: number;
  };
}

// 학생 등록 응답 타입
export interface StudentRegistrationResponse {
  success: boolean;
  message: string;
  studentId?: string;
}

// 학교 지원 여부 확인 응답 타입
export interface SchoolSupportResponse {
  supported: boolean;
  schoolName: string;
  message?: string;
}

// 더미 API 클래스
class SignupApi {
  // 지원 학교 목록 조회
  async getSupportedSchools(): Promise<string[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(SUPPORTED_SCHOOLS);
      }, 200);
    });
  }

  // 학교 지원 여부 확인
  async checkSchoolSupport(schoolName: string): Promise<SchoolSupportResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const supported = SUPPORTED_SCHOOLS.includes(schoolName);
        resolve({
          supported,
          schoolName,
          message: supported
            ? `${schoolName}은(는) 지원 가능한 학교입니다.`
            : `${schoolName}은(는) 현재 지원되지 않는 학교입니다.`,
        });
      }, 300);
    });
  }

  // 학생 정보 등록
  async registerStudent(
    data: StudentRegistrationRequest
  ): Promise<StudentRegistrationResponse> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // 필수 항목 검증
        if (
          !data.previousSchool ||
          !data.admissionYear ||
          !data.admissionGrade ||
          !data.admissionSchool ||
          !data.name ||
          !data.studentPhone ||
          !data.guardianPhone ||
          !data.birthDate ||
          !data.gender ||
          !data.body.height ||
          !data.body.weight ||
          !data.body.shoulder ||
          !data.body.waist
        ) {
          reject({
            success: false,
            message: "모든 필수 항목을 입력해주세요.",
          });
          return;
        }

        // 개인정보 동의 확인
        if (!data.privacyConsent) {
          reject({
            success: false,
            message: "개인정보 수집·이용에 동의해주세요.",
          });
          return;
        }

        // 성공 응답
        console.log("학생 등록 데이터:", data);
        resolve({
          success: true,
          message: "학생 정보가 성공적으로 등록되었습니다.",
          studentId: `student-${Date.now()}`,
        });
      }, 500);
    });
  }

  // 전화번호 형식 검증
  validatePhoneNumber(phoneNumber: string): boolean {
    const phoneRegex = /^\d{3}-\d{4}-\d{4}$/;
    return phoneRegex.test(phoneNumber);
  }

  // 생년월일 형식 검증 (YYYY-MM-DD)
  validateBirthDate(birthDate: string): boolean {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    return dateRegex.test(birthDate);
  }
}

// API 인스턴스 export
export const signupApi = new SignupApi();
