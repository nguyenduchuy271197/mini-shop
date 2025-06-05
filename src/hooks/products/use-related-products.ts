"use client";

import { useQuery } from "@tanstack/react-query";
import { getRelatedProducts } from "@/actions/products/get-related-products";
import { QUERY_KEYS } from "@/lib/query-keys";

type RelatedProductsParams = {
  productId: number;
  limit?: number;
};

export function useRelatedProducts({ productId, limit }: RelatedProductsParams) {
  return useQuery({
    queryKey: QUERY_KEYS.products.related(productId),
    queryFn: () => getRelatedProducts({ productId, limit: limit || 8 }),
    enabled: !!productId && productId > 0,
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
    staleTime: 1000 * 60 * 10, // 10 minutes for related products
  });
} 