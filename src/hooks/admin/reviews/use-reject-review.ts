"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { rejectReview } from "@/actions/admin/reviews/reject-review";
import { useToast } from "@/hooks/use-toast";
import { QUERY_KEYS } from "@/lib/query-keys";

interface RejectReviewData {
  reviewId: number;
  reason?: string;
}

interface RejectedReview {
  id: number;
  title: string | null;
  comment: string | null;
  rating: number;
  is_approved: boolean;
  user_id: string;
  product_id: number;
}

interface RejectReviewResponse {
  success: true;
  message: string;
  review: RejectedReview;
}

interface UseRejectReviewOptions {
  onSuccess?: (result: RejectReviewResponse) => void;
  onError?: (error: string) => void;
}

function isClientError(error: Error): boolean {
  return error.message.includes("ID đánh giá không hợp lệ") ||
         error.message.includes("không tồn tại") ||
         error.message.includes("chưa được xác thực") ||
         error.message.includes("Chỉ admin");
}

export function useRejectReview(options: UseRejectReviewOptions = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RejectReviewData) => {
      const result = await rejectReview(data.reviewId, data.reason);

      if (!result.success) {
        throw new Error(result.error);
      }

      return result as RejectReviewResponse;
    },
    onSuccess: (result) => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.admin.reviews.all 
      });

      // Also invalidate product reviews since review was deleted
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.reviews.productReviews(result.review.product_id)
      });

      // Show success toast with warning style since this is a deletion
      toast({
        title: "Từ chối thành công",
        description: result.message,
        variant: "default", // Not destructive since it's intended action
      });

      options.onSuccess?.(result);
    },
    onError: (error: Error) => {
      const isClientErr = isClientError(error);
      
      toast({
        title: isClientErr ? "Không thể từ chối" : "Lỗi hệ thống",
        description: error.message,
        variant: "destructive",
      });

      options.onError?.(error.message);
    },
    retry: (failureCount, error) => {
      // Don't retry on client errors (authorization, validation, etc.)
      if (isClientError(error as Error)) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export type { 
  RejectReviewData, 
  RejectedReview, 
  RejectReviewResponse,
  UseRejectReviewOptions 
}; 