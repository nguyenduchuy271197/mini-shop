"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadAvatar, deleteAvatar } from "@/actions/users/upload-avatar";
import { toast } from "@/hooks/use-toast";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return uploadAvatar(formData);
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Tải lên thành công!",
          description: data.message,
        });
        
        // Invalidate profile queries to get updated avatar
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auth.all });
      } else {
        toast({
          title: "Tải lên thất bại",
          description: data.error,
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Tải lên thất bại",
        description: error.message || "Đã xảy ra lỗi khi tải lên ảnh đại diện",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAvatar,
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Xóa thành công!",
          description: data.message,
        });
        
        // Invalidate profile queries to get updated avatar
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auth.all });
      } else {
        toast({
          title: "Xóa thất bại",
          description: data.error,
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Xóa thất bại",
        description: error.message || "Đã xảy ra lỗi khi xóa ảnh đại diện",
        variant: "destructive",
      });
    },
  });
} 