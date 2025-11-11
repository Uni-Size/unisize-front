"use client";

import TabNavigation, { Tab } from "./components/TabNavigation";

// Tabs configuration for all admin pages
const tabs: Tab[] = [
  { id: "smart-uniform", label: "스마트학생복 정주점" },
  { id: "invoice", label: "승창" },
  { id: "reservation", label: "예약수량" },
  { id: "order", label: "주문등록" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Tab Navigation */}
      <TabNavigation tabs={tabs} />

      {/* Page Content */}
      {children}
    </div>
  );
}
