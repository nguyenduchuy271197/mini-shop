"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import { deleteProduct } from "@/actions/admin/products/delete-product";
import { useToast } from "@/hooks/use-toast";

interface DeleteProductData {
  productId: number;
  force?: boolean;
}

interface UseDeleteProductOptions {
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
}

function isClientError(error: Error): boolean {
  return error.message.includes("không thể xóa") || 
         error.message.includes("không tìm thấy") ||
         error.message.includes("có đơn hàng") ||
         error.message.includes("trong giỏ hàng");
}

export function useDeleteProduct(options: UseDeleteProductOptions = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: DeleteProductData) => {
      const processedData = {
        ...data,
        force: data.force ?? false,
      };
      
      const result = await deleteProduct(processedData);
      
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

      // Remove specific product from cache
      queryClient.removeQueries({
        queryKey: QUERY_KEYS.products.detail(variables.productId),
      });

      // Invalidate cart and wishlist since product might be in them
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.cart.all,
      });

      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.wishlist.all,
      });

      toast({
        title: "Thành công",
        description: result.message,
      });

      options.onSuccess?.(result.message);
    },
    onError: (error: Error) => {
      const isClientErr = isClientError(error);
      
      toast({
        title: isClientErr ? "Không thể xóa" : "Lỗi hệ thống",
        description: error.message,
        variant: "destructive",
      });

      options.onError?.(error.message);
    },
    retry: (failureCount, error) => {
      // Don't retry on client errors (business logic constraints)
      if (isClientError(error as Error)) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export type { DeleteProductData, UseDeleteProductOptions }; 