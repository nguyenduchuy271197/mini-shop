"use client";

import { useQuery } from "@tanstack/react-query";
import { getCategoryTree } from "@/actions/categories/get-category-tree";
import { QUERY_KEYS } from "@/lib/query-keys";

type CategoryTreeParams = {
  includeProductCount?: boolean;
  includeInactive?: boolean;
};

export function useCategoryTree(params?: CategoryTreeParams) {
  return useQuery({
    queryKey: QUERY_KEYS.categories.tree(),
    queryFn: () => getCategoryTree(params ? { includeProductCount: params.includeProductCount || false, includeInactive: params.includeInactive || false } : undefined),
    retry: (failureCount: number, error: Error) => {
      // Don't retry on validation errors
      if (error.message.includes("validation") || error.message.includes("không hợp lệ")) {
        return false;
      }
      return failureCount < 3;
    },
    staleTime: 1000 * 60 * 20, // 20 minutes for category tree (very stable data)
  });
} 