"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import { reorderCategories } from "@/actions/admin/categories/reorder-categories";
import { useToast } from "@/hooks/use-toast";
import { Category } from "@/types/custom.types";

interface CategoryOrder {
  categoryId: number;
  sortOrder: number;
  parentId?: number;
}

interface ReorderCategoriesData {
  categoryOrders: CategoryOrder[];
}

interface UseReorderCategoriesOptions {
  onSuccess?: (result: { updatedCategories: Category[]; message: string }) => void;
  onError?: (error: string) => void;
}

function isClientError(error: Error): boolean {
  return error.message.includes("không hợp lệ") || 
         error.message.includes("không tìm thấy") ||
         error.message.includes("bị trùng lặp") ||
         error.message.includes("không thể là cha của chính nó") ||
         error.message.includes("đã bị vô hiệu hóa") ||
         error.message.includes("ít nhất một danh mục");
}

export function useReorderCategories(options: UseReorderCategoriesOptions = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ReorderCategoriesData) => {
      const result = await reorderCategories(data);
      
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

      // Invalidate category tree since order changed
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.categories.tree(),
      });

      // Invalidate specific categories that were updated
      result.updatedCategories.forEach(category => {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.categories.detail(category.slug),
        });
      });

      // If any parent changes occurred, invalidate parent-child relationships
      const hasParentChanges = variables.categoryOrders.some(order => order.parentId !== undefined);
      if (hasParentChanges) {
        // Get unique parent IDs that were affected
        const parentIds = new Set(
          variables.categoryOrders
            .filter(order => order.parentId !== undefined)
            .map(order => order.parentId!)
        );

        parentIds.forEach(parentId => {
          queryClient.invalidateQueries({
            queryKey: QUERY_KEYS.categories.detail(`parent-${parentId}`),
          });
        });
      }

      toast({
        title: "Thành công",
        description: result.message,
      });

      options.onSuccess?.({
        updatedCategories: result.updatedCategories,
        message: result.message,
      });
    },
    onError: (error: Error) => {
      const isClientErr = isClientError(error);
      
      toast({
        title: isClientErr ? "Lỗi sắp xếp" : "Lỗi hệ thống",
        description: error.message,
        variant: "destructive",
      });

      options.onError?.(error.message);
    },
    retry: (failureCount, error) => {
      // Don't retry on client errors (validation, circular reference, duplicates)
      if (isClientError(error as Error)) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export type { ReorderCategoriesData, CategoryOrder, UseReorderCategoriesOptions }; 