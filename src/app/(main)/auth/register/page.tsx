import RegisterForm from "./_components/register-form";
import AuthLayout from "@/components/auth/auth-layout";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng ký",
  description:
    "Tạo tài khoản Minishop miễn phí để nhận được ưu đãi độc quyền, theo dõi đơn hàng và trải nghiệm mua sắm cá nhân hóa.",
  keywords: "đăng ký, tạo tài khoản, thành viên mới, ưu đãi",
  openGraph: {
    title: "Đăng ký | Minishop",
    description: "Tạo tài khoản Minishop miễn phí",
    url: "/auth/register",
    images: [
      {
        url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=630&fit=crop",
        width: 1200,
        height: 630,
        alt: "Đăng ký Minishop",
      },
    ],
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Tạo tài khoản"
      description="Đăng ký để trở thành thành viên của Mini Shop"
    >
      <RegisterForm />

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Đã có tài khoản?{" "}
          <Link
            href="/auth/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
