"use server";

import { createClient } from "@/lib/supabase/server";

type DeleteCouponResult =
  | { success: true; message: string }
  | { success: false; error: string };

export async function deleteCoupon(couponId: number): Promise<DeleteCouponResult> {
  try {
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

    // Kiểm tra authorization - chỉ admin mới có thể xóa coupon
    const { data: userRole, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleError || userRole?.role !== "admin") {
      return {
        success: false,
        error: "Chỉ admin mới có thể xóa coupon",
      };
    }

    // Kiểm tra coupon có tồn tại không
    const { data: existingCoupon, error: checkError } = await supabase
      .from("coupons")
      .select("id, code, used_count")
      .eq("id", couponId)
      .single();

    if (checkError || !existingCoupon) {
      return {
        success: false,
        error: "Coupon không tồn tại",
      };
    }

    // Kiểm tra xem coupon đã được sử dụng chưa
    if (existingCoupon.used_count > 0) {
      return {
        success: false,
        error: "Không thể xóa coupon đã được sử dụng",
      };
    }

    // Kiểm tra xem có đơn hàng nào đang sử dụng coupon này không
    const { data: ordersWithCoupon, error: orderError } = await supabase
      .from("orders")
      .select("id")
      .eq("coupon_id", couponId)
      .limit(1);

    if (orderError) {
      return {
        success: false,
        error: "Lỗi khi kiểm tra đơn hàng liên quan",
      };
    }

    if (ordersWithCoupon && ordersWithCoupon.length > 0) {
      return {
        success: false,
        error: "Không thể xóa coupon đã được sử dụng trong đơn hàng",
      };
    }

    // Xóa coupon
    const { error: deleteError } = await supabase
      .from("coupons")
      .delete()
      .eq("id", couponId);

    if (deleteError) {
      return {
        success: false,
        error: deleteError.message,
      };
    }

    return {
      success: true,
      message: `Coupon ${existingCoupon.code} đã được xóa thành công`,
    };
  } catch {
    return {
      success: false,
      error: "Đã xảy ra lỗi không mong muốn khi xóa coupon",
    };
  }
} 