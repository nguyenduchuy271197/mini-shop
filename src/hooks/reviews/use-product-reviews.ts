"use client";

import { useQuery } from "@tanstack/react-query";
import { getProductReviews } from "@/actions/reviews/get-product-reviews";
import { QUERY_KEYS } from "@/lib/query-keys";
import { Review, Profile } from "@/types/custom.types";

interface ProductReviewsParams {
  productId: number;
  page?: number;
  limit?: number;
  sortBy?: "newest" | "oldest" | "rating_high" | "rating_low" | "helpful";
  onlyApproved?: boolean;
}

type ReviewWithProfile = Review & {
  profiles: Pick<Profile, "id" | "full_name" | "avatar_url"> | null;
};

interface ProductReviewsResponse {
  success: true;
  reviews: ReviewWithProfile[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  summary: {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Record<string, number>;
  };
}

interface UseProductReviewsOptions {
  enabled?: boolean;
  staleTime?: number;
  refetchOnWindowFocus?: boolean;
}

export function useProductReviews(
  params: ProductReviewsParams,
  options: UseProductReviewsOptions = {}
) {
  return useQuery({
    queryKey: QUERY_KEYS.reviews.productReviews(params.productId),
    queryFn: async () => {
      const result = await getProductReviews({
        productId: params.productId,
        page: params.page || 1,
        limit: params.limit || 10,
        sortBy: params.sortBy || "newest",
        onlyApproved: params.onlyApproved ?? true,
      });
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result as ProductReviewsResponse;
    },
    enabled: options.enabled !== false && params.productId > 0,
    staleTime: options.staleTime ?? 1000 * 60 * 10, // 10 phút
    refetchOnWindowFocus: options.refetchOnWindowFocus ?? false,
  });
}

export type {
  ProductReviewsParams,
  ReviewWithProfile,
  ProductReviewsResponse,
  UseProductReviewsOptions
}; 