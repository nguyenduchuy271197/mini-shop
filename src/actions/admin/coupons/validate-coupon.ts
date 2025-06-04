"use server";

import { createClient } from "@/lib/supabase/server";
import { Coupon } from "@/types/custom.types";
import { z } from "zod";

// Schema validation cho validate coupon
const validateCouponSchema = z.object({
  couponCode: z.string().min(1, "Mã coupon không được để trống"),
  cartTotal: z.number().min(0, "Tổng giá trị giỏ hàng phải lớn hơn hoặc bằng 0"),
});

type CouponValidation = {
  isValid: boolean;
  coupon?: Coupon;
  discountAmount?: number;
  finalTotal?: number;
  reason?: string;
};

type ValidateCouponResult =
  | { success: true; validation: CouponValidation }
  | { success: false; error: string };

export async function validateCoupon(
  couponCode: string,
  cartTotal: number
): Promise<ValidateCouponResult> {
  try {
    // Validate input
    const validatedData = validateCouponSchema.parse({ couponCode, cartTotal });

    const supabase = createClient();

    // Kiểm tra authentication
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "Người dùng chưa được xác thực",
      };
    }

    // Tìm coupon theo code
    const { data: coupon, error: couponError } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", validatedData.couponCode.toUpperCase())
      .single();

    if (couponError || !coupon) {
      return {
        success: true,
        validation: {
          isValid: false,
          reason: "Mã coupon không tồn tại",
        },
      };
    }

    // Kiểm tra coupon có đang hoạt động không
    if (!coupon.is_active) {
      return {
        success: true,
        validation: {
          isValid: false,
          coupon,
          reason: "Mã coupon đã bị vô hiệu hóa",
        },
      };
    }

    // Kiểm tra thời gian hiệu lực
    const now = new Date();
    const startsAt = new Date(coupon.starts_at);
    const expiresAt = coupon.expires_at ? new Date(coupon.expires_at) : null;

    if (now < startsAt) {
      return {
        success: true,
        validation: {
          isValid: false,
          coupon,
          reason: "Mã coupon chưa có hiệu lực",
        },
      };
    }

    if (expiresAt && now > expiresAt) {
      return {
        success: true,
        validation: {
          isValid: false,
          coupon,
          reason: "Mã coupon đã hết hạn",
        },
      };
    }

    // Kiểm tra giới hạn sử dụng
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return {
        success: true,
        validation: {
          isValid: false,
          coupon,
          reason: "Mã coupon đã hết lượt sử dụng",
        },
      };
    }

    // Kiểm tra số tiền tối thiểu
    if (coupon.minimum_amount && validatedData.cartTotal < coupon.minimum_amount) {
      return {
        success: true,
        validation: {
          isValid: false,
          coupon,
          reason: `Đơn hàng tối thiểu ${coupon.minimum_amount.toLocaleString('vi-VN')}đ để sử dụng mã này`,
        },
      };
    }

    // Kiểm tra user đã sử dụng coupon này chưa (nếu là single-use per user)
    // Note: Có thể thêm logic này sau nếu cần thiết

    // Tính toán giảm giá
    let discountAmount = 0;
    if (coupon.type === "percentage") {
      discountAmount = (validatedData.cartTotal * coupon.value) / 100;
      // Áp dụng giảm giá tối đa nếu có
      if (coupon.maximum_discount && discountAmount > coupon.maximum_discount) {
        discountAmount = coupon.maximum_discount;
      }
    } else if (coupon.type === "fixed_amount") {
      discountAmount = Math.min(coupon.value, validatedData.cartTotal);
    }

    const finalTotal = Math.max(0, validatedData.cartTotal - discountAmount);

    return {
      success: true,
      validation: {
        isValid: true,
        coupon,
        discountAmount,
        finalTotal,
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      };
    }

    return {
      success: false,
      error: "Đã xảy ra lỗi không mong muốn khi kiểm tra coupon",
    };
  }
} 