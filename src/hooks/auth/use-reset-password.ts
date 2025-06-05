"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { resetPassword, verifyResetToken } from "@/actions/auth/reset-password";
import { toast } from "@/hooks/use-toast";
import { QUERY_KEYS } from "@/lib/query-keys";
import { useRouter } from "next/navigation";

export function useResetPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: resetPassword,
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Đặt lại mật khẩu thành công!",
          description: data.message,
        });
        
        // Redirect to login page
        router.push("/auth/login?message=password-reset-success");
      } else {
        toast({
          title: "Đặt lại mật khẩu thất bại",
          description: data.error,
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Đặt lại mật khẩu thất bại",
        description: error.message || "Đã xảy ra lỗi khi đặt lại mật khẩu",
        variant: "destructive",
      });
    },
  });
}

export function useVerifyResetToken() {
  return useQuery({
    queryKey: QUERY_KEYS.auth.resetTokenStatus(),
    queryFn: verifyResetToken,
    retry: false,
    refetchOnWindowFocus: false,
  });
} 