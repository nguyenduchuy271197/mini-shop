import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đơn hàng của tôi - Mini Shop",
  description: "Xem lịch sử đơn hàng và theo dõi trạng thái giao hàng",
};

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
