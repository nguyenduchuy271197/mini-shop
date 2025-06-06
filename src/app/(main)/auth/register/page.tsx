import RegisterForm from "./_components/register-form";
import AuthLayout from "@/components/auth/auth-layout";
import Link from "next/link";

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
