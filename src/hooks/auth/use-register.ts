"use client";

import { useMutation } from "@tanstack/react-query";
import { registerUser } from "@/actions/auth/register";
import { toast } from "@/hooks/use-toast";

export function useRegister() {
  return useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Đăng ký thành công!",
          description: data.message,
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Đăng ký thất bại",
        description: error.message || "Đã xảy ra lỗi khi đăng ký",
        variant: "destructive",
      });
    },
  });
} 