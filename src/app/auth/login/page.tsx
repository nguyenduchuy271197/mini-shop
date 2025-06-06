import LoginForm from "./_components/login-form";
import AuthLayout from "@/components/auth/auth-layout";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";

interface LoginPageProps {
  searchParams: {
    message?: string;
  };
}

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
