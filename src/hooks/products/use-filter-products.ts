"use client";

import { useQuery } from "@tanstack/react-query";
import { filterProducts } from "@/actions/products/filter-products";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { ProductFilters } from "@/types/custom.types";

type ExtendedProductFilters = ProductFilters & {
  priceRange?: "under-100000" | "100000-500000" | "500000-1000000" | "over-1000000";
};

export function useFilterProducts(filters: ExtendedProductFilters) {
  // Ensure isActive defaults to true and add required fields for action
  const processedFilters = {
    isActive: true,
    ...filters,
  };
  
  return useQuery({
    queryKey: QUERY_KEYS.products.filter(filters),
    queryFn: () => filterProducts(processedFilters),
    enabled: !!filters && Object.keys(filters).length > 0,
    retry: (failureCount: number, error: Error) => {
      // Don't retry on validation errors
      if (error.message.includes("validation") || error.message.includes("không hợp lệ")) {
        return false;
      }
      return failureCount < 3;
    },
    staleTime: 1000 * 60 * 3, // 3 minutes for filtered results
  });
} 