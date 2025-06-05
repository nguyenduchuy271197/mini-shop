"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import { validateCoupon } from "@/actions/admin/coupons/validate-coupon";
import { Coupon } from "@/types/custom.types";

interface UseValidateCouponParams {
  couponCode: string;
  cartTotal: number;
}

interface CouponValidation {
  isValid: boolean;
  coupon?: Coupon;
  discountAmount?: number;
  finalTotal?: number;
  reason?: string;
}

interface ValidateCouponResponse {
  success: true;
  validation: CouponValidation;
}

export function useValidateCoupon(params: UseValidateCouponParams) {
  return useQuery({
    queryKey: QUERY_KEYS.coupons.validation(params.couponCode),
    queryFn: async () => {
      const result = await validateCoupon(params.couponCode, params.cartTotal);

      if (!result.success) {
        throw new Error(result.error);
      }

      return result as ValidateCouponResponse;
    },
    retry: (failureCount, error) => {
      // Don't retry on authorization errors
      if (error.message.includes("chưa được xác thực")) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 1000 * 30, // Cache for 30 seconds (coupon validation can change quickly)
    enabled: !!(params.couponCode && params.cartTotal >= 0),
  });
}

export type { 
  UseValidateCouponParams, 
  CouponValidation,
  ValidateCouponResponse 
}; 