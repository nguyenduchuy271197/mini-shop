import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Danh mục sản phẩm - Mini Shop",
  description:
    "Khám phá các danh mục sản phẩm đa dạng tại Mini Shop với nhiều lựa chọn hấp dẫn.",
};

interface CategoriesLayoutProps {
  children: React.ReactNode;
}

export default function CategoriesLayout({ children }: CategoriesLayoutProps) {
  return <>{children}</>;
}
