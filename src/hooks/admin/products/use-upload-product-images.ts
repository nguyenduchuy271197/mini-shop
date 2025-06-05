"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import { uploadProductImages } from "@/actions/admin/products/upload-product-images";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@/types/custom.types";

interface UploadProductImagesData {
  productId: number;
  imageUrls: string[];
  replaceAll?: boolean;
}

interface UseUploadProductImagesOptions {
  onSuccess?: (result: { product: Product; totalImages: number }) => void;
  onError?: (error: string) => void;
}

function isClientError(error: Error): boolean {
  return error.message.includes("không hợp lệ") || 
         error.message.includes("không tìm thấy") ||
         error.message.includes("vượt quá giới hạn") ||
         error.message.includes("không phải định dạng");
}

export function useUploadProductImages(options: UseUploadProductImagesOptions = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UploadProductImagesData) => {
      const processedData = {
        ...data,
        replaceAll: data.replaceAll ?? false,
      };
      
      const result = await uploadProductImages(processedData);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result;
    },
    onSuccess: (result, variables) => {
      // Invalidate and refetch admin products
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.admin.products.all,
      });

      // Also invalidate public products since images affect display
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.products.all,
      });

      // Update specific product in cache
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.products.detail(variables.productId),
      });

      toast({
        title: "Thành công",
        description: result.message,
      });

      options.onSuccess?.({
        product: result.product,
        totalImages: result.totalImages,
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
      // Don't retry on client errors (validation, file format, etc.)
      if (isClientError(error as Error)) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export type { UploadProductImagesData, UseUploadProductImagesOptions }; 