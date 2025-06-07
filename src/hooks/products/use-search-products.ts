"use client";

import { useQuery } from "@tanstack/react-query";
import { searchProducts } from "@/actions/products/search-products";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { PaginationParams } from "@/types/custom.types";

type SearchFilters = {
  categoryId?: number;
  categoryIds?: number[];
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  tags?: string[];
  inStock?: boolean;
};

type SearchProductsParams = {
  query: string;
  filters?: SearchFilters;
  pagination?: PaginationParams;
};

export function useSearchProducts({ query, filters, pagination }: SearchProductsParams) {
  return useQuery({
    queryKey: QUERY_KEYS.products.search(query),
    queryFn: () => searchProducts({ query, filters, pagination }),
    enabled: !!query && query.length > 0,
    retry: (failureCount: number, error: Error) => {
      // Don't retry on validation errors
      if (error.message.includes("validation") || error.message.includes("không hợp lệ")) {
        return false;
      }
      return failureCount < 3;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes for search results
  });
} 