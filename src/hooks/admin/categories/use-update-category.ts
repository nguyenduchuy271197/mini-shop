"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import { updateCategory } from "@/actions/admin/categories/update-category";
import { useToast } from "@/hooks/use-toast";
import { Category } from "@/types/custom.types";

interface UpdateCategoryData {
  categoryId: number;
  name?: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
}

interface UseUpdateCategoryOptions {
  onSuccess?: (result: { category: Category; message: string }) => void;
  onError?: (error: string) => void;
}

function isClientError(error: Error): boolean {
  return error.message.includes("đã được sử dụng") || 
         error.message.includes("không hợp lệ") ||
         error.message.includes("không tìm thấy") ||
         error.message.includes("tối đa") ||
         error.message.includes("ít nhất") ||
         error.message.includes("sản phẩm đang hoạt động") ||
         error.message.includes("không có thông tin nào để cập nhật");
}

export function useUpdateCategory(options: UseUpdateCategoryOptions = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateCategoryData) => {
      const result = await updateCategory(data);
      
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

      // Invalidate specific category detail
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.categories.detail(result.category.slug),
      });

      // Invalidate products that belong to this category
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.categories.products(result.category.slug),
      });

      // Invalidate category tree if structure changed
      if (variables.sortOrder !== undefined) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.categories.tree(),
        });
      }

      toast({
        title: "Thành công",
        description: result.message,
      });

      options.onSuccess?.({
        category: result.category,
        message: result.message,
      });
    },
    onError: (error: Error) => {
      const isClientErr = isClientError(error);
      
      toast({
        title: isClientErr ? "Không thể cập nhật" : "Lỗi hệ thống",
        description: error.message,
        variant: "destructive",
      });

      options.onError?.(error.message);
    },
    retry: (failureCount, error) => {
      // Don't retry on client errors (validation, business logic constraints)
      if (isClientError(error as Error)) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export type { UpdateCategoryData, UseUpdateCategoryOptions }; 