"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteReview } from "@/actions/reviews/delete-review";
import { QUERY_KEYS } from "@/lib/query-keys";

interface DeleteReviewData {
  reviewId: number;
}

interface DeleteReviewResponse {
  success: true;
  message: string;
}

interface UseDeleteReviewOptions {
  onSuccess?: (result: DeleteReviewResponse) => void;
  onError?: (error: string) => void;
}

export function useDeleteReview(options: UseDeleteReviewOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: DeleteReviewData) => {
      const result = await deleteReview({ reviewId: data.reviewId });
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result as DeleteReviewResponse;
    },
    onSuccess: (result) => {
      // Invalidate relevant queries - invalidate all since we don't have product_id
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.reviews.all
      });
      
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.reviews.userReviews()
      });
      
      options.onSuccess?.(result);
    },
    onError: (error: Error) => {
      options.onError?.(error.message);
    },
  });
}

export type {
  DeleteReviewData,
  DeleteReviewResponse,
  UseDeleteReviewOptions
}; 