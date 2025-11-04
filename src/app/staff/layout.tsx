"use client";

import { useState } from "react";
import { SecurityMaintenanceInfoCompact } from "./components/SecurityMaintenanceInfo";

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="relative">
        <SecurityMaintenanceInfoCompact />
      </div>
      {children}
    </section>
  );
}
