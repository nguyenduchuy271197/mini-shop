"use client";

import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/actions/categories/get-categories";
import { QUERY_KEYS } from "@/lib/query-keys";

type CategoriesParams = {
  includeProductCount?: boolean;
};

export function useCategories(params?: CategoriesParams) {
  return useQuery({
    queryKey: QUERY_KEYS.categories.list(),
    queryFn: () => getCategories(params ? { includeProductCount: params.includeProductCount || false } : undefined),
    retry: (failureCount: number, error: Error) => {
      // Don't retry on validation errors
      if (error.message.includes("validation") || error.message.includes("không hợp lệ")) {
        return false;
      }
      return failureCount < 3;
    },
    staleTime: 1000 * 60 * 15, // 15 minutes for categories (they don't change often)
  });
} 