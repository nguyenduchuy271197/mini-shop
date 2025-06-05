"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import { getCoupons } from "@/actions/admin/coupons/get-coupons";
import { Coupon, PaginationParams } from "@/types/custom.types";

interface UseAdminCouponsParams {
  pagination?: PaginationParams;
}

interface AdminCouponsResponse {
  success: true;
  coupons: Coupon[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function useAdminCoupons(params: UseAdminCouponsParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.coupons.list(params),
    queryFn: async () => {
      const result = await getCoupons(params.pagination);

      if (!result.success) {
        throw new Error(result.error);
      }

      return result as AdminCouponsResponse;
    },
    retry: (failureCount, error) => {
      // Don't retry on authorization errors
      if (error.message.includes("chưa được xác thực") || 
          error.message.includes("Chỉ admin")) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}

export type { 
  UseAdminCouponsParams, 
  AdminCouponsResponse 
}; 