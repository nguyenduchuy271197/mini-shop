"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { 
  verifyEmail, 
  resendVerificationEmail,
  checkEmailVerificationStatus 
} from "@/actions/auth/verify-email";
import { toast } from "@/hooks/use-toast";
import { QUERY_KEYS } from "@/lib/query-keys";
import { useRouter } from "next/navigation";

export function useVerifyEmail() {
  const router = useRouter();

  return useMutation({
    mutationFn: verifyEmail,
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Xác thực email thành công!",
          description: data.message,
        });
        
        // Redirect to login page
        router.push("/auth/login?message=email-verified");
      } else {
        toast({
          title: "Xác thực email thất bại",
          description: data.error,
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Xác thực email thất bại",
        description: error.message || "Đã xảy ra lỗi khi xác thực email",
        variant: "destructive",
      });
    },
  });
}

export function useResendVerificationEmail() {
  return useMutation({
    mutationFn: resendVerificationEmail,
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Gửi lại email thành công!",
          description: data.message,
        });
      } else {
        toast({
          title: "Gửi lại email thất bại",
          description: data.error,
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Gửi lại email thất bại",
        description: error.message || "Đã xảy ra lỗi khi gửi lại email xác thực",
        variant: "destructive",
      });
    },
  });
}

export function useEmailVerificationStatus() {
  return useQuery({
    queryKey: QUERY_KEYS.auth.emailVerificationStatus(),
    queryFn: checkEmailVerificationStatus,
    retry: false,
    refetchOnWindowFocus: false,
  });
} 