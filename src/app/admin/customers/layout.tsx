import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý khách hàng | Admin",
  description:
    "Quản lý danh sách khách hàng, thông tin cá nhân và lịch sử mua hàng",
};

export default function CustomersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
