"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import { toggleProductStatus } from "@/actions/admin/products/toggle-product-status";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@/types/custom.types";

interface ToggleProductStatusData {
  productId: number;
  isActive: boolean;
}

interface UseToggleProductStatusOptions {
  onSuccess?: (product: Product) => void;
  onError?: (error: string) => void;
}

function isClientError(error: Error): boolean {
  return error.message.includes("không tìm thấy") || 
         error.message.includes("đã được kích hoạt") ||
         error.message.includes("đã bị vô hiệu hóa") ||
         error.message.includes("đang chờ xử lý");
}

export function useToggleProductStatus(options: UseToggleProductStatusOptions = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ToggleProductStatusData) => {
      const result = await toggleProductStatus(data);
      
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

      // Also invalidate public products since status affects visibility
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

      options.onSuccess?.(result.product);
    },
    onError: (error: Error) => {
      const isClientErr = isClientError(error);
      
      toast({
        title: isClientErr ? "Không thể thay đổi" : "Lỗi hệ thống",
        description: error.message,
        variant: "destructive",
      });

      options.onError?.(error.message);
    },
    retry: (failureCount, error) => {
      // Don't retry on client errors (already in desired state, business constraints)
      if (isClientError(error as Error)) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export type { ToggleProductStatusData, UseToggleProductStatusOptions }; 