import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản Lý Vận Chuyển | Admin",
  description: "Cấu hình phí vận chuyển theo khu vực, trọng lượng",
};

export default function ShippingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
