"use client";

import { useMutation } from "@tanstack/react-query";
import { changePassword } from "@/actions/auth/change-password";
import { toast } from "@/hooks/use-toast";

export function useChangePassword() {
  return useMutation({
    mutationFn: changePassword,
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Đổi mật khẩu thành công!",
          description: data.message,
        });
      } else {
        toast({
          title: "Đổi mật khẩu thất bại",
          description: data.error,
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Đổi mật khẩu thất bại",
        description: error.message || "Đã xảy ra lỗi khi đổi mật khẩu",
        variant: "destructive",
      });
    },
  });
} 