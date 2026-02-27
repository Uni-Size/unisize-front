import type { ReactNode } from "react";
import type { AxiosError } from "axios";

interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export const getApiErrorMessage = (
  err: unknown,
  fallback: string,
): ReactNode => {
  const axiosErr = err as AxiosError<ApiErrorResponse>;

  // API 에러 응답이 있는 경우
  const apiError = axiosErr?.response?.data?.error;
  if (apiError?.message) {
    if (apiError.code) {
      return (
        <>
          <div>[{apiError.code}]</div>
          <div>{apiError.message}</div>
        </>
      );
    }
    return apiError.message;
  }

  // 타임아웃 에러
  if (axiosErr?.code === "ECONNABORTED") {
    return "서버 응답 시간이 초과되었습니다.";
  }

  // 네트워크 에러 (서버 연결 불가)
  if (axiosErr?.message === "Network Error") {
    return "서버에 연결할 수 없습니다.";
  }

  return fallback;
};
