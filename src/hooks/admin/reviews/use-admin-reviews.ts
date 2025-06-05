"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import { getAllReviews } from "@/actions/admin/reviews/get-all-reviews";
import { PaginationParams } from "@/types/custom.types";

interface ReviewFilters {
  rating?: number;
  is_approved?: boolean;
  is_verified?: boolean;
  product_id?: number;
  user_id?: string;
  search?: string;
}

interface UseAdminReviewsParams {
  pagination: PaginationParams;
  filters?: ReviewFilters;
}

interface ReviewWithDetails {
  id: number;
  user_id: string;
  product_id: number;
  order_id: number | null;
  rating: number;
  title: string | null;
  comment: string | null;
  is_verified: boolean;
  is_approved: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
  user: {
    full_name: string;
    email: string;
  } | null;
  product: {
    name: string;
    sku: string | null;
  } | null;
}

interface ReviewStats {
  total: number;
  approved: number;
  pending: number;
  verified: number;
  averageRating: number;
}

interface AdminReviewsResponse {
  success: true;
  reviews: ReviewWithDetails[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: ReviewStats;
}

export function useAdminReviews(params: UseAdminReviewsParams) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.reviews.list(params),
    queryFn: async () => {
      const result = await getAllReviews(params.pagination, params.filters);

      if (!result.success) {
        throw new Error(result.error);
      }

      return result as AdminReviewsResponse;
    },
    enabled: !!params.pagination,
    retry: (failureCount, error) => {
      // Don't retry on authorization errors
      if (error.message.includes("chưa được xác thực") || 
          error.message.includes("Chỉ admin")) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 1000 * 60 * 5, // Reviews don't change frequently, cache for 5 minutes
  });
}

export type { 
  ReviewFilters, 
  UseAdminReviewsParams, 
  ReviewWithDetails, 
  ReviewStats,
  AdminReviewsResponse 
}; 