import { create } from "zustand";
import { persist } from "zustand/middleware";

// 스태프 정보 타입 (API 응답의 user 객체)
export interface StaffInfo {
  id: number;
  employee_id: string;
  employee_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login: string;
}

interface AuthState {
  // 상태
  isAuthenticated: boolean;
  staff: StaffInfo | null;
  accessToken: string | null;
  refreshToken: string | null;

  // 액션
  setAuth: (
    staff: StaffInfo,
    accessToken: string,
    refreshToken?: string
  ) => void;
  clearAuth: () => void;
  updateStaff: (staff: StaffInfo) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // 초기 상태
      isAuthenticated: false,
      staff: null,
      accessToken: null,
      refreshToken: null,

      // 로그인 성공 시 호출
      setAuth: (staff, accessToken, refreshToken) => {
        // localStorage에도 저장
        localStorage.setItem("accessToken", accessToken);
        if (refreshToken) {
          localStorage.setItem("refreshToken", refreshToken);
        }

        set({
          isAuthenticated: true,
          staff,
          accessToken,
          refreshToken: refreshToken || null,
        });
      },

      // 로그아웃 시 호출
      clearAuth: () => {
        // localStorage에서 제거
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        set({
          isAuthenticated: false,
          staff: null,
          accessToken: null,
          refreshToken: null,
        });
      },

      // 스태프 정보 업데이트
      updateStaff: (staff) => {
        set({ staff });
      },
    }),
    {
      name: "auth-storage", // localStorage 키 이름
      partialize: (state) => ({
        // persist할 상태만 선택 (토큰은 localStorage에 별도 저장되므로 제외 가능)
        isAuthenticated: state.isAuthenticated,
        staff: state.staff,
      }),
    }
  )
);
