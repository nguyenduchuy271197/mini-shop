import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đánh giá sản phẩm | Mini Shop",
  description: "Quản lý đánh giá và nhận xét sản phẩm của bạn",
};

interface ReviewsLayoutProps {
  children: React.ReactNode;
}

export default function ReviewsLayout({ children }: ReviewsLayoutProps) {
  return <>{children}</>;
}
