import LoginForm from "./_components/login-form";
import AuthLayout from "@/components/auth/auth-layout";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";
import type { Metadata } from "next";

interface LoginPageProps {
  searchParams: {
    message?: string;
  };
}

export const metadata: Metadata = {
  title: "Đăng nhập",
  description:
    "Đăng nhập vào tài khoản Minishop của bạn để truy cập vào lịch sử mua hàng, danh sách yêu thích và nhận được ưu đãi độc quyền.",
  keywords: "đăng nhập, tài khoản, thành viên minishop",
  openGraph: {
    title: "Đăng nhập | Minishop",
    description: "Đăng nhập vào tài khoản Minishop của bạn",
    url: "/auth/login",
    images: [
      {
        url: "https://images.unsplash.com/photo-1556742111-a301076d9d18?w=1200&h=630&fit=crop",
        width: 1200,
        height: 630,
        alt: "Đăng nhập Minishop",
      },
    ],
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <AuthLayout
      title="Đăng nhập"
      description="Đăng nhập vào tài khoản Mini Shop của bạn"
    >
      {searchParams.message === "registration-success" && (
        <Alert className="mb-4 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.
          </AlertDescription>
        </Alert>
      )}

      <LoginForm />

      <div className="mt-6 text-center space-y-2">
        <p className="text-sm text-gray-600">
          Chưa có tài khoản?{" "}
          <Link
            href="/auth/register"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Đăng ký ngay
          </Link>
        </p>

        <p className="text-sm">
          <Link
            href="/auth/forgot-password"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Quên mật khẩu?
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
