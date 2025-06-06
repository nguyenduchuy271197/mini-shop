"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateReview } from "@/actions/reviews/update-review";
import { QUERY_KEYS } from "@/lib/query-keys";
import { Review } from "@/types/custom.types";

interface UpdateReviewData {
  reviewId: number;
  rating?: number;
  title?: string;
  comment?: string;
}

interface UpdateReviewResponse {
  success: true;
  message: string;
  review: Review;
}

interface UseUpdateReviewOptions {
  onSuccess?: (result: UpdateReviewResponse) => void;
  onError?: (error: string) => void;
}

export function useUpdateReview(options: UseUpdateReviewOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateReviewData) => {
      const result = await updateReview(data);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result as UpdateReviewResponse;
    },
    onSuccess: (result) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.reviews.productReviews(result.review.product_id)
      });
      
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.reviews.userReviews()
      });
      
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.reviews.summary(result.review.product_id)
      });
      
      options.onSuccess?.(result);
    },
    onError: (error: Error) => {
      options.onError?.(error.message);
    },
  });
}

export type {
  UpdateReviewData,
  UpdateReviewResponse,
  UseUpdateReviewOptions
}; 