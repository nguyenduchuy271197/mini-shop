"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  deleteUserAccount, 
  deleteOwnAccount, 
  deactivateUser 
} from "@/actions/users/delete-account";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export function useDeleteUserAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUserAccount,
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Xóa tài khoản thành công!",
          description: data.message,
        });
        
        // Clear all cache as user data is no longer valid
        queryClient.clear();
      } else {
        toast({
          title: "Xóa tài khoản thất bại",
          description: data.error,
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Xóa tài khoản thất bại",
        description: error.message || "Đã xảy ra lỗi khi xóa tài khoản",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteOwnAccount() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: deleteOwnAccount,
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Xóa tài khoản thành công!",
          description: data.message,
        });
        
        // Clear all cache and redirect to login
        queryClient.clear();
        router.push("/auth/login?message=account-deleted");
      } else {
        toast({
          title: "Xóa tài khoản thất bại",
          description: data.error,
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Xóa tài khoản thất bại",
        description: error.message || "Đã xảy ra lỗi khi xóa tài khoản",
        variant: "destructive",
      });
    },
  });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deactivateUser,
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Vô hiệu hóa thành công!",
          description: data.message,
        });
        
        // Invalidate user-related queries
        queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
        queryClient.invalidateQueries({ queryKey: ["auth"] });
      } else {
        toast({
          title: "Vô hiệu hóa thất bại",
          description: data.error,
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Vô hiệu hóa thất bại",
        description: error.message || "Đã xảy ra lỗi khi vô hiệu hóa tài khoản",
        variant: "destructive",
      });
    },
  });
} 