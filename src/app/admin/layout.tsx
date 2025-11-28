"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import TabNavigation, { Tab } from "./components/TabNavigation";

// Tabs configuration for all admin pages
const tabs: Tab[] = [
  { id: "smart-uniform", label: "스마트학생복 청주점" },
  { id: "invoice", label: "송장" },
  { id: "reservation", label: "학생예약" },
  { id: "order", label: "본사주문" },
];

const PUBLIC_ADMIN_PAGES: string[] = [];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { staff } = useAuthStore();

  // 로그인 페이지인지 확인
  const isPublicPage = PUBLIC_ADMIN_PAGES.includes(pathname);

  useEffect(() => {
    // 로그인 페이지는 권한 체크 건너뛰기
    if (isPublicPage) {
      return;
    }

    // 클라이언트 사이드에서 권한 체크 (이중 방어)
    if (staff && staff.role !== "admin") {
      console.error("관리자 권한이 없습니다. 로그인 페이지로 이동합니다.");
      router.replace("/staff/login");
    }
  }, [staff, router, pathname, isPublicPage]);

  // 로그인 페이지는 항상 렌더링
  if (isPublicPage) {
    return <>{children}</>;
  }

  // admin이 아닌 경우 렌더링하지 않음
  if (staff && staff.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Tab Navigation */}
      <TabNavigation tabs={tabs} />

      {/* Page Content */}
      {children}
    </div>
  );
}
