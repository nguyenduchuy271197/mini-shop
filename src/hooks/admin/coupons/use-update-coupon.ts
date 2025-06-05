"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCoupon } from "@/actions/admin/coupons/update-coupon";
import { useToast } from "@/hooks/use-toast";
import { QUERY_KEYS } from "@/lib/query-keys";
import { Coupon } from "@/types/custom.types";

interface UpdateCouponData {
  couponId: number;
  data: {
    name?: string;
    type?: "percentage" | "fixed_amount";
    value?: number;
    minimum_amount?: number;
    maximum_discount?: number;
    usage_limit?: number;
    is_active?: boolean;
    starts_at?: string;
    expires_at?: string;
  };
}

interface UpdateCouponResponse {
  success: true;
  message: string;
  coupon: Coupon;
}

interface UseUpdateCouponOptions {
  onSuccess?: (result: UpdateCouponResponse) => void;
  onError?: (error: string) => void;
}

function isClientError(error: Error): boolean {
  return error.message.includes("Tên coupon phải có ít nhất") ||
         error.message.includes("Loại coupon không hợp lệ") ||
         error.message.includes("Giá trị coupon phải lớn hơn 0") ||
         error.message.includes("Số tiền tối thiểu") ||
         error.message.includes("Giảm giá tối đa") ||
         error.message.includes("Giới hạn sử dụng") ||
         error.message.includes("Trạng thái hoạt động") ||
         error.message.includes("Ngày bắt đầu không hợp lệ") ||
         error.message.includes("Ngày hết hạn không hợp lệ") ||
         error.message.includes("Ngày hết hạn phải sau ngày bắt đầu") ||
         error.message.includes("Coupon không tồn tại") ||
         error.message.includes("chưa được xác thực") ||
         error.message.includes("Chỉ admin");
}

export function useUpdateCoupon(options: UseUpdateCouponOptions = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ couponId, data }: UpdateCouponData) => {
      const result = await updateCoupon(couponId, data);

      if (!result.success) {
        throw new Error(result.error);
      }

      return result as UpdateCouponResponse;
    },
    onSuccess: (result) => {
      // Show success toast
      toast({
        title: "Cập nhật coupon thành công",
        description: result.message,
      });

      // Invalidate and refetch admin coupons list
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.admin.coupons.all,
      });

      // Also invalidate coupon usage reports if they exist
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.admin.coupons.usage(result.coupon.id),
      });

      options.onSuccess?.(result);
    },
    onError: (error: Error) => {
      const isClientErr = isClientError(error);
      
      toast({
        title: isClientErr ? "Không thể cập nhật coupon" : "Lỗi hệ thống",
        description: error.message,
        variant: "destructive",
      });

      options.onError?.(error.message);
    },
    retry: (failureCount, error) => {
      // Don't retry on client errors (validation, authorization, etc.)
      if (isClientError(error as Error)) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export type { 
  UpdateCouponData, 
  UpdateCouponResponse,
  UseUpdateCouponOptions 
}; 