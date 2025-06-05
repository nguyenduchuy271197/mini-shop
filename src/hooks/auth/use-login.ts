"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { loginUser } from "@/actions/auth/login";
import { toast } from "@/hooks/use-toast";
import { QUERY_KEYS } from "@/lib/query-keys";
import { useRouter } from "next/navigation";

export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Đăng nhập thành công!",
          description: data.message,
        });
        
        // Invalidate auth-related queries
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auth.all });
        
        // Redirect to appropriate page
        if (data.redirectTo) {
          router.push(data.redirectTo);
        }
      } else {
        toast({
          title: "Đăng nhập thất bại",
          description: data.error,
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Đăng nhập thất bại",
        description: error.message || "Đã xảy ra lỗi khi đăng nhập",
        variant: "destructive",
      });
    },
  });
} 