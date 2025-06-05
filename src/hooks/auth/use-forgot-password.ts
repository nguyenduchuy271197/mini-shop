"use client";

import { useMutation } from "@tanstack/react-query";
import { forgotPassword } from "@/actions/auth/forgot-password";
import { toast } from "@/hooks/use-toast";

export function useForgotPassword() {
  return useMutation({
    mutationFn: forgotPassword,
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Gửi email thành công!",
          description: data.message,
        });
      } else {
        toast({
          title: "Gửi email thất bại",
          description: data.error,
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Gửi email thất bại",
        description: error.message || "Đã xảy ra lỗi khi gửi email đặt lại mật khẩu",
        variant: "destructive",
      });
    },
  });
} 