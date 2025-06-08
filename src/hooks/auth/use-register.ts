"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { registerUser } from "@/actions/auth/register";
import { toast } from "@/hooks/use-toast";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Đăng ký thành công!",
          description: data.message,
        });

        // Force refetch profile queries to get new user data immediately
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auth.profile() });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auth.profileWithRoles() });
        queryClient.refetchQueries({ queryKey: QUERY_KEYS.auth.profile() });
        
        // Also invalidate cart since user might have items in cart before registering
        queryClient.invalidateQueries({ queryKey: ['cart'] });
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