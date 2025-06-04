"use server";

import { createClient } from "@/lib/supabase/server";
import { Coupon } from "@/types/custom.types";
import { z } from "zod";

// Schema validation cho apply coupon
const applyCouponSchema = z.object({
  couponCode: z.string().min(1, "Mã coupon không được để trống"),
});

type ApplyCouponResult =
  | { 
      success: true; 
      message: string;
      coupon: Coupon;
      appliedAt: string;
    }
  | { success: false; error: string };

export async function applyCoupon(
  couponCode: string
): Promise<ApplyCouponResult> {
  try {
    // Validate input
    const validatedData = applyCouponSchema.parse({ couponCode });

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

    // Kiểm tra user có giỏ hàng không
    const { data: cartItems, error: cartError } = await supabase
      .from("cart_items")
      .select(`
        *,
        products (
          id,
          name,
          price,
          stock_quantity
        )
      `)
      .eq("user_id", user.id);

    if (cartError) {
      return {
        success: false,
        error: "Lỗi khi kiểm tra giỏ hàng",
      };
    }

    if (!cartItems || cartItems.length === 0) {
      return {
        success: false,
        error: "Giỏ hàng trống, không thể áp dụng coupon",
      };
    }

    // Tính tổng giá trị giỏ hàng
    const cartTotal = cartItems.reduce((total, item) => {
      const product = item.products;
      if (!product) return total;
      return total + (product.price * item.quantity);
    }, 0);

    // Tìm coupon theo code
    const { data: coupon, error: couponError } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", validatedData.couponCode.toUpperCase())
      .single();

    if (couponError || !coupon) {
      return {
        success: false,
        error: "Mã coupon không tồn tại",
      };
    }

    // Kiểm tra coupon có đang hoạt động không
    if (!coupon.is_active) {
      return {
        success: false,
        error: "Mã coupon đã bị vô hiệu hóa",
      };
    }

    // Kiểm tra thời gian hiệu lực
    const now = new Date();
    const startsAt = new Date(coupon.starts_at);
    const expiresAt = coupon.expires_at ? new Date(coupon.expires_at) : null;

    if (now < startsAt) {
      return {
        success: false,
        error: "Mã coupon chưa có hiệu lực",
      };
    }

    if (expiresAt && now > expiresAt) {
      return {
        success: false,
        error: "Mã coupon đã hết hạn",
      };
    }

    // Kiểm tra giới hạn sử dụng
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return {
        success: false,
        error: "Mã coupon đã hết lượt sử dụng",
      };
    }

    // Kiểm tra số tiền tối thiểu
    if (coupon.minimum_amount && cartTotal < coupon.minimum_amount) {
      return {
        success: false,
        error: `Đơn hàng tối thiểu ${coupon.minimum_amount.toLocaleString('vi-VN')}đ để sử dụng mã này`,
      };
    }

    // Kiểm tra user đã áp dụng coupon nào khác chưa
    // (Giả sử chỉ được áp dụng 1 coupon tại một thời điểm)
    // Logic này có thể được implement bằng cách lưu coupon code vào session
    // hoặc một bảng riêng để track applied coupons

    // Tính toán giảm giá
    let discountAmount = 0;
    if (coupon.type === "percentage") {
      discountAmount = (cartTotal * coupon.value) / 100;
      // Áp dụng giảm giá tối đa nếu có
      if (coupon.maximum_discount && discountAmount > coupon.maximum_discount) {
        discountAmount = coupon.maximum_discount;
      }
    } else if (coupon.type === "fixed_amount") {
      discountAmount = Math.min(coupon.value, cartTotal);
    }

    // Lưu trữ thông tin coupon đã áp dụng
    // Note: Trong thực tế, bạn có thể muốn lưu vào session, cookie, 
    // hoặc tạo một bảng applied_coupons để track
    
    const appliedAt = new Date().toISOString();

    return {
      success: true,
      message: `Đã áp dụng mã coupon ${coupon.code}. Giảm ${discountAmount.toLocaleString('vi-VN')}đ`,
      coupon,
      appliedAt,
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
      error: "Đã xảy ra lỗi không mong muốn khi áp dụng coupon",
    };
  }
} 