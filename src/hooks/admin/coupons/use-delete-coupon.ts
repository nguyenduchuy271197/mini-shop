"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCoupon } from "@/actions/admin/coupons/delete-coupon";
import { useToast } from "@/hooks/use-toast";
import { QUERY_KEYS } from "@/lib/query-keys";

interface DeleteCouponData {
  couponId: number;
}

interface DeleteCouponResponse {
  success: true;
  message: string;
}

interface UseDeleteCouponOptions {
  onSuccess?: (result: DeleteCouponResponse) => void;
  onError?: (error: string) => void;
}

function isClientError(error: Error): boolean {
  return error.message.includes("Coupon không tồn tại") ||
         error.message.includes("Không thể xóa coupon đã được sử dụng") ||
         error.message.includes("Không thể xóa coupon đã được sử dụng trong đơn hàng") ||
         error.message.includes("chưa được xác thực") ||
         error.message.includes("Chỉ admin");
}

export function useDeleteCoupon(options: UseDeleteCouponOptions = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ couponId }: DeleteCouponData) => {
      const result = await deleteCoupon(couponId);

      if (!result.success) {
        throw new Error(result.error);
      }

      return result as DeleteCouponResponse;
    },
    onSuccess: (result) => {
      // Show success toast
      toast({
        title: "Xóa coupon thành công",
        description: result.message,
      });

      // Invalidate and refetch admin coupons list
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.admin.coupons.all,
      });

      options.onSuccess?.(result);
    },
    onError: (error: Error) => {
      const isClientErr = isClientError(error);
      
      toast({
        title: isClientErr ? "Không thể xóa coupon" : "Lỗi hệ thống",
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
  DeleteCouponData, 
  DeleteCouponResponse,
  UseDeleteCouponOptions 
}; 