"use client";
import { useEffect } from "react";
import DashboardLayout from "../dashboard/layout";

export default function CostAnalysisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    localStorage.removeItem("ss_chat_history");
  }, []);

  return <DashboardLayout>{children}</DashboardLayout>;
}
