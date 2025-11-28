"use client";

import { useState } from "react";
import ProgressList from "./components/ProgressList";
import PaymentList from "./components/PaymentList";
import Button from "@/components/ui/Button";
import { logout } from "@/api/authApi";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";

function Page() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"confirmed" | "unpaid">(
    "confirmed"
  );

  const { clearAuth } = useAuthStore();

  const handleLogout = async () => {
    if (confirm("로그아웃 하시겠습니까?")) {
      try {
        await logout();
        clearAuth();
        router.push("/staff/login");
      } catch (error) {
        console.error("로그아웃 실패:", error);
        alert("로그아웃에 실패했습니다.");
      }
    }
  };
  return (
    <div className="mb-12">
      <div className="flex">
        <button
          className={`w-full text-center py-3 transition-colors ${
            activeTab === "confirmed"
              ? "border-b-2 border-blue-500 text-blue-500 font-semibold"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("confirmed")}
        >
          확정진행중
        </button>
        <button
          className={`w-full text-center py-3 transition-colors ${
            activeTab === "unpaid"
              ? "border-b-2 border-blue-500 text-blue-500 font-semibold"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("unpaid")}
        >
          결제 전
        </button>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="p-4">
        {activeTab === "confirmed" && <ProgressList />}
        {activeTab === "unpaid" && <PaymentList />}
      </div>
      <div className="text-right mt-12">
        <button
          type="button"
          onClick={handleLogout}
          className="text-gray-600 underline cursor-pointer"
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}

export default Page;
