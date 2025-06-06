"use client";

import { useQuery } from "@tanstack/react-query";
import { getProductReviewSummary } from "@/actions/reviews/get-review-summary";
import { QUERY_KEYS } from "@/lib/query-keys";

interface ReviewSummaryResponse {
  success: true;
  summary: {
    productId: number;
    averageRating: number;
    totalReviews: number;
    approvedReviews: number;
    pendingReviews: number;
    ratingDistribution: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    };
    percentageDistribution: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    };
    verifiedPurchases: number;
    helpfulVotes: number;
    latestReviews: Array<{
      id: number;
      rating: number;
      title: string | null;
      comment: string | null;
      created_at: string;
      is_verified: boolean;
      user_name: string;
    }>;
  };
}

interface UseReviewSummaryOptions {
  enabled?: boolean;
  staleTime?: number;
  refetchOnWindowFocus?: boolean;
}

export function useReviewSummary(
  productId: number,
  options: UseReviewSummaryOptions = {}
) {
  return useQuery({
    queryKey: QUERY_KEYS.reviews.summary(productId),
    queryFn: async () => {
      const result = await getProductReviewSummary({ productId });
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result as ReviewSummaryResponse;
    },
    enabled: options.enabled !== false && productId > 0,
    staleTime: options.staleTime ?? 1000 * 60 * 15, // 15 phút
    refetchOnWindowFocus: options.refetchOnWindowFocus ?? false,
  });
}

export type {
  ReviewSummaryResponse,
  UseReviewSummaryOptions
}; 