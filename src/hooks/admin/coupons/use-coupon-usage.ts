"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import { getCouponUsageReport } from "@/actions/admin/coupons/get-coupon-usage";
import { Coupon } from "@/types/custom.types";

interface UseCouponUsageParams {
  couponId: number;
}

interface CouponUsageReport {
  coupon: Coupon;
  totalUsed: number;
  remainingUses?: number;
  usagePercentage: number;
  recentOrders: Array<{
    id: number;
    order_number: string;
    total_amount: number;
    discount_amount: number;
    created_at: string;
    user_email?: string;
  }>;
  totalRevenueLoss: number;
  totalOrdersWithCoupon: number;
}

interface CouponUsageResponse {
  success: true;
  report: CouponUsageReport;
}

export function useCouponUsage(params: UseCouponUsageParams) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.coupons.usage(params.couponId),
    queryFn: async () => {
      const result = await getCouponUsageReport(params.couponId);

      if (!result.success) {
        throw new Error(result.error);
      }

      return result as CouponUsageResponse;
    },
    retry: (failureCount, error) => {
      // Don't retry on authorization errors
      if (error.message.includes("chưa được xác thực") || 
          error.message.includes("Chỉ admin") ||
          error.message.includes("Coupon không tồn tại")) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes (usage data changes less frequently)
    enabled: !!(params.couponId && params.couponId > 0),
  });
}

export type { 
  UseCouponUsageParams, 
  CouponUsageReport,
  CouponUsageResponse 
}; 