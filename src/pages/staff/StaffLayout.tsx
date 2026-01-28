import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { SecurityMaintenanceInfoCompact } from "./components/SecurityMaintenanceInfo";
import { getCurrentStaff } from "@/api/auth";

export default function StaffLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, clearAuth, updateStaff } = useAuthStore();
  const [isVerifying, setIsVerifying] = useState(true);

  // 인증 체크 (로그인 페이지가 아닌 경우)
  useEffect(() => {
    if (location.pathname.includes("/staff/login")) {
      setIsVerifying(false);
      return;
    }

    // 로컬 인증 상태 확인
    if (!isAuthenticated) {
      navigate("/staff/login");
      setIsVerifying(false);
      return;
    }

    // 서버에 실제 인증 상태 확인
    const verifyAuth = async () => {
      try {
        const staffInfo = await getCurrentStaff();
        // 서버 인증 성공 - staff 정보 업데이트
        updateStaff(staffInfo);
        setIsVerifying(false);
      } catch (error) {
        // 서버 인증 실패 - 로그아웃 처리 후 로그인 페이지로 이동
        console.error("Authentication verification failed:", error);
        clearAuth();
        navigate("/staff/login");
        setIsVerifying(false);
      }
    };

    verifyAuth();
  }, [location.pathname, isAuthenticated, clearAuth, updateStaff, navigate]);

  // 로그인 페이지인지 확인
  const isLoginPage = location.pathname === "/staff/login";

  // 인증 검증 중이면 빈 화면 또는 로딩 표시
  if (isVerifying && !isLoginPage) {
    return (
      <section className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">인증 확인 중...</div>
      </section>
    );
  }

  return (
    <section>
      {/* 로그인 페이지가 아닐 때만 SecurityMaintenanceInfoCompact 표시 */}
      {!isLoginPage && (
        <div className="py-6 px-5">
          <SecurityMaintenanceInfoCompact />
        </div>
      )}
      <Outlet />
    </section>
  );
}
