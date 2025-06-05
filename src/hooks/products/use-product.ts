"use client";

import { useQuery } from "@tanstack/react-query";
import { getProductDetails } from "@/actions/products/get-product-details";
import { getProductBySlug } from "@/actions/products/get-product-by-slug";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useProductDetails(productId: number) {
  return useQuery({
    queryKey: QUERY_KEYS.products.detail(productId),
    queryFn: () => getProductDetails({ productId }),
    enabled: !!productId && productId > 0,
    retry: (failureCount: number, error: Error) => {
      // Don't retry on "not found" errors
      if (error.message.includes("Không tìm thấy") || error.message.includes("not found")) {
        return false;
      }
      return failureCount < 3;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes for product details
  });
}

export function useProductBySlug(slug: string) {
  return useQuery({
    queryKey: QUERY_KEYS.products.bySlug(slug),
    queryFn: () => getProductBySlug({ slug }),
    enabled: !!slug && slug.length > 0,
    retry: (failureCount: number, error: Error) => {
      // Don't retry on "not found" errors
      if (error.message.includes("Không tìm thấy") || error.message.includes("not found")) {
        return false;
      }
      return failureCount < 3;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
} 