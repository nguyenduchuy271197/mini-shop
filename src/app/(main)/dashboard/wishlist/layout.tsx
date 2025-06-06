import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Danh sách yêu thích | Mini Shop",
  description: "Quản lý sản phẩm yêu thích của bạn",
};

export default function WishlistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 