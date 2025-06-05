"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import { createCategory } from "@/actions/admin/categories/create-category";
import { useToast } from "@/hooks/use-toast";
import { Category } from "@/types/custom.types";

interface CreateCategoryData {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: number;
  sortOrder?: number;
  isActive?: boolean;
}

interface UseCreateCategoryOptions {
  onSuccess?: (result: { category: Category; message: string }) => void;
  onError?: (error: string) => void;
}

function isClientError(error: Error): boolean {
  return error.message.includes("đã được sử dụng") || 
         error.message.includes("không hợp lệ") ||
         error.message.includes("ít nhất") ||
         error.message.includes("tối đa") ||
         error.message.includes("không tìm thấy danh mục cha") ||
         error.message.includes("đã bị vô hiệu hóa");
}

export function useCreateCategory(options: UseCreateCategoryOptions = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCategoryData) => {
      const processedData = {
        ...data,
        sortOrder: data.sortOrder ?? 0,
        isActive: data.isActive ?? true,
      };
      
      const result = await createCategory(processedData);
      
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

      // If category has parent, invalidate parent's children
      if (variables.parentId) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.categories.detail(`parent-${variables.parentId}`),
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
        title: isClientErr ? "Lỗi dữ liệu" : "Lỗi hệ thống",
        description: error.message,
        variant: "destructive",
      });

      options.onError?.(error.message);
    },
    retry: (failureCount, error) => {
      // Don't retry on client errors (validation, duplicate slug/name, etc.)
      if (isClientError(error as Error)) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export type { CreateCategoryData, UseCreateCategoryOptions }; 