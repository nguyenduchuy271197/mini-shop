import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý đơn hàng | Mini Shop Admin",
  description: "Xem và cập nhật trạng thái đơn hàng - FR028",
};

export default function AdminOrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
