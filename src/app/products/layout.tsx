import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sản phẩm - Mini Shop",
  description:
    "Khám phá bộ sưu tập sản phẩm chất lượng cao của Mini Shop với giá cả hợp lý.",
};

interface ProductsLayoutProps {
  children: React.ReactNode;
}

export default function ProductsLayout({ children }: ProductsLayoutProps) {
  return <>{children}</>;
}
