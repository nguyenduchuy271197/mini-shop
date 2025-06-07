import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản Lý Khuyến Mãi | Admin",
  description: "Tạo và quản lý mã giảm giá, chương trình khuyến mãi",
};

export default function PromotionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
