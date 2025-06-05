"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import { deleteCategory } from "@/actions/admin/categories/delete-category";
import { useToast } from "@/hooks/use-toast";

interface DeleteCategoryData {
  categoryId: number;
  force?: boolean;
}

interface UseDeleteCategoryOptions {
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
}

function isClientError(error: Error): boolean {
  return error.message.includes("không tìm thấy") || 
         error.message.includes("có sản phẩm") ||
         error.message.includes("có danh mục con") ||
         error.message.includes("chuyển sản phẩm") ||
         error.message.includes("xóa hoặc chuyển");
}

export function useDeleteCategory(options: UseDeleteCategoryOptions = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: DeleteCategoryData) => {
      const processedData = {
        ...data,
        force: data.force ?? false,
      };
      
      const result = await deleteCategory(processedData);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result;
    },
    onSuccess: (result, variables) => {
      // Invalidate and refetch admin categories
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.admin.categories.all,
      });

      // Also invalidate public categories
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.categories.all,
      });

      // Remove specific category from cache
      queryClient.removeQueries({
        queryKey: QUERY_KEYS.categories.detail(variables.categoryId.toString()),
      });

      // Invalidate category tree since structure changed
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.categories.tree(),
      });

      // If force delete was used, invalidate products and cart
      if (variables.force) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.products.all,
        });

        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.cart.all,
        });
      }

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
      // Don't retry on client errors (has dependencies, not found, etc.)
      if (isClientError(error as Error)) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export type { DeleteCategoryData, UseDeleteCategoryOptions }; 