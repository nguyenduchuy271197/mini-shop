import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản Lý Đánh Giá | Admin",
  description: "Duyệt, xóa đánh giá không phù hợp",
};

export default function ReviewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
