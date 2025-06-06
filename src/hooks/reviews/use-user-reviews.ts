"use client";

import { useQuery } from "@tanstack/react-query";
import { getUserReviews } from "@/actions/reviews/get-user-reviews";
import { QUERY_KEYS } from "@/lib/query-keys";
import { Review, Product } from "@/types/custom.types";

interface UserReviewsParams {
  userId?: string;
  page?: number;
  limit?: number;
  sortBy?: "newest" | "oldest" | "rating_high" | "rating_low";
}

type ReviewWithProduct = Review & {
  products: Pick<Product, "id" | "name" | "slug" | "images"> | null;
};

interface UserReviewsResponse {
  success: true;
  reviews: ReviewWithProduct[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface UseUserReviewsOptions {
  enabled?: boolean;
  staleTime?: number;
  refetchOnWindowFocus?: boolean;
}

export function useUserReviews(
  params: UserReviewsParams = {},
  options: UseUserReviewsOptions = {}
) {
  return useQuery({
    queryKey: QUERY_KEYS.reviews.userReviews(params.userId),
    queryFn: async () => {
      const result = await getUserReviews({
        userId: params.userId,
        page: params.page || 1,
        limit: params.limit || 10,
        sortBy: params.sortBy || "newest",
      });
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result as UserReviewsResponse;
    },
    enabled: options.enabled !== false,
    staleTime: options.staleTime ?? 1000 * 60 * 5, // 5 phút
    refetchOnWindowFocus: options.refetchOnWindowFocus ?? false,
  });
}

export type {
  UserReviewsParams,
  ReviewWithProduct,
  UserReviewsResponse,
  UseUserReviewsOptions
}; 