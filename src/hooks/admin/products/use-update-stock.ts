"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import { updateProductStock } from "@/actions/admin/products/update-stock";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@/types/custom.types";

interface UpdateStockData {
  productId: number;
  quantity: number;
  operation?: "set" | "add" | "subtract";
  reason?: string;
}

interface UseUpdateStockOptions {
  onSuccess?: (result: { product: Product; previousStock: number; newStock: number }) => void;
  onError?: (error: string) => void;
}

function isClientError(error: Error): boolean {
  return error.message.includes("không thể trừ") || 
         error.message.includes("không tìm thấy") ||
         error.message.includes("tồn kho mới") ||
         error.message.includes("đang trong đơn hàng") ||
         error.message.includes("không hợp lệ");
}

export function useUpdateStock(options: UseUpdateStockOptions = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateStockData) => {
      const processedData = {
        ...data,
        operation: data.operation ?? "set" as const,
      };
      
      const result = await updateProductStock(processedData);
      
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

      // Also invalidate public products since stock affects availability
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.products.all,
      });

      // Update specific product in cache
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.products.detail(variables.productId),
      });

      // Invalidate cart validation since stock levels changed
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.cart.validation(),
      });

      toast({
        title: "Thành công",
        description: result.message,
      });

      options.onSuccess?.({
        product: result.product,
        previousStock: result.previousStock,
        newStock: result.newStock,
      });
    },
    onError: (error: Error) => {
      const isClientErr = isClientError(error);
      
      toast({
        title: isClientErr ? "Lỗi cập nhật tồn kho" : "Lỗi hệ thống",
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

export type { UpdateStockData, UseUpdateStockOptions }; 