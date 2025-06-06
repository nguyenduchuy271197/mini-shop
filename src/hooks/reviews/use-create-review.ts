"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createReview } from "@/actions/reviews/create-review";
import { QUERY_KEYS } from "@/lib/query-keys";
import { Review } from "@/types/custom.types";

interface CreateReviewData {
  productId: number;
  orderId?: number;
  rating: number;
  title?: string;
  comment: string;
}

interface CreateReviewResponse {
  success: true;
  message: string;
  review: Review;
}

interface UseCreateReviewOptions {
  onSuccess?: (result: CreateReviewResponse) => void;
  onError?: (error: string) => void;
}

export function useCreateReview(options: UseCreateReviewOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateReviewData) => {
      const result = await createReview(data);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result as CreateReviewResponse;
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
  CreateReviewData,
  CreateReviewResponse,
  UseCreateReviewOptions
}; 