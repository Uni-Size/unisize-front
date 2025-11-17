"use client";

import { useAuth } from "@/hooks/useAuth";

export function StaffInfo() {
  const { staff, isAuthenticated } = useAuth();

  if (!isAuthenticated || !staff) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-col">
        <span className="text-sm font-medium">{staff.employee_name}</span>
        <span className="text-xs text-gray-500">{staff.role}</span>
      </div>
    </div>
  );
}
