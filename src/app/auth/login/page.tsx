import { Suspense } from "react";
import LoginForm from "./_components/login-form";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LoginPageProps {
  searchParams?: {
    message?: string;
    redirectTo?: string;
  };
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  const message = searchParams?.message;

  const getMessageContent = (message: string) => {
    switch (message) {
      case "registration-success":
        return {
          type: "success",
          content:
            "Đăng ký thành công! Vui lòng đăng nhập vào tài khoản của bạn.",
        };
      case "email-verified":
        return {
          type: "success",
          content:
            "Email đã được xác thực thành công! Bạn có thể đăng nhập ngay bây giờ.",
        };
      case "password-reset-success":
        return {
          type: "success",
          content:
            "Mật khẩu đã được đặt lại thành công! Vui lòng đăng nhập với mật khẩu mới.",
        };
      case "email-verification-failed":
        return {
          type: "error",
          content:
            "Xác thực email thất bại. Vui lòng thử lại hoặc liên hệ hỗ trợ.",
        };
      case "session-expired":
        return {
          type: "warning",
          content: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
        };
      default:
        return null;
    }
  };

  const messageInfo = message ? getMessageContent(message) : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Đăng nhập tài khoản
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Hoặc{" "}
            <a
              href="/auth/register"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              tạo tài khoản mới
            </a>
          </p>
        </div>

        {messageInfo && (
          <Alert
            className={
              messageInfo.type === "error"
                ? "border-red-200 bg-red-50"
                : messageInfo.type === "warning"
                ? "border-yellow-200 bg-yellow-50"
                : "border-green-200 bg-green-50"
            }
          >
            <AlertDescription
              className={
                messageInfo.type === "error"
                  ? "text-red-800"
                  : messageInfo.type === "warning"
                  ? "text-yellow-800"
                  : "text-green-800"
              }
            >
              {messageInfo.content}
            </AlertDescription>
          </Alert>
        )}

        <Suspense fallback={<div>Đang tải...</div>}>
          <LoginForm redirectTo={searchParams?.redirectTo} />
        </Suspense>
      </div>
    </div>
  );
}
