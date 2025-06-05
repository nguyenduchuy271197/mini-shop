"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { applyCoupon } from "@/actions/admin/coupons/apply-coupon";
import { useToast } from "@/hooks/use-toast";
import { QUERY_KEYS } from "@/lib/query-keys";
import { Coupon } from "@/types/custom.types";

interface ApplyCouponData {
  couponCode: string;
}

interface ApplyCouponResponse {
  success: true;
  message: string;
  coupon: Coupon;
  appliedAt: string;
}

interface UseApplyCouponOptions {
  onSuccess?: (result: ApplyCouponResponse) => void;
  onError?: (error: string) => void;
}

function isClientError(error: Error): boolean {
  return error.message.includes("Mã coupon không được để trống") ||
         error.message.includes("Giỏ hàng trống") ||
         error.message.includes("Mã coupon không tồn tại") ||
         error.message.includes("Mã coupon đã bị vô hiệu hóa") ||
         error.message.includes("Mã coupon chưa có hiệu lực") ||
         error.message.includes("Mã coupon đã hết hạn") ||
         error.message.includes("Mã coupon đã hết lượt sử dụng") ||
         error.message.includes("Đơn hàng tối thiểu") ||
         error.message.includes("chưa được xác thực");
}

export function useApplyCoupon(options: UseApplyCouponOptions = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ couponCode }: ApplyCouponData) => {
      const result = await applyCoupon(couponCode);

      if (!result.success) {
        throw new Error(result.error);
      }

      return result as ApplyCouponResponse;
    },
    onSuccess: (result) => {
      // Show success toast
      toast({
        title: "Áp dụng coupon thành công",
        description: result.message,
      });

      // Invalidate cart-related queries to refresh totals
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.cart.all,
      });

      // Update coupon usage if in admin context
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.admin.coupons.usage(result.coupon.id),
      });

      options.onSuccess?.(result);
    },
    onError: (error: Error) => {
      const isClientErr = isClientError(error);
      
      toast({
        title: isClientErr ? "Không thể áp dụng coupon" : "Lỗi hệ thống",
        description: error.message,
        variant: "destructive",
      });

      options.onError?.(error.message);
    },
    retry: (failureCount, error) => {
      // Don't retry on client errors (validation, coupon rules, etc.)
      if (isClientError(error as Error)) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export type { 
  ApplyCouponData, 
  ApplyCouponResponse,
  UseApplyCouponOptions 
}; 