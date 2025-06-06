import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng nhập | Mini Shop",
  description: "Đăng nhập vào tài khoản Mini Shop của bạn",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
