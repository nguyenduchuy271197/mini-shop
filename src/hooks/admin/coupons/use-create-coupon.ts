"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCoupon } from "@/actions/admin/coupons/create-coupon";
import { useToast } from "@/hooks/use-toast";
import { QUERY_KEYS } from "@/lib/query-keys";
import { Coupon } from "@/types/custom.types";

interface CreateCouponData {
  code: string;
  name: string;
  type: "percentage" | "fixed_amount";
  value: number;
  minimum_amount?: number;
  maximum_discount?: number;
  usage_limit?: number;
  starts_at?: string;
  expires_at?: string;
}

interface CreateCouponResponse {
  success: true;
  message: string;
  coupon: Coupon;
}

interface UseCreateCouponOptions {
  onSuccess?: (result: CreateCouponResponse) => void;
  onError?: (error: string) => void;
}

function isClientError(error: Error): boolean {
  return error.message.includes("Mã coupon phải có ít nhất") ||
         error.message.includes("Tên coupon phải có ít nhất") ||
         error.message.includes("Loại coupon") ||
         error.message.includes("Giá trị coupon phải lớn hơn 0") ||
         error.message.includes("Số tiền tối thiểu") ||
         error.message.includes("Giảm giá tối đa") ||
         error.message.includes("Giới hạn sử dụng") ||
         error.message.includes("Ngày bắt đầu không hợp lệ") ||
         error.message.includes("Ngày hết hạn không hợp lệ") ||
         error.message.includes("Ngày hết hạn phải sau ngày bắt đầu") ||
         error.message.includes("Mã coupon đã tồn tại") ||
         error.message.includes("chưa được xác thực") ||
         error.message.includes("Chỉ admin");
}

export function useCreateCoupon(options: UseCreateCouponOptions = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCouponData) => {
      const result = await createCoupon(data);

      if (!result.success) {
        throw new Error(result.error);
      }

      return result as CreateCouponResponse;
    },
    onSuccess: (result) => {
      // Show success toast
      toast({
        title: "Tạo coupon thành công",
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
        title: isClientErr ? "Không thể tạo coupon" : "Lỗi hệ thống", 
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
  CreateCouponData, 
  CreateCouponResponse,
  UseCreateCouponOptions 
}; 