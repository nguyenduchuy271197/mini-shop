"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logoutUser } from "@/actions/auth/logout";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: logoutUser,
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Đăng xuất thành công!",
          description: data.message,
        });
        
        // Invalidate and remove auth-related queries specifically
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auth.profile() });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auth.profileWithRoles() });
        queryClient.removeQueries({ queryKey: QUERY_KEYS.auth.profile() });
        queryClient.removeQueries({ queryKey: QUERY_KEYS.auth.profileWithRoles() });
        
        // Clear cart data as well since it's user-specific
        queryClient.invalidateQueries({ queryKey: ['cart'] });
        queryClient.removeQueries({ queryKey: ['cart'] });
        
        // Redirect to login page
        router.push("/auth/login");
      } else {
        toast({
          title: "Đăng xuất thất bại",
          description: data.error,
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Đăng xuất thất bại",
        description: error.message || "Đã xảy ra lỗi khi đăng xuất",
        variant: "destructive",
      });
    },
  });
} 