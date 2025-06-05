"use client";

import { useQuery } from "@tanstack/react-query";
import { getCategoryBySlug } from "@/actions/categories/get-category-by-slug";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useCategoryBySlug(slug: string) {
  return useQuery({
    queryKey: QUERY_KEYS.categories.detail(slug),
    queryFn: () => getCategoryBySlug({ slug }),
    enabled: !!slug && slug.length > 0,
    retry: (failureCount: number, error: Error) => {
      // Don't retry on "not found" errors
      if (error.message.includes("Không tìm thấy") || error.message.includes("not found")) {
        return false;
      }
      return failureCount < 3;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes for category details
  });
} 