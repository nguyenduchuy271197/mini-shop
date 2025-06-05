"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { approveReview } from "@/actions/admin/reviews/approve-review";
import { useToast } from "@/hooks/use-toast";
import { QUERY_KEYS } from "@/lib/query-keys";

interface ApproveReviewData {
  reviewId: number;
}

interface ApprovedReview {
  id: number;
  title: string | null;
  comment: string | null;
  rating: number;
  is_approved: boolean;
  is_verified: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
  user_id: string;
  product_id: number;
}

interface ApproveReviewResponse {
  success: true;
  message: string;
  review: ApprovedReview;
}

interface UseApproveReviewOptions {
  onSuccess?: (result: ApproveReviewResponse) => void;
  onError?: (error: string) => void;
}

function isClientError(error: Error): boolean {
  return error.message.includes("ID đánh giá không hợp lệ") ||
         error.message.includes("không tồn tại") ||
         error.message.includes("đã được phê duyệt") ||
         error.message.includes("chưa được xác thực") ||
         error.message.includes("Chỉ admin");
}

export function useApproveReview(options: UseApproveReviewOptions = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ApproveReviewData) => {
      const result = await approveReview(data.reviewId);

      if (!result.success) {
        throw new Error(result.error);
      }

      return result as ApproveReviewResponse;
    },
    onSuccess: (result) => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.admin.reviews.all 
      });

      // Also invalidate product reviews if we track products
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.reviews.productReviews(result.review.product_id)
      });

      // Show success toast
      toast({
        title: "Phê duyệt thành công",
        description: result.message,
      });

      options.onSuccess?.(result);
    },
    onError: (error: Error) => {
      const isClientErr = isClientError(error);
      
      toast({
        title: isClientErr ? "Không thể phê duyệt" : "Lỗi hệ thống",
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
  ApproveReviewData, 
  ApprovedReview, 
  ApproveReviewResponse,
  UseApproveReviewOptions 
}; 