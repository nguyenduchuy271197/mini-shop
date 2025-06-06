import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thông tin cá nhân | Mini Shop",
  description: "Quản lý thông tin cá nhân và cài đặt tài khoản",
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
