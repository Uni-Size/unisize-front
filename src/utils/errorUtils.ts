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
): string => {
  const axiosErr = err as AxiosError<ApiErrorResponse>;
  const apiError = axiosErr?.response?.data?.error;
  if (apiError?.message) {
    return apiError.code
      ? `[${apiError.code}] ${apiError.message}`
      : apiError.message;
  }
  return fallback;
};
