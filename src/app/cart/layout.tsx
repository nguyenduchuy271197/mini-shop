import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Giỏ hàng | Mini Shop",
  description: "Xem và quản lý sản phẩm trong giỏ hàng của bạn",
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
