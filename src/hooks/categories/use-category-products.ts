"use client";

import { useQuery } from "@tanstack/react-query";
import { getCategoryProducts } from "@/actions/categories/get-category-products";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { PaginationParams } from "@/types/custom.types";

type CategoryProductFilters = {
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  tags?: string[];
  isFeatured?: boolean;
  inStock?: boolean;
  sortBy?: "name" | "price" | "created_at";
  sortOrder?: "asc" | "desc";
};

type CategoryProductsParams = {
  categoryId: number;
  pagination?: PaginationParams;
  filters?: CategoryProductFilters;
};

export function useCategoryProducts({ categoryId, pagination, filters }: CategoryProductsParams) {
  return useQuery({
    queryKey: QUERY_KEYS.categories.products(categoryId.toString()),
    queryFn: () => getCategoryProducts({ 
      categoryId, 
      pagination, 
      filters: filters ? {
        ...filters,
        sortBy: filters.sortBy || "created_at",
        sortOrder: filters.sortOrder || "desc"
      } : undefined 
    }),
    enabled: !!categoryId && categoryId > 0,
    retry: (failureCount: number, error: Error) => {
      // Don't retry on validation or not found errors
      if (
        error.message.includes("validation") || 
        error.message.includes("không hợp lệ") ||
        error.message.includes("Không tìm thấy")
      ) {
        return false;
      }
      return failureCount < 3;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes for category products
  });
} 