"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadBannerImage } from "@/actions/admin/banners/upload-banner-image";
import { useToast } from "@/hooks/use-toast";
import { QUERY_KEYS } from "@/lib/query-keys";

interface UploadBannerImageData {
  bannerId: number;
  file: File;
}

interface UploadBannerImageResponse {
  success: true;
  message: string;
  imageUrl: string;
}

interface UseUploadBannerImageOptions {
  onSuccess?: (result: UploadBannerImageResponse) => void;
  onError?: (error: string) => void;
}

function isClientError(error: Error): boolean {
  return error.message.includes("ID banner không hợp lệ") ||
         error.message.includes("Banner không tồn tại") ||
         error.message.includes("Chỉ hỗ trợ file hình ảnh") ||
         error.message.includes("Kích thước file không được vượt quá") ||
         error.message.includes("chưa được xác thực") ||
         error.message.includes("Chỉ admin");
}

export function useUploadBannerImage(options: UseUploadBannerImageOptions = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UploadBannerImageData) => {
      const result = await uploadBannerImage(data.bannerId, data.file);

      if (!result.success) {
        throw new Error(result.error);
      }

      return result as UploadBannerImageResponse;
    },
    onSuccess: (result) => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.admin.banners.all 
      });

      // Show success toast
      toast({
        title: "Upload hình ảnh thành công",
        description: result.message,
      });

      options.onSuccess?.(result);
    },
    onError: (error: Error) => {
      const isClientErr = isClientError(error);
      
      toast({
        title: isClientErr ? "Không thể upload hình ảnh" : "Lỗi hệ thống",
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
  UploadBannerImageData, 
  UploadBannerImageResponse,
  UseUploadBannerImageOptions 
}; 