import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý thanh toán | Admin",
  description:
    "Quản lý giao dịch thanh toán, báo cáo doanh thu và đối soát thanh toán",
};

export default function PaymentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
