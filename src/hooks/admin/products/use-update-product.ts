"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import { updateProduct } from "@/actions/admin/products/update-product";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@/types/custom.types";

interface UpdateProductData {
  productId: number;
  name?: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  sku?: string;
  price?: number;
  comparePrice?: number;
  costPrice?: number;
  stockQuantity?: number;
  lowStockThreshold?: number;
  categoryId?: number;
  brand?: string;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: "cm" | "m" | "mm";
  };
  images?: string[];
  tags?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
  metaTitle?: string;
  metaDescription?: string;
}

interface UseUpdateProductOptions {
  onSuccess?: (product: Product) => void;
  onError?: (error: string) => void;
}

function isClientError(error: Error): boolean {
  return error.message.includes("validate") || 
         error.message.includes("không hợp lệ") ||
         error.message.includes("không thể");
}

export function useUpdateProduct(options: UseUpdateProductOptions = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProductData) => {
      const processedData = {
        ...data,
        dimensions: data.dimensions ? {
          ...data.dimensions,
          unit: data.dimensions.unit ?? "cm"
        } : undefined,
      };
      
      const result = await updateProduct(processedData);
      
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

      // Update specific product in cache if it exists
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
        title: isClientErr ? "Lỗi dữ liệu" : "Lỗi hệ thống",
        description: error.message,
        variant: "destructive",
      });

      options.onError?.(error.message);
    },
    retry: (failureCount, error) => {
      // Don't retry on client errors (validation, etc.)
      if (isClientError(error as Error)) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export type { UpdateProductData, UseUpdateProductOptions }; 