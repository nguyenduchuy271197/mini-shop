import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Báo cáo & Thống kê - Admin",
  description: "Quản lý báo cáo và thống kê hệ thống",
};

export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
