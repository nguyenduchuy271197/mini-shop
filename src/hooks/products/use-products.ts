"use client";

import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/actions/products/get-products";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { ProductFilters, PaginationParams } from "@/types/custom.types";

type ProductSortOptions = {
  field: "name" | "price" | "created_at" | "stock_quantity";
  order: "asc" | "desc";
};

// Extended filters type to match action requirements
type ExtendedProductFilters = ProductFilters & {
  isActive?: boolean;
};

export function useProducts(
  pagination: PaginationParams,
  filters?: ExtendedProductFilters,
  sortBy?: ProductSortOptions
) {
  // Ensure isActive defaults to true for public queries
  const processedFilters = filters ? { isActive: true, ...filters } : { isActive: true };
  
  return useQuery({
    queryKey: QUERY_KEYS.products.list({ ...pagination, ...processedFilters, ...sortBy }),
    queryFn: () => getProducts(pagination, processedFilters, sortBy),
    enabled: !!pagination.page && !!pagination.limit,
    retry: (failureCount: number, error: Error) => {
      // Don't retry on validation errors (usually 4xx errors)
      if (error.message.includes("validation") || error.message.includes("không hợp lệ")) {
        return false;
      }
      return failureCount < 3;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useProductsList(filters?: ExtendedProductFilters) {
  // Ensure isActive defaults to true for public queries
  const processedFilters = filters ? { isActive: true, ...filters } : { isActive: true };
  
  return useQuery({
    queryKey: QUERY_KEYS.products.lists(),
    queryFn: () => getProducts({ page: 1, limit: 20 }, processedFilters),
    retry: (failureCount: number, error: Error) => {
      if (error.message.includes("validation") || error.message.includes("không hợp lệ")) {
        return false;
      }
      return failureCount < 3;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
} 