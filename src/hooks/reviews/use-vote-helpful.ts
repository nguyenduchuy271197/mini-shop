"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { voteReviewHelpful } from "@/actions/reviews/vote-helpful";
import { QUERY_KEYS } from "@/lib/query-keys";

interface VoteHelpfulData {
  reviewId: number;
  helpful?: boolean;
}

interface VoteHelpfulResponse {
  success: true;
  message: string;
  helpfulCount: number;
}

interface UseVoteHelpfulOptions {
  onSuccess?: (result: VoteHelpfulResponse) => void;
  onError?: (error: string) => void;
}

export function useVoteHelpful(options: UseVoteHelpfulOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: VoteHelpfulData) => {
      const result = await voteReviewHelpful({
        reviewId: data.reviewId,
        helpful: data.helpful ?? true
      });
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result as VoteHelpfulResponse;
    },
    onSuccess: (result) => {
      // Invalidate relevant queries - we need to invalidate all product reviews
      // since we don't have product_id in the response
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.reviews.all
      });
      
      options.onSuccess?.(result);
    },
    onError: (error: Error) => {
      options.onError?.(error.message);
    },
  });
}

export type {
  VoteHelpfulData,
  VoteHelpfulResponse,
  UseVoteHelpfulOptions
}; 