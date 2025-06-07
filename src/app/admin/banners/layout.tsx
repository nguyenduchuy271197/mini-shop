import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản Lý Banner | Admin",
  description: "Thêm, sửa, xóa banner quảng cáo trên trang chủ",
};

export default function BannersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
