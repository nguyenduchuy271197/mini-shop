import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Mini Shop",
  description: "Quản lý tài khoản và đđơn hàng của bạn",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-50">
      <main className="py-8">{children}</main>
    </div>
  );
}
