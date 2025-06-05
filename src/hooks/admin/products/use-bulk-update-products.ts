"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import { bulkUpdateProducts } from "@/actions/admin/products/bulk-update-products";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@/types/custom.types";

interface BulkUpdateData {
  isActive?: boolean;
  isFeatured?: boolean;
  categoryId?: number;
  price?: number;
  comparePrice?: number;
  stockQuantity?: number;
  lowStockThreshold?: number;
  brand?: string;
  tags?: string[];
}

interface BulkUpdateProductsData {
  productIds: number[];
  updates: BulkUpdateData;
}

interface UseBulkUpdateProductsOptions {
  onSuccess?: (result: { updatedCount: number; products: Product[] }) => void;
  onError?: (error: string) => void;
}

function isClientError(error: Error): boolean {
  return error.message.includes("không có thông tin") || 
         error.message.includes("không tìm thấy") ||
         error.message.includes("đang chờ xử lý") ||
         error.message.includes("tồn kho mới") ||
         error.message.includes("không hợp lệ");
}

export function useBulkUpdateProducts(options: UseBulkUpdateProductsOptions = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BulkUpdateProductsData) => {
      const result = await bulkUpdateProducts(data);
      
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

      // Also invalidate public products
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.products.all,
      });

      // Invalidate specific products that were updated
      variables.productIds.forEach(productId => {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.products.detail(productId),
        });
      });

      toast({
        title: "Thành công",
        description: result.message,
      });

      options.onSuccess?.({
        updatedCount: result.updatedCount,
        products: result.products,
      });
    },
    onError: (error: Error) => {
      const isClientErr = isClientError(error);
      
      toast({
        title: isClientErr ? "Lỗi cập nhật" : "Lỗi hệ thống",
        description: error.message,
        variant: "destructive",
      });

      options.onError?.(error.message);
    },
    retry: (failureCount, error) => {
      // Don't retry on client errors (validation, business logic)
      if (isClientError(error as Error)) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export type { BulkUpdateProductsData, BulkUpdateData, UseBulkUpdateProductsOptions }; 