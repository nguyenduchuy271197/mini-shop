"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import { uploadCategoryImage } from "@/actions/admin/categories/upload-category-image";
import { useToast } from "@/hooks/use-toast";
import { Category } from "@/types/custom.types";

interface UploadCategoryImageData {
  categoryId: number;
  imageUrl: string;
  replaceExisting?: boolean;
}

interface UseUploadCategoryImageOptions {
  onSuccess?: (result: { category: Category; imageUrl: string; message: string }) => void;
  onError?: (error: string) => void;
}

function isClientError(error: Error): boolean {
  return error.message.includes("không hợp lệ") || 
         error.message.includes("không tìm thấy") ||
         error.message.includes("đã có hình ảnh") ||
         error.message.includes("sử dụng tùy chọn thay thế");
}

export function useUploadCategoryImage(options: UseUploadCategoryImageOptions = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UploadCategoryImageData) => {
      const processedData = {
        ...data,
        replaceExisting: data.replaceExisting ?? true,
      };
      
      const result = await uploadCategoryImage(processedData);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result;
    },
    onSuccess: (result) => {
      // Invalidate and refetch admin categories
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.admin.categories.all,
      });

      // Also invalidate public categories
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.categories.all,
      });

      // Invalidate specific category detail
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.categories.detail(result.category.slug),
      });

      // Update specific category in cache if possible
      queryClient.setQueryData(
        QUERY_KEYS.categories.detail(result.category.slug),
        result.category
      );

      // Invalidate category tree to update image in navigation
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.categories.tree(),
      });

      toast({
        title: "Thành công",
        description: result.message,
      });

      options.onSuccess?.({
        category: result.category,
        imageUrl: result.imageUrl,
        message: result.message,
      });
    },
    onError: (error: Error) => {
      const isClientErr = isClientError(error);
      
      toast({
        title: isClientErr ? "Lỗi tải ảnh" : "Lỗi hệ thống",
        description: error.message,
        variant: "destructive",
      });

      options.onError?.(error.message);
    },
    retry: (failureCount, error) => {
      // Don't retry on client errors (validation, category not found, etc.)
      if (isClientError(error as Error)) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export type { UploadCategoryImageData, UseUploadCategoryImageOptions }; 