"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerStaff } from "@/api/auth";
import Button from "@/components/ui/Button";

interface FormData {
  employee_id: string;
  employee_name: string;
  gender: "M" | "F" | "";
  password: string;
  passwordConfirm: string;
}

export default function StaffSignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    employee_id: "",
    employee_name: "",
    gender: "",
    password: "",
    passwordConfirm: "",
  });
  const [errors, setErrors] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showPasswordConfirm, setShowPasswordConfirm] =
    useState<boolean>(false);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors("");
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^010\d{8}$/;
    return phoneRegex.test(phone);
  };

  // 비밀번호 확인 일치 여부 체크
  const isPasswordMismatch =
    formData.passwordConfirm.length > 0 &&
    formData.password !== formData.passwordConfirm;

  const isFormValid =
    formData.employee_id.trim() !== "" &&
    formData.employee_name.trim() !== "" &&
    formData.gender !== "" &&
    formData.password.length >= 8 &&
    formData.password === formData.passwordConfirm &&
    validatePhoneNumber(formData.employee_id);

  const handleSubmit = async () => {
    setErrors("");

    if (
      !formData.employee_id ||
      !formData.employee_name ||
      !formData.gender ||
      !formData.password
    ) {
      setErrors("모든 항목을 입력해주세요.");
      alert("모든 항목을 입력해주세요.");
      return;
    }

    if (!validatePhoneNumber(formData.employee_id)) {
      setErrors("전화번호는 010으로 시작하는 11자리 숫자여야 합니다.");
      alert("전화번호는 010으로 시작하는 11자리 숫자여야 합니다.");
      return;
    }

    if (formData.password.length < 8) {
      setErrors("비밀번호는 최소 8자 이상이어야 합니다.");
      alert("비밀번호는 최소 8자 이상이어야 합니다.");
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      setErrors("비밀번호가 일치하지 않습니다.");
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    setIsLoading(true);

    try {
      await registerStaff({
        employee_id: formData.employee_id,
        employee_name: formData.employee_name,
        gender: formData.gender as "M" | "F",
        password: formData.password,
      });

      alert("회원가입이 완료되었습니다.");
      router.push("/staff/signup");
    } catch (error: unknown) {
      console.error("스태프 등록 실패:", error);
      const errorMessage =
        (
          error as {
            response?: { data?: { error?: { message?: string } } };
            message?: string;
          }
        )?.response?.data?.error?.message ||
        (error as { message?: string })?.message ||
        "스태프 등록에 실패했습니다.";
      setErrors(errorMessage);
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.push("/staff/signup");
  };

  return (
    <div>
      <div className="mb-7">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center text-gray-600 hover:text-gray-900 transition duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-medium">뒤로</span>
        </button>
      </div>

      <section>
        <h2 className="title2 text-center mb-14">스태프 정보를 입력해주세요</h2>

        {errors && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
            {errors}
          </div>
        )}

        <div className="space-y-4">
          {/* 전화번호 (employee_id) */}
          <div>
            <label
              htmlFor="employee_id"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              전화번호 (아이디)
            </label>
            <input
              id="employee_id"
              type="tel"
              value={formData.employee_id}
              onChange={(e) => handleChange("employee_id", e.target.value)}
              className="w-full"
              placeholder="01012345678 (숫자만 11자리)"
              maxLength={11}
              disabled={isLoading}
            />
            <p className="mt-1 text-xs text-gray-500">
              010으로 시작하는 11자리 숫자를 입력해주세요
            </p>
          </div>

          {/* 이름 */}
          <div>
            <label
              htmlFor="employee_name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              이름
            </label>
            <input
              id="employee_name"
              type="text"
              value={formData.employee_name}
              onChange={(e) => handleChange("employee_name", e.target.value)}
              className="w-full"
              placeholder="이름을 입력해주세요"
              disabled={isLoading}
            />
          </div>

          {/* 성별 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              성별
            </label>
            <div className="flex gap-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value="M"
                  checked={formData.gender === "M"}
                  onChange={(e) => handleChange("gender", e.target.value)}
                  disabled={isLoading}
                  className="mr-2 w-4 h-4 cursor-pointer"
                />
                <span className="text-gray-700">남성</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value="F"
                  checked={formData.gender === "F"}
                  onChange={(e) => handleChange("gender", e.target.value)}
                  disabled={isLoading}
                  className="mr-2 w-4 h-4 cursor-pointer"
                />
                <span className="text-gray-700">여성</span>
              </label>
            </div>
          </div>

          {/* 비밀번호 */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              비밀번호
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className="w-full pr-10"
                placeholder="비밀번호 (최소 8자)"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                disabled={isLoading}
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* 비밀번호 확인 */}
          <div>
            <label
              htmlFor="passwordConfirm"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              비밀번호 확인
            </label>
            <div className="relative">
              <input
                id="passwordConfirm"
                type={showPasswordConfirm ? "text" : "password"}
                value={formData.passwordConfirm}
                onChange={(e) =>
                  handleChange("passwordConfirm", e.target.value)
                }
                className={`w-full pr-10 ${
                  isPasswordMismatch
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : ""
                }`}
                placeholder="비밀번호를 다시 입력해주세요"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                disabled={isLoading}
              >
                {showPasswordConfirm ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                )}
              </button>
            </div>
            {isPasswordMismatch && (
              <p className="mt-1 text-sm text-red-600">
                비밀번호가 일치하지 않습니다.
              </p>
            )}
          </div>

          {/* 등록 버튼 */}
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!isFormValid || isLoading}
            className="mt-6"
          >
            {isLoading ? "등록 중..." : "등록하기"}
          </Button>
        </div>
      </section>
    </div>
  );
}
