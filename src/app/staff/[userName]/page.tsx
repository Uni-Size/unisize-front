"use client";

import { useState } from "react";
import ProgressList from "./components/ProgressList";
import PaymentList from "./components/PaymentList";

function Page() {
  const [activeTab, setActiveTab] = useState<"confirmed" | "unpaid">(
    "confirmed"
  );

  return (
    <div>
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
    </div>
  );
}

export default Page;
