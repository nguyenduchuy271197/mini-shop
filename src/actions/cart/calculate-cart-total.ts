"use server";

import { createClient } from "@/lib/supabase/server";
import { Coupon } from "@/types/custom.types";
import { z } from "zod";

// Validation schema
const calculateCartTotalSchema = z.object({
  couponCode: z.string().optional(),
});

type CalculateCartTotalData = z.infer<typeof calculateCartTotalSchema>;

// Cart total breakdown type
type CartTotalBreakdown = {
  subtotal: number;
  discountAmount: number;
  total: number;
  appliedCoupon?: Pick<Coupon, "id" | "code" | "name" | "type" | "value"> | null;
};

// Return type
type CalculateCartTotalResult =
  | { success: true; breakdown: CartTotalBreakdown }
  | { success: false; error: string };

export async function calculateCartTotal(data?: CalculateCartTotalData): Promise<CalculateCartTotalResult> {
  try {
    // 1. Validate input
    const { couponCode } = data ? calculateCartTotalSchema.parse(data) : { couponCode: undefined };

    // 2. Create Supabase client
    const supabase = createClient();

    // 3. Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "Bạn cần đăng nhập để tính tổng giỏ hàng",
      };
    }

    // 4. Get cart items with product details
    const { data: cartItems, error: cartError } = await supabase
      .from("cart_items")
      .select(`
        *,
        product:products!inner (
          id,
          price,
          is_active
        )
      `)
      .eq("user_id", user.id);

    if (cartError) {
      return {
        success: false,
        error: cartError.message || "Không thể lấy thông tin giỏ hàng",
      };
    }

    if (!cartItems || cartItems.length === 0) {
      return {
        success: true,
        breakdown: {
          subtotal: 0,
          discountAmount: 0,
          total: 0,
        },
      };
    }

    // 5. Calculate subtotal (only active products)
    const subtotal = cartItems
      .filter(item => item.product?.is_active)
      .reduce((sum, item) => {
        if (item.product) {
          return sum + (item.quantity * item.product.price);
        }
        return sum;
      }, 0);

    if (subtotal === 0) {
      return {
        success: true,
        breakdown: {
          subtotal: 0,
          discountAmount: 0,
          total: 0,
        },
      };
    }

    let discountAmount = 0;
    let appliedCoupon: Pick<Coupon, "id" | "code" | "name" | "type" | "value"> | null = null;

    // 6. Apply coupon discount if provided
    if (couponCode) {
      const { data: coupon, error: couponError } = await supabase
        .from("coupons")
        .select("id, code, name, type, value, minimum_amount, maximum_discount, usage_limit, used_count, is_active, starts_at, expires_at")
        .eq("code", couponCode.toUpperCase())
        .eq("is_active", true)
        .single();

      if (couponError && couponError.code !== "PGRST116") {
        return {
          success: false,
          error: "Không thể kiểm tra mã giảm giá",
        };
      }

      if (!coupon) {
        return {
          success: false,
          error: "Mã giảm giá không hợp lệ hoặc đã hết hạn",
        };
      }

      // Validate coupon conditions
      const now = new Date();
      const startsAt = new Date(coupon.starts_at);
      const expiresAt = coupon.expires_at ? new Date(coupon.expires_at) : null;

      // Check if coupon is within valid date range
      if (now < startsAt) {
        return {
          success: false,
          error: "Mã giảm giá chưa có hiệu lực",
        };
      }

      if (expiresAt && now > expiresAt) {
        return {
          success: false,
          error: "Mã giảm giá đã hết hạn",
        };
      }

      // Check usage limit
      if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
        return {
          success: false,
          error: "Mã giảm giá đã hết lượt sử dụng",
        };
      }

      // Check minimum amount
      if (coupon.minimum_amount && subtotal < coupon.minimum_amount) {
        return {
          success: false,
          error: `Đơn hàng tối thiểu ${coupon.minimum_amount.toLocaleString('vi-VN')}₫ để sử dụng mã giảm giá`,
        };
      }

      // Calculate discount
      if (coupon.type === "percentage") {
        discountAmount = (subtotal * coupon.value) / 100;
        if (coupon.maximum_discount && discountAmount > coupon.maximum_discount) {
          discountAmount = coupon.maximum_discount;
        }
      } else if (coupon.type === "fixed_amount") {
        discountAmount = Math.min(coupon.value, subtotal);
      }

      appliedCoupon = {
        id: coupon.id,
        code: coupon.code,
        name: coupon.name,
        type: coupon.type,
        value: coupon.value,
      };
    }

    // 7. Calculate final total
    const total = Math.max(0, subtotal - discountAmount);

    const breakdown: CartTotalBreakdown = {
      subtotal,
      discountAmount,
      total,
      appliedCoupon,
    };

    return {
      success: true,
      breakdown,
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
      error: "Đã xảy ra lỗi không mong muốn khi tính tổng giỏ hàng",
    };
  }
} 