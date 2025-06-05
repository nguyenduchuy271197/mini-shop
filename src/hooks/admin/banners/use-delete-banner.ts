"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteBanner } from "@/actions/admin/banners/delete-banner";
import { useToast } from "@/hooks/use-toast";
import { QUERY_KEYS } from "@/lib/query-keys";

interface DeleteBannerData {
  bannerId: number;
}

interface DeleteBannerResponse {
  success: true;
  message: string;
}

interface UseDeleteBannerOptions {
  onSuccess?: (result: DeleteBannerResponse) => void;
  onError?: (error: string) => void;
}

function isClientError(error: Error): boolean {
  return error.message.includes("ID banner không hợp lệ") ||
         error.message.includes("Banner không tồn tại") ||
         error.message.includes("chưa được xác thực") ||
         error.message.includes("Chỉ admin");
}

export function useDeleteBanner(options: UseDeleteBannerOptions = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: DeleteBannerData) => {
      const result = await deleteBanner(data.bannerId);

      if (!result.success) {
        throw new Error(result.error);
      }

      return result as DeleteBannerResponse;
    },
    onSuccess: (result) => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.admin.banners.all 
      });

      // Show success toast with warning style since this is a deletion
      toast({
        title: "Xóa banner thành công",
        description: result.message,
        variant: "default", // Not destructive since it's intended action
      });

      options.onSuccess?.(result);
    },
    onError: (error: Error) => {
      const isClientErr = isClientError(error);
      
      toast({
        title: isClientErr ? "Không thể xóa banner" : "Lỗi hệ thống",
        description: error.message,
        variant: "destructive",
      });

      options.onError?.(error.message);
    },
    retry: (failureCount, error) => {
      // Don't retry on client errors (authorization, validation, etc.)
      if (isClientError(error as Error)) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export type { 
  DeleteBannerData, 
  DeleteBannerResponse,
  UseDeleteBannerOptions 
}; 