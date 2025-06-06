import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng ký | Mini Shop",
  description: "Tạo tài khoản mới để bắt đầu mua sắm tại Mini Shop",
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
