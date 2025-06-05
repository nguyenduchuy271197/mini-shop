"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logoutUser } from "@/actions/auth/logout";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

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
        
        // Clear all query cache to remove user data
        queryClient.clear();
        
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