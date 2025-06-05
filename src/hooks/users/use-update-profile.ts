"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserProfile } from "@/actions/users/update-profile";
import { toast } from "@/hooks/use-toast";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Cập nhật thành công!",
          description: data.message,
        });
        
        // Invalidate profile-related queries
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auth.all });
        
        // Optionally set the updated profile data directly to cache
        queryClient.setQueryData(QUERY_KEYS.auth.profile(), {
          success: true,
          profile: data.profile,
        });
      } else {
        toast({
          title: "Cập nhật thất bại",
          description: data.error,
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Cập nhật thất bại",
        description: error.message || "Đã xảy ra lỗi khi cập nhật thông tin",
        variant: "destructive",
      });
    },
  });
} 