"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import TabNavigation, { Tab } from "./components/TabNavigation";

const tabs: Tab[] = [
  { id: "smart-uniform", label: "스마트학생복 청주점" },
  { id: "reservation", label: "학생예약" },
  { id: "order", label: "본사주문" },
  { id: "staff-management", label: "스태프관리" },
  { id: "school-management", label: "학교" },
  { id: "product-management", label: "제품" },
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

  const isPublicPage = PUBLIC_ADMIN_PAGES.includes(pathname);

  useEffect(() => {
    if (isPublicPage) {
      return;
    }

    if (staff && staff.role !== "admin") {
      console.error("관리자 권한이 없습니다. 로그인 페이지로 이동합니다.");
      router.replace("/staff/login");
    }
  }, [staff, router, pathname, isPublicPage]);

  if (isPublicPage) {
    return <>{children}</>;
  }

  if (staff && staff.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TabNavigation tabs={tabs} />
      {children}
    </div>
  );
}
