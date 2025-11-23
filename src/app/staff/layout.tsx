"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { SecurityMaintenanceInfoCompact } from "./components/SecurityMaintenanceInfo";

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [isClient, setIsClient] = useState(false);

  // 클라이언트에서만 렌더링되도록
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 인증 체크 (로그인 페이지가 아닌 경우)
  useEffect(() => {
    if (isClient && !pathname.includes("/staff/signup") && !isAuthenticated) {
      router.push("/staff/signup");
    }
  }, [isClient, pathname, isAuthenticated, router]);

  // 로그인 페이지인지 확인
  const isSignupPage = pathname === "/staff/signup";

  return (
    <section>
      {/* 로그인 페이지가 아닐 때만 SecurityMaintenanceInfoCompact 표시 */}
      {!isSignupPage && isClient && (
        <div className="py-6 px-5">
          <SecurityMaintenanceInfoCompact />
        </div>
      )}
      {children}
    </section>
  );
}
