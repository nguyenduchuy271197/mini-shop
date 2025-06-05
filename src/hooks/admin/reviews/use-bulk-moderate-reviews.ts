"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bulkModerateReviews } from "@/actions/admin/reviews/bulk-moderate-reviews";
import { useToast } from "@/hooks/use-toast";
import { QUERY_KEYS } from "@/lib/query-keys";

interface BulkModerateReviewsData {
  reviewIds: number[];
  action: "approve" | "reject";
  reason?: string;
}

interface BulkModerationResults {
  successful: number;
  failed: number;
  total: number;
  errors: string[];
}

interface BulkModerateReviewsResponse {
  success: true;
  message: string;
  results: BulkModerationResults;
}

interface UseBulkModerateReviewsOptions {
  onSuccess?: (result: BulkModerateReviewsResponse) => void;
  onError?: (error: string) => void;
}

function isClientError(error: Error): boolean {
  return error.message.includes("Phải chọn ít nhất một đánh giá") ||
         error.message.includes("Hành động phải là") ||
         error.message.includes("chưa được xác thực") ||
         error.message.includes("Chỉ admin");
}

export function useBulkModerateReviews(options: UseBulkModerateReviewsOptions = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BulkModerateReviewsData) => {
      const result = await bulkModerateReviews(
        data.reviewIds,
        data.action,
        data.reason
      );

      if (!result.success) {
        throw new Error(result.error);
      }

      return result as BulkModerateReviewsResponse;
    },
    onSuccess: (result) => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.admin.reviews.all 
      });

      // Also invalidate all product reviews since multiple products might be affected
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.reviews.all
      });

      const { successful, failed, errors } = result.results;

      // Show success toast with details
      if (failed === 0) {
        toast({
          title: "Thành công",
          description: result.message,
        });
      } else if (successful > 0) {
        toast({
          title: "Hoàn thành một phần",
          description: `${result.message}. ${failed} đánh giá thất bại.`,
          variant: "default",
        });
        
        // Show additional toast with error details if there are errors
        if (errors.length > 0) {
          const errorSample = errors.slice(0, 3).join(", ");
          const moreErrors = errors.length > 3 ? ` và ${errors.length - 3} lỗi khác` : "";
          
          toast({
            title: "Chi tiết lỗi",
            description: `${errorSample}${moreErrors}`,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Thất bại",
          description: `Không thể xử lý đánh giá nào. ${result.message}`,
          variant: "destructive",
        });
      }

      options.onSuccess?.(result);
    },
    onError: (error: Error) => {
      const isClientErr = isClientError(error);
      
      toast({
        title: isClientErr ? "Không thể xử lý" : "Lỗi hệ thống",
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
  BulkModerateReviewsData, 
  BulkModerationResults, 
  BulkModerateReviewsResponse,
  UseBulkModerateReviewsOptions 
}; 