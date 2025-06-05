"use client";

import { useQuery } from "@tanstack/react-query";
import { getFeaturedProducts } from "@/actions/products/get-featured-products";
import { QUERY_KEYS } from "@/lib/query-keys";

type FeaturedProductsParams = {
  limit?: number;
};

export function useFeaturedProducts(params?: FeaturedProductsParams) {
  return useQuery({
    queryKey: QUERY_KEYS.products.featured(),
    queryFn: () => getFeaturedProducts(params ? { limit: params.limit || 12 } : undefined),
    retry: (failureCount: number, error: Error) => {
      // Don't retry on validation errors
      if (error.message.includes("validation") || error.message.includes("không hợp lệ")) {
        return false;
      }
      return failureCount < 3;
    },
    staleTime: 1000 * 60 * 15, // 15 minutes for featured products (they don't change often)
  });
} 